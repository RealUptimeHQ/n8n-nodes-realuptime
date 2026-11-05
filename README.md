# n8n-nodes-realuptime

[n8n](https://n8n.io) community nodes for [RealUptime](https://realuptime.io): status pages, multi-region uptime monitoring, error tracking and free "Is X down?" pages.

## Nodes

**RealUptime** (action node, also usable as an AI agent tool)

| Resource | Operations |
| --- | --- |
| Check | Create (HTTP check), Get (current status, region by region), Get Many |
| Incident | Get Many (newest first) |
| Outage | Get: whether RealUptime's own checks of a popular service (GitHub, Stripe, Cloudflare...) fail right now, beside the vendor's status page. No API key needed |

**RealUptime Trigger** (polling)

- **Incident Opened**: a new incident appears on any of your monitors
- **Check Down**: a check moves to down, optionally degraded too

## Install

In n8n: **Settings > Community Nodes > Install**, then enter `n8n-nodes-realuptime`.

## Credentials

Create an API key at <https://dashboard.realuptime.io/account/api-keys>. Keys work on every plan, including Free (no card). In n8n, add a **RealUptime API** credential and paste the key.

The Outage operation does not need a key.

## Links

- API reference: <https://docs.realuptime.io/api>
- Support: <https://realuptime.io/support> or support@realuptime.io

## License

MIT
