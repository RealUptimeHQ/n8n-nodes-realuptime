import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RealUptimeApi implements ICredentialType {
	name = 'realUptimeApi';

	displayName = 'RealUptime API';

	icon = 'file:realuptime.svg' as const;

	documentationUrl = 'https://github.com/RealUptimeHQ/n8n-nodes-realuptime#readme';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Create a key at https://dashboard.realuptime.io/account/api-keys. Keys work on every plan, including Free. No account yet? Sign up free at https://realuptime.io/signup?utm_source=n8n&utm_medium=marketplace&utm_campaign=connect',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://realuptime.io/api/v1',
			url: '/checks',
		},
	};
}
