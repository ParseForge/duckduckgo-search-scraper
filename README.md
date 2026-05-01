![ParseForge Banner](https://github.com/ParseForge/apify-assets/blob/ad35ccc13ddd068b9d6cba33f323962e39aed5b2/banner.jpg?raw=true)

# 🦆 DuckDuckGo Search Scraper

> 🚀 **Pull DuckDuckGo organic search results with privacy-first defaults.** Region, time-range, and safe-search filters. Pagination past 100 results per query. No tracking, no API key.

> 🕒 **Last updated:** 2026-05-01 · **📊 7 fields** per result · **🌍 50+ regions** · **🔄 paginated to 100+** · **🦆 100M+ daily searches**

The **DuckDuckGo Search Scraper** queries the public DuckDuckGo HTML endpoint and returns the ranked organic results page with title, source URL, displayed URL, and snippet. The Actor decodes the DDG redirect wrapper so you get clean destination URLs and paginates through the offset parameter to reach well past 100 organic listings per query.

DuckDuckGo serves more than 100 million searches per day and is the default privacy alternative for journalists, security teams, and lawyers. Because DDG blends results from a different signal mix than Google or Bing, certain listings surface here that competitors bury, especially in newer or niche topics. This Actor exposes that data cleanly with region and time-range filters.

| 🎯 Target Audience | 💡 Primary Use Cases |
|---|---|
| Privacy researchers, SEO teams, journalists, security analysts, OSINT teams | Alternative SERP tracking, regional comparison, niche topic discovery, OSINT lookups |

---

## 📋 What the DuckDuckGo Search Scraper does

Five filtering workflows in a single run:

- 🔍 **Multi-query batches.** Submit a list of queries, the Actor runs each as a separate search.
- 🌍 **Region filter.** DDG's `kl` parameter routes the query through that regional index.
- 📅 **Time-range filter.** Restrict to last day, week, month, or year using DDG's `df` parameter.
- 🛡️ **Safe-search filter.** Strict, moderate, or off via the `kp` parameter.
- 🔄 **Pagination.** Walks past the first 30 results using offset increments and rotates proxies between pages.

Each row reports the originating query, rank position, title, decoded source URL, displayed URL, and the snippet text DDG renders under the title.

> 💡 **Why it matters:** DuckDuckGo treats every visitor identically because it does not personalize on cookies or IP. That is exactly what SEO researchers want when they need a non-personalized rank snapshot. Privacy-conscious audiences also use DDG as their default, so a brand's DDG visibility matters in healthcare, legal, and finance.

---

## 🎬 Full Demo

_🚧 Coming soon: a 3-minute walkthrough showing how to go from sign-up to a downloaded dataset._

---

## ⚙️ Input

<table>
<thead>
<tr><th>Input</th><th>Type</th><th>Default</th><th>Behavior</th></tr>
</thead>
<tbody>
<tr><td><code>maxItems</code></td><td>integer</td><td><code>10</code></td><td>Results to return. Free plan caps at 10, paid plan at 1,000,000.</td></tr>
<tr><td><code>queries</code></td><td>array of strings</td><td><code>["apify scraper"]</code></td><td>One or more search queries.</td></tr>
<tr><td><code>region</code></td><td>string</td><td><code>"us-en"</code></td><td>DDG region code like <code>us-en</code>, <code>de-de</code>, <code>fr-fr</code>.</td></tr>
<tr><td><code>timeRange</code></td><td>string</td><td>empty</td><td><code>d</code>, <code>w</code>, <code>m</code>, or <code>y</code> for last day, week, month, year.</td></tr>
<tr><td><code>safeSearch</code></td><td>string</td><td><code>"moderate"</code></td><td><code>strict</code>, <code>moderate</code>, or <code>off</code>.</td></tr>
</tbody>
</table>

**Example: 100 organic results for "web scraping" in the US.**

```json
{
    "maxItems": 100,
    "queries": ["web scraping"],
    "region": "us-en"
}
```

**Example: this-week results for two queries in Germany.**

```json
{
    "maxItems": 60,
    "queries": ["KI Agenten", "Web Scraping API"],
    "region": "de-de",
    "timeRange": "w"
}
```

> ⚠️ **Good to Know:** the Actor decodes DDG's `/l/?uddg=...` redirect wrapper so the `url` field contains the actual destination domain. Pagination beyond 30 results uses POST with offset; the Actor handles this automatically with proxy rotation between pages.

---

## 📊 Output

Each result row contains **7 fields**. Download as CSV, Excel, JSON, or XML.

### 🧾 Schema

| Field | Type | Example |
|---|---|---|
| 🔍 `query` | string | `"web scraping"` |
| 🏆 `rank` | integer | `1` |
| 📰 `title` | string | `"What is Web Scraping and How to Use It? - GeeksforGeeks"` |
| 🔗 `url` | string | `"https://www.geeksforgeeks.org/blogs/..."` |
| 🌐 `displayedUrl` | string | `"www.geeksforgeeks.org/blogs/..."` |
| 📝 `snippet` | string | `"Web scraping is an automated method to extract..."` |
| 🕒 `scrapedAt` | ISO 8601 | `"2026-05-01T01:15:39.046Z"` |

### 📦 Sample records

<details>
<summary><strong>📚 Educational source: GeeksforGeeks</strong></summary>

```json
{
    "query": "web scraping",
    "rank": 1,
    "title": "What is Web Scraping and How to Use It? - GeeksforGeeks",
    "url": "https://www.geeksforgeeks.org/blogs/what-is-web-scraping-and-how-to-use-it/",
    "displayedUrl": "www.geeksforgeeks.org/blogs/what-is-web-scraping-and-how-to-use-it/",
    "snippet": "Web scraping is an automated method to extract large amounts of data from websites. This data, usually in HTML format, is converted into structured formats like spreadsheets or databases...",
    "scrapedAt": "2026-05-01T01:15:39.046Z"
}
```

</details>

<details>
<summary><strong>📖 Wikipedia article ranking high on a generic term</strong></summary>

```json
{
    "query": "web scraping",
    "rank": 2,
    "title": "Web scraping - Wikipedia",
    "url": "https://en.wikipedia.org/wiki/Web_scraping",
    "displayedUrl": "en.wikipedia.org/wiki/Web_scraping",
    "snippet": "Web scraping is data extraction from websites using automated processes. Learn about its origins, methods, applications, and challenges from this comprehensive Wikipedia article.",
    "scrapedAt": "2026-05-01T01:15:39.047Z"
}
```

</details>

<details>
<summary><strong>🌐 Result from a multi-query run with rank reset per query</strong></summary>

```json
{
    "query": "apify scraper",
    "rank": 1,
    "title": "Apify Store",
    "url": "https://apify.com/store",
    "displayedUrl": "apify.com/store",
    "snippet": "Build, deploy, and monetize web scrapers and AI agents on Apify",
    "scrapedAt": "2026-05-01T01:15:42.110Z"
}
```

</details>

---

## ✨ Why choose this Actor

| | Capability |
|---|---|
| 🔒 | **Privacy-first source.** DDG does not personalize on cookies or IP, so rankings are stable across users. |
| 🔄 | **Past page 1.** Offset pagination plus proxy rotation reaches 100+ organic results per query. |
| 🌍 | **50+ regional indexes.** Aligns with the audience's actual regional search defaults. |
| 📅 | **Time-range slice.** Day, week, month, year windows for fresh content tracking. |
| 📦 | **Multi-query batching.** Submit dozens of queries per run. |
| 🔗 | **Decoded URLs.** No DDG redirect wrappers in the output. |
| 🛡️ | **Anti-bot handled.** Proxy rotation per page keeps single-IP throttling at bay. |

> 📊 In a single 31-second run the Actor returned 100 organic results for the query "web scraping".

---

## 📈 How it compares to alternatives

| Approach | Cost | Coverage | Refresh | Filters | Setup |
|---|---|---|---|---|---|
| Direct browser scraping | Free | Hits captchas | Live | Manual | Engineer hours |
| Paid SERP APIs | $$$ subscription | Full | Live | Built-in | Account setup |
| Generic search-data brokers | $$ subscription | Aggregated | Daily | Limited | Account setup |
| **⭐ DuckDuckGo Search Scraper** *(this Actor)* | Pay-per-event | Past page 1 | Live | Region, time, safe-search | None |

Same data the DDG SERP serves, exposed as clean records with redirect wrappers decoded.

---

## 🚀 How to use

1. 🆓 **Create a free Apify account.** [Sign up here](https://console.apify.com/sign-up?fpr=vmoqkp) and get $5 in free credit.
2. 🔍 **Open the Actor.** Search for "DuckDuckGo Search" in the Apify Store.
3. ⚙️ **Set queries and filters.** Add queries, pick region and time range.
4. ▶️ **Click Start.** A 100-result run typically completes in 25 to 45 seconds.
5. 📥 **Download.** Export as CSV, Excel, JSON, or XML.

> ⏱️ Total time from sign-up to first dataset: under five minutes.

---

## 💼 Business use cases

<table>
<tr>
<td width="50%">

### 📈 SEO & content
- Capture a non-personalized rank snapshot
- Track DDG visibility for privacy-sensitive audiences
- Monitor regional rank differences across 50+ markets
- Audit how DDG resurfaces older evergreen content

</td>
<td width="50%">

### 🛡️ Brand & OSINT
- Detect impersonation pages on a non-Google index
- Cross-reference Google rank with DDG rank to spot anomalies
- Run OSINT lookups without leaking searcher identity
- Audit reputation across privacy-respecting search

</td>
</tr>
<tr>
<td width="50%">

### ⚖️ Legal & finance
- Reproducible SERP snapshots for case research
- Track how DDG presents regulated topics
- Build evidence-grade rank reports
- Run unbiased rank checks for internal audits

</td>
<td width="50%">

### 📰 Journalism
- Compare regional SERPs for the same story
- Track time-range search shifts during news cycles
- Cite DDG with stable URLs and timestamps
- Monitor how privacy-engine surfaces sources

</td>
</tr>
</table>

---

## 🌟 Beyond business use cases

Data like this powers more than commercial workflows. The same structured records support research, education, civic projects, and personal initiatives.

<table>
<tr>
<td width="50%">

### 🎓 Research and academia
- Empirical datasets for papers, thesis work, and coursework
- Longitudinal studies tracking changes across snapshots
- Reproducible research with cited, versioned data pulls
- Classroom exercises on data analysis and ethical scraping

</td>
<td width="50%">

### 🎨 Personal and creative
- Side projects, portfolio demos, and indie app launches
- Data visualizations, dashboards, and infographics
- Content research for bloggers, YouTubers, and podcasters
- Hobbyist collections and personal trackers

</td>
</tr>
<tr>
<td width="50%">

### 🤝 Non-profit and civic
- Transparency reporting and accountability projects
- Advocacy campaigns backed by public-interest data
- Community-run databases for local issues
- Investigative journalism on public records

</td>
<td width="50%">

### 🧪 Experimentation
- Prototype AI and machine-learning pipelines with real data
- Validate product-market hypotheses before engineering spend
- Train small domain-specific models on niche corpora
- Test dashboard concepts with live input

</td>
</tr>
</table>

---

## 🔌 Automating DuckDuckGo Search Scraper

Run this Actor on a schedule, from your codebase, or inside another tool:

- **Node.js** SDK: see [Apify JavaScript client](https://docs.apify.com/api/client/js/) for programmatic runs.
- **Python** SDK: see [Apify Python client](https://docs.apify.com/api/client/python/) for the same flow in Python.
- **HTTP API**: see [Apify API docs](https://docs.apify.com/api/v2) for raw REST integration.

Schedule daily or weekly runs from the Apify Console. Pipe results into Google Sheets, S3, BigQuery, or your own webhook with the built-in [integrations](https://docs.apify.com/platform/integrations).

---

## ❓ Frequently Asked Questions

<details>
<summary><strong>🔗 Does the URL field contain DDG redirect wrappers?</strong></summary>

No. The Actor decodes the `/l/?uddg=...` wrapper before saving each row, so `url` is the real destination URL. The `displayedUrl` field shows the version DDG renders under the title.

</details>

<details>
<summary><strong>🌍 Which regions are supported?</strong></summary>

DDG uses 50+ region codes in the `us-en`, `de-de`, `fr-fr` format. Pass any valid code as a string. The DDG documentation lists all valid region codes.

</details>

<details>
<summary><strong>📅 What does the time-range filter accept?</strong></summary>

Single-letter codes: `d` for last day, `w` for last week, `m` for last month, `y` for last year. Empty returns all-time results.

</details>

<details>
<summary><strong>📦 How many results can I pull per query?</strong></summary>

Up to 100 organic results per query in a typical run. DDG's offset pagination caps at roughly 100 results before throttling.

</details>

<details>
<summary><strong>🔄 Can I run multiple queries in one run?</strong></summary>

Yes. The `queries` input is a string array. Rank position resets per query in the dataset.

</details>

<details>
<summary><strong>🛡️ Why does the Actor rotate proxies?</strong></summary>

DDG's HTML endpoint throttles repeat requests from the same IP. Apify residential proxies route each page through a fresh consumer IP so the SERP HTML stays clean.

</details>

<details>
<summary><strong>🤖 Are images, videos, and ads included?</strong></summary>

No. This Actor focuses on the organic web results list. Image, video, and instant-answer blocks render under different selectors and are out of scope.

</details>

<details>
<summary><strong>💼 Can I use this for commercial work?</strong></summary>

Yes. The Actor reads only what DDG publicly serves to any browser. Always honor each downstream site's terms of service when republishing snippets.

</details>

<details>
<summary><strong>💳 Do I need a paid Apify plan?</strong></summary>

The free plan returns up to 10 results per run. Paid plans return up to 1,000,000. Pay-per-event pricing means you only pay for the results returned.

</details>

<details>
<summary><strong>⚠️ What if a run returns thin or no results?</strong></summary>

The Actor retries with proxy rotation on thin responses. If a query genuinely has fewer results, that reflects the SERP. [Open a contact form](https://tally.so/r/BzdKgA) and include the run URL if you suspect a bug.

</details>

<details>
<summary><strong>🔁 How fresh is the data?</strong></summary>

Live. Each run hits DDG at run time, so you get whatever the SERP shows right now.

</details>

<details>
<summary><strong>⚖️ Is scraping DuckDuckGo legal?</strong></summary>

Reading public SERP HTML is widely accepted as fair use for SEO research. The Actor does not bypass paywalls, does not sign in, and respects per-page proxy rotation to avoid undue load.

</details>

---

## 🔌 Integrate with any app

- [**Make**](https://apify.com/integrations/make) - drop run results into 1,800+ apps.
- [**Zapier**](https://apify.com/integrations/zapier) - trigger automations off completed runs.
- [**Slack**](https://apify.com/integrations/slack) - post run summaries to a channel.
- [**Google Sheets**](https://apify.com/integrations/google-sheets) - sync each run into a spreadsheet.
- [**Webhooks**](https://docs.apify.com/platform/integrations/webhooks) - notify your own services on run finish.
- [**Airbyte**](https://apify.com/integrations/airbyte) - load runs into Snowflake, BigQuery, or Postgres.

---

## 🔗 Recommended Actors

- [**🅱️ Bing Search Scraper**](https://apify.com/parseforge/bing-search-scraper) - cross-reference rank shifts on the second-largest Western SERP.
- [**📚 Wikipedia Pageviews Scraper**](https://apify.com/parseforge/wikipedia-pageviews-scraper) - pair rank with public-interest spikes.
- [**🕰️ Wayback Machine CDX Scraper**](https://apify.com/parseforge/wayback-cdx-scraper) - audit historical versions of pages that rank.
- [**🐙 GitHub Trending Repos Scraper**](https://apify.com/parseforge/github-trending-scraper) - capture the developer-attention layer.
- [**📰 Substack Publication Scraper**](https://apify.com/parseforge/substack-publication-scraper) - track newsletter content that ranks for your queries.

> 💡 **Pro Tip:** browse the complete [ParseForge collection](https://apify.com/parseforge) for more pre-built scrapers and data tools.

---

**🆘 Need Help?** [**Open our contact form**](https://tally.so/r/BzdKgA) and we'll route the question to the right person.

---

> DuckDuckGo is a registered trademark of DuckDuckGo, Inc. This Actor is not affiliated with or endorsed by DuckDuckGo. It reads only publicly visible SERP HTML the same way a normal browser does.
