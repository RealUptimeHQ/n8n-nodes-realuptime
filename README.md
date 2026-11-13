# n8n-nodes-realuptime

[n8n](https://n8n.io) community nodes for [RealUptime](https://realuptime.io) Monitoring: create and read uptime monitors, list incidents, and start a workflow when a monitor goes down or an incident opens. RealUptime is uptime monitoring and error tracking on one plan, with a Free plan that needs no card.

## Nodes

**RealUptime** (action node, also usable as an AI agent tool)

| Resource | Operations |
| --- | --- |
| Monitor | Create (HTTP monitor), Get (current status, region by region), Get Many |
| Incident | Get Many (newest first) |

**RealUptime Trigger** (polling)

- **Incident Opened**: a new incident appears on any of your monitors
- **Monitor Down**: a monitor moves to down, optionally degraded too

## Install

In n8n: **Settings > Community Nodes > Install**, then enter `n8n-nodes-realuptime`.

## Credentials

1. No account yet? [Sign up free](https://realuptime.io/signup?utm_source=n8n&utm_medium=marketplace&utm_campaign=readme). Keys work on every plan, including Free.
2. Create an API key at <https://dashboard.realuptime.io/account/api-keys>. It starts with `ru_live_`.
3. In n8n, add a **RealUptime API** credential and paste the key. n8n tests it by listing your monitors.

The key is sent as `Authorization: Bearer <key>` to `https://realuptime.io/api/v1`.

## Example workflows

**Post to Slack when a monitor goes down**

1. **RealUptime Trigger**, event **Monitor Down**. Turn on **Include Degraded** to also hear about slow responses.
2. **Slack** node, **Send Message**, with text such as `{{$json.check.name}} is {{$json.status}} ({{$json.check.url}})`. The trigger's item is the monitor's API record: `check` holds its settings, `status` is `degraded` or `down`, and `previous_status` is what it was before.

**Start monitoring every new site from a sheet**

1. **Google Sheets Trigger**, on a new row with `name` and `url` columns.
2. **RealUptime**, resource **Monitor**, operation **Create**, with **Name** `{{$json.name}}` and **URL** `{{$json.url}}`.

**Daily incident digest by email**

1. **Schedule Trigger**, every day at 09:00.
2. **RealUptime**, resource **Incident**, operation **Get Many**, limit 50.
3. **Send Email**, listing each incident's `title`, `status` and `opened_at`.

## Compatibility

Built with `@n8n/node-cli` and tested against n8n 2.x.

## Links

- API reference: <https://docs.realuptime.io/api>
- Support: <https://realuptime.io/support> or support@realuptime.io

## License

MIT
