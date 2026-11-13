# Contributing

Bug reports, feature requests and pull requests are welcome in this
repository, which is where development of these nodes happens.

## Reporting a bug

Open an issue. A good bug report names the package version, the n8n version,
the node, resource and operation, what you expected and what happened, with
credentials and personal data removed. Security problems are not reported in
public issues; see [SECURITY.md](SECURITY.md).

## Changing the code

```bash
npm install
npm run build
```

`npm run build` compiles the nodes with the TypeScript compiler in strict
mode, so a change must compile without errors.

This package has no automated test suite yet. A pull request that adds a test
for the behavior it changes, or that starts a suite, is the most useful kind.
Describe in the pull request how you exercised the change in n8n.

## Release notes

Each release is described in [CHANGELOG.md](CHANGELOG.md).
