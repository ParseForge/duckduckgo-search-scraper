import { Actor, log } from 'apify';
import c from 'chalk';
import * as cheerio from 'cheerio';
import { Impit } from 'impit';

interface Input {
    maxItems?: number;
    queries?: string[];
    region?: string;
    timeRange?: '' | 'd' | 'w' | 'm' | 'y';
    safeSearch?: 'off' | 'moderate' | 'strict';
}

const STARTUP = ['🦆 Querying DuckDuckGo HTML…', '🌐 Pulling DuckDuckGo organic results…', '📊 Crawling DDG SERPs…'];
const DONE = ['🎉 DuckDuckGo results delivered.', '✅ SERP harvest complete.', '🚀 Search export ready.'];
const pick = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)] ?? arr[0]!;

const SAFE_MAP: Record<string, string> = { off: '-2', moderate: '-1', strict: '1' };

await Actor.init();
const input = (await Actor.getInput<Input>()) ?? {};
const userIsPaying = Boolean(Actor.getEnv()?.userIsPaying);
const isPayPerEvent = Actor.getChargingManager().getPricingInfo().isPayPerEvent;

let effectiveMaxItems = input.maxItems ?? 10;
if (!userIsPaying) {
    if (!effectiveMaxItems || effectiveMaxItems > 10) {
        effectiveMaxItems = 10;
        log.warning([
            '',
            `${c.dim('        *  .  ✦        .    *       .')}`,
            `${c.dim('  .        *')}    🛰️  ${c.dim('.        *   .    ✦')}`,
            `${c.dim('     ✦  .        .       *        .')}`,
            '',
            `${c.yellow("  You're on a free plan — limited to 10 items.")}`,
            `${c.cyan('  Upgrade to a paid plan for up to 1,000,000 items.')}`,
            '',
            `  ✦ ${c.green.underline('https://console.apify.com/sign-up?fpr=vmoqkp')}`,
            '',
        ].join('\n'));
    }
}

const queries = (input.queries && input.queries.length ? input.queries : ['apify scraper']).map((q) => q.trim()).filter(Boolean);
const region = input.region ?? 'us-en';
const timeRange = input.timeRange ?? '';
const safe = SAFE_MAP[input.safeSearch ?? 'moderate'] ?? '-1';

console.log(c.cyan('\n🛰️  Arguments:'));
console.log(c.green(`   🟩 queries : [${queries.length}] ${queries.slice(0, 3).join(', ')}${queries.length > 3 ? '…' : ''}`));
console.log(c.green(`   🟩 region : ${region}`));
console.log(c.green(`   🟩 maxItems : ${effectiveMaxItems}`));
console.log('');
console.log(c.magenta(`📬 ${pick(STARTUP)}\n`));

const proxyConfig = await Actor.createProxyConfiguration({ groups: ['RESIDENTIAL'], countryCode: 'US' }).catch(() => null);
const proxyUrl = proxyConfig ? await proxyConfig.newUrl() : undefined;
const impit = new Impit({ browser: 'chrome', proxyUrl });

function decodeRedirect(href: string): string {
    if (!href) return '';
    if (href.startsWith('//duckduckgo.com/l/?uddg=')) {
        const u = new URL(`https:${href}`);
        const target = u.searchParams.get('uddg');
        return target ? decodeURIComponent(target) : href;
    }
    if (href.startsWith('//')) return `https:${href}`;
    return href;
}

function parseResults(html: string, query: string, startRank: number): any[] {
    const $ = cheerio.load(html);
    const items: any[] = [];
    let rank = startRank;
    $('.result, .web-result').each((_, el) => {
        const $el = $(el);
        if ($el.find('.result--ad').length > 0) return; // skip ads
        const titleA = $el.find('.result__a').first();
        const title = titleA.text().trim();
        const href = titleA.attr('href') ?? '';
        const url = decodeRedirect(href);
        if (!title || !url) return;
        const snippet = $el.find('.result__snippet').first().text().trim() || null;
        const displayedUrl = $el.find('.result__url').first().text().trim() || null;
        items.push({
            query,
            rank,
            title,
            url,
            displayedUrl,
            snippet,
            scrapedAt: new Date().toISOString(),
        });
        rank += 1;
    });
    return items;
}

let pushed = 0;
for (const q of queries) {
    if (pushed >= effectiveMaxItems) break;
    let attempts = 0;
    while (pushed < effectiveMaxItems && attempts < 5) {
        log.info(`📡 [${q}]…`);
        try {
            const params = new URLSearchParams({ q, kl: region });
            if (timeRange) params.set('df', timeRange);
            params.set('kp', safe);
            const r = await impit.fetch(`https://html.duckduckgo.com/html/?${params.toString()}`, {
                headers: {
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'accept-language': 'en-US,en;q=0.9',
                    'referer': 'https://html.duckduckgo.com/',
                },
            });
            const html = await r.text();
            if (html.length < 5000) {
                log.warning(`   thin response (${html.length} bytes), retrying…`);
                attempts += 1;
                await new Promise((res) => setTimeout(res, 2000));
                continue;
            }
            const results = parseResults(html, q, pushed + 1);
            if (!results.length) {
                log.info(`   no results for "${q}"`);
                break;
            }
            for (const item of results) {
                if (pushed >= effectiveMaxItems) break;
                if (isPayPerEvent) await Actor.pushData([item], 'result-item');
                else await Actor.pushData([item]);
                pushed += 1;
            }
            break; // single page returns ~30 results, plenty
        } catch (err: any) {
            log.warning(`   ${err.message}`);
            attempts += 1;
            await new Promise((res) => setTimeout(res, 2000));
        }
    }
}

if (pushed === 0) await Actor.pushData([{ error: 'No results returned from DuckDuckGo.' }]);
log.info(c.green(`✅ Pushed ${pushed} results`));
console.log(c.magenta(`\n${pick(DONE)}`));
await Actor.exit();
