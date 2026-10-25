# Banking SIEM Use Case Library

A browsable catalogue of **152 banking-specific SIEM detection use cases**, published as a static website.

**Live site: https://laklubin.github.io/Banking-Specific-SIEM-Use-CASE/**

Each use case records four things:

| Field | Purpose |
| --- | --- |
| **Use case name** | What the detection is called |
| **Log source** | The systems that must be onboarded and parsed for it to work |
| **Description** | What it detects and the logic that triggers it |
| **Sample log** | A representative event you can use to build and unit-test the rule |

Every entry is additionally tagged with a severity and a MITRE ATT&CK technique so coverage can be reported against a framework.

## Domains covered

| Domain | Use cases | Examples |
| --- | --- | --- |
| Core Banking | 18 | T24 / Finacle / Flexcube CIF tampering, maker-checker bypass, EOD batch tampering, suspense account abuse |
| SWIFT | 18 | Alliance Access operator abuse, MT103 with no ledger debit, RMA changes, journal purge, confirmation suppression |
| Payments | 16 | Bulk payment file injection, RTGS single-approval release, instant-payment velocity, sanctions filter override |
| ATM | 15 | Jackpotting / XFS abuse, cash-out attacks, black-box dispenser attacks, skimming, EPP key anomalies |
| Internet Banking | 14 | Credential stuffing, session hijack, man-in-the-browser, OTP bypass, limit increase before transfer |
| Mobile Banking | 13 | Rooted devices, overlay and accessibility abuse, SIM swap, device-binding change, device farms |
| Card Systems | 14 | Clear-text PAN, CDE exfiltration, BIN attacks, EMV fallback abuse, HSM anomalies, authorisation rule changes |
| Database | 14 | Bulk customer table reads, audit trail purge, privilege escalation, unmasked production copies |
| Fraud & AML | 16 | Structuring, rapid pass-through, mule networks, account takeover composites, trade-based laundering |
| Insider & Privileged | 14 | PAM bypass, leaver access, mass exfiltration, SoD conflicts, credential dumping, ransomware precursors |

## The website

Open `index.html` in a browser — there is no build step and no dependencies.

- Full-text search across names, log sources, MITRE techniques, descriptions and sample log fields (press `/` to focus)
- Filter by domain and severity
- Expand any card to read and copy its sample log
- Export the current selection to CSV for import into a SIEM content backlog or GRC register
- Light and dark themes, print-friendly layout

### Publishing

The site is served by GitHub Pages from the `main` branch, root folder. Any push to `main` republishes it automatically — there is nothing to build.

## Repository layout

```
index.html          the site
assets/style.css    styling (light/dark themes, print)
assets/app.js       search, filtering, CSV export
data/usecases.js    the use case dataset (edit this to add content)
```

### Adding a use case

Append an object to `data/usecases.js`:

```js
{
  id:   "CBS-019",
  name: "Short, action-oriented detection name",
  cat:  "Core Banking",
  src:  "Log sources, comma separated",
  sev:  "Critical | High | Medium",
  mitre:"T1565 Data Manipulation",
  desc: "What it detects and the triggering logic.",
  log:  "A representative sample event"
}
```

The statistics, domain filters and counters on the page are derived from the dataset at load time, so nothing else needs updating.

## Using these in production

These are detection *specifications*, not finished rules. Before deployment:

1. Confirm the log source is onboarded, parsed and field-normalised, and that its retention meets the detection window.
2. Baseline thresholds against 30–90 days of your own data — the figures here are illustrative starting points.
3. Pair every rule with a documented triage procedure, escalation path and owning team.
4. Record expected false-positive sources (batch jobs, migrations, approved maintenance windows) as suppression lists rather than widening the rule.
5. Validate with purple-team exercises where the activity can be safely simulated.

Sample logs are synthetic. Account numbers, card numbers, BICs, IP addresses, host names and user names are illustrative only.
