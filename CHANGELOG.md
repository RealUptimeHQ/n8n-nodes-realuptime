# Changelog

## 0.2.0 (unreleased)

- Published from GitHub Actions with an npm provenance statement.
- The interface says monitor: the Monitor resource and the Monitor Down
  trigger event. Their stored values stay `check` and `checkDown`, so saved
  workflows keep working.
- The Outage operation names the services RealUptime lists today.
- The credential help links signup and the API key page.

## 0.1.0 (2026-11-05)

First release on npm. The RealUptime node covers checks (create an HTTP check,
get a check's current status region by region, list checks), incidents (list,
newest first) and outages (whether RealUptime's own checks of a popular
service fail right now; no API key needed). The RealUptime Trigger node polls
for a new incident or a check that moves to down. Credentials are a RealUptime
API key.
