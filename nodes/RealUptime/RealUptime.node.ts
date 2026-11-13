import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';

const REGIONS = [
	{ name: 'US East (IAD)', value: 'iad' },
	{ name: 'US West (SJC)', value: 'sjc' },
	{ name: 'US Central (ORD)', value: 'ord' },
	{ name: 'Canada (YYZ)', value: 'yyz' },
	{ name: 'Europe (FRA)', value: 'fra' },
	{ name: 'UK (LHR)', value: 'lhr' },
	{ name: 'Asia-Pacific (NRT)', value: 'nrt' },
	{ name: 'Southeast Asia (SIN)', value: 'sin' },
	{ name: 'Australia (SYD)', value: 'syd' },
	{ name: 'South America (GRU)', value: 'gru' },
];

export class RealUptime implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RealUptime',
		name: 'realUptime',
		icon: 'file:realuptime.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Create and read RealUptime uptime monitors and list their incidents',
		defaults: { name: 'RealUptime' },
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'realUptimeApi',
				required: true,
				displayOptions: { show: { resource: ['check', 'incident'] } },
			},
		],
		requestDefaults: {
			baseURL: 'https://realuptime.io/api/v1',
			headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Monitor', value: 'check' },
					{ name: 'Incident', value: 'incident' },
					{ name: 'Outage', value: 'outage' },
				],
				default: 'check',
			},

			// Check
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['check'] } },
				options: [
					{
						name: 'Create',
						value: 'create',
						action: 'Create an HTTP monitor',
						description: 'Create an HTTP uptime monitor',
						routing: {
							request: { method: 'POST', url: '/checks' },
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'check' } }] },
						},
					},
					{
						name: 'Get',
						value: 'get',
						action: 'Get a monitor',
						description: "Get one monitor's current status, region by region",
						routing: { request: { method: 'GET', url: '=/checks/{{$parameter.checkId}}' } },
					},
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many monitors',
						description: 'List every monitor on the account',
						routing: {
							request: { method: 'GET', url: '/checks' },
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'checks' } }] },
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Monitor ID',
				name: 'checkId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['check'], operation: ['get'] } },
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				displayOptions: { show: { resource: ['check'], operation: ['create'] } },
				routing: { send: { type: 'body', property: 'name' } },
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'https://example.com/health',
				displayOptions: { show: { resource: ['check'], operation: ['create'] } },
				routing: { send: { type: 'body', property: 'url' } },
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: { show: { resource: ['check'], operation: ['create'] } },
				options: [
					{
						displayName: 'Interval (Seconds)',
						name: 'intervalSeconds',
						type: 'number',
						default: 60,
						description: 'How often to check. Your plan sets the shortest interval allowed.',
						routing: { send: { type: 'body', property: 'intervalSeconds' } },
					},
					{
						displayName: 'Regions',
						name: 'regions',
						type: 'multiOptions',
						options: REGIONS,
						default: [],
						description: 'Regions to check from. Your plan sets how many regions you can use.',
						routing: { send: { type: 'body', property: 'regions' } },
					},
					{
						displayName: 'Latency Threshold (Ms)',
						name: 'latencyThresholdMs',
						type: 'number',
						default: 0,
						description: 'Mark the monitor degraded above this response time',
						routing: { send: { type: 'body', property: 'latencyThresholdMs' } },
					},
				],
			},

			// Incident
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['incident'] } },
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						action: 'Get many incidents',
						description: 'List incidents across every monitor, newest first',
						routing: {
							request: { method: 'GET', url: '/incidents' },
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'incidents' } }] },
						},
					},
				],
				default: 'getAll',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 500 },
				default: 50,
				description: 'Max number of results to return',
				displayOptions: { show: { resource: ['incident'], operation: ['getAll'] } },
				routing: { send: { type: 'query', property: 'limit' } },
			},

			// Outage (public, no key needed)
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['outage'] } },
				options: [
					{
						name: 'Get',
						value: 'get',
						action: 'Check if a service is down',
						description:
							"Whether RealUptime's own checks of a popular service fail right now, region by region, beside the vendor's status page. No API key needed.",
						routing: { request: { method: 'GET', url: '=/outages/{{$parameter.service}}' } },
					},
				],
				default: 'get',
			},
			{
				displayName: 'Service',
				name: 'service',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'github',
				description: 'The service slug as it appears on realuptime.io/outages, for example github, stripe or cloudflare',
				displayOptions: { show: { resource: ['outage'], operation: ['get'] } },
			},
		],
	};
}
