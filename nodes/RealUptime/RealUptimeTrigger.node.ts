import {
	NodeConnectionTypes,
	type IDataObject,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
	type IPollFunctions,
} from 'n8n-workflow';

const BASE_URL = 'https://realuptime.io/api/v1';

async function get(this: IPollFunctions, path: string): Promise<IDataObject> {
	return (await this.helpers.httpRequestWithAuthentication.call(this, 'realUptimeApi', {
		method: 'GET',
		url: `${BASE_URL}${path}`,
		json: true,
	})) as IDataObject;
}

export class RealUptimeTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'RealUptime Trigger',
		name: 'realUptimeTrigger',
		icon: 'file:realuptime.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts the workflow when a RealUptime incident opens or a monitor goes down',
		defaults: { name: 'RealUptime Trigger' },
		polling: true,
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'realUptimeApi', required: true }],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Incident Opened',
						value: 'incidentOpened',
						description: 'A new incident appears on any of your monitors',
					},
					{
						name: 'Monitor Down',
						value: 'checkDown',
						description: 'A monitor moves to down (or degraded, if selected below)',
					},
				],
				default: 'incidentOpened',
			},
			{
				displayName: 'Include Degraded',
				name: 'includeDegraded',
				type: 'boolean',
				default: false,
				description: 'Whether a monitor moving to degraded should also start the workflow',
				displayOptions: { show: { event: ['checkDown'] } },
			},
		],
	};

	async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
		const event = this.getNodeParameter('event') as string;
		const state = this.getWorkflowStaticData('node');

		if (event === 'incidentOpened') {
			const { incidents = [] } = (await get.call(this, '/incidents?limit=100')) as {
				incidents?: IDataObject[];
			};
			const seen = new Set((state.seenIncidentIds as string[] | undefined) ?? []);
			const firstRun = state.seenIncidentIds === undefined;
			state.seenIncidentIds = incidents.map((incident) => incident.id as string);
			if (firstRun && this.getMode() !== 'manual') return null;
			const fresh = firstRun ? incidents.slice(0, 1) : incidents.filter((i) => !seen.has(i.id as string));
			return fresh.length ? [this.helpers.returnJsonArray(fresh)] : null;
		}

		const includeDegraded = this.getNodeParameter('includeDegraded', false) as boolean;
		const failing = new Set(includeDegraded ? ['down', 'degraded'] : ['down']);
		const { checks = [] } = (await get.call(this, '/checks')) as { checks?: IDataObject[] };
		const previous = (state.checkStatus as Record<string, string> | undefined) ?? {};
		const firstRun = state.checkStatus === undefined;
		const current: Record<string, string> = {};
		const changed: IDataObject[] = [];
		for (const check of checks) {
			if (check.paused_at) continue;
			const detail = await get.call(this, `/checks/${check.id as string}`);
			const status = (detail.status as string) ?? 'unknown';
			current[check.id as string] = status;
			const wasFailing = failing.has(previous[check.id as string] ?? '');
			if (failing.has(status) && (!wasFailing || (firstRun && this.getMode() === 'manual'))) {
				changed.push({ ...detail, previous_status: previous[check.id as string] ?? null });
			}
		}
		state.checkStatus = current;
		if (firstRun && this.getMode() !== 'manual') return null;
		return changed.length ? [this.helpers.returnJsonArray(changed)] : null;
	}
}
