# Resolution Spec

Every market's settlement rule, stated before trading opens. This document IS the
oracle recipe made explicit — no post-hoc reinterpretation allowed.

## Market 1 — Allowable Increase 2027
- **Question:** Will the SF Rent Board allowable increase for 2027 exceed 2.0%?
- **Recipe:** API-resolved (BLS).
- **Source:** BLS CPI-U, San Francisco-Oakland-Hayward, 12-month period ending Oct 2026.
- **Computation:** Rent Ordinance formula = 60% of the regional CPI change, published
  by the Rent Board each November.
- **Resolves:** on the November 2026 posting. YES if published allowable > 2.0%.
- **Uncertainty is genuine:** the CPI input is unknown until the BLS release.

## Market 2 — Permit Issued
- **Question:** Will permit <NUMBER> reach 'issued' status by 2026-09-01?
- **Recipe:** API-resolved (DataSF).
- **Source:** DataSF Building Permits, dataset p4e4-a5a7.
- **Field:** current_status == "issued", with current_status_date <= deadline.
- **Resolves:** YES if the field shows issued on/before deadline; NO if deadline
  passes without it; settlement reads the live record at resolution time.
- **Provenance:** every settlement stores the raw record + checkedAt timestamp.

## Method discipline
For any public-data-computed market (e.g. rent buckets from gdc7-dmcn), the exact
source, geography, and statistic (median vs mean, bucket handling) MUST be fixed in
this file before trading opens. Changing the method after open is prohibited — that's
the gerrymandering failure mode that kills market credibility.
