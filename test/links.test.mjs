// Every link that can bring a new user to RealUptime from this package
// carries utm_source=n8n, the parameter RealUptime's signup attribution
// credits (a bare from= credits nothing).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const TAG = 'utm_source=n8n&utm_medium=marketplace';
const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('the credential help links signup with the n8n tag', () => {
	const source = read('credentials/RealUptimeApi.credentials.ts');
	assert.match(source, /https:\/\/realuptime\.io\/signup\?utm_source=n8n&utm_medium=marketplace/);
	assert.match(source, /https:\/\/dashboard\.realuptime\.io\/account\/api-keys/);
});

test('every signup link in the README carries the n8n tag', () => {
	const links = read('README.md').match(/https:\/\/realuptime\.io\/signup[^\s)>]*/g) ?? [];
	assert.ok(links.length > 0, 'README links signup');
	for (const link of links) assert.ok(link.includes(TAG), link);
});
