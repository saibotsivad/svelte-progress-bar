# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

Change categories are:

* `Added` for new features.
* `Changed` for changes in existing functionality.
* `Deprecated` for once-stable features removed in upcoming releases.
* `Removed` for deprecated features removed in this release.
* `Fixed` for any bug fixes.
* `Security` to invite users to upgrade in case of vulnerabilities.

## [3.0.2](https://github.com/saibotsivad/svelte-panel-click/compare/v3.0.1..v3.0.2) - 2022-01-19
### Fixed
- The `package.json` Svelte entry pointed at the old `html` file still. 🤦‍♂️ Thanks @bcazur

## [3.0.0-3.0.1](https://github.com/saibotsivad/svelte-panel-click/compare/v2.0.0..v3.0.1) - 2021-12-16
### Added
- UMD build and added to `package.json` so you can use [unpkg](https://unpkg.com) directly.
### Changed
- BREAKING: Updated to use Svelte 3. 🎉 In general everything stayed the same except that the exported method `continue` had to be renamed (use `animate` instead), since it's a JS keyword. Note also the normal Svelte 2->3 upgrade stuff: `data` became `props`, and the get/set has changed. To get at the inner properties, I added an exported `getState` function, you can see it in [the demo `Controls.svelte` file](./docs/Controls.svelte).

## [2.0.0](https://github.com/saibotsivad/svelte-panel-click/compare/v1.0.2..v2.0.0) - 2018-12-16
### Added
* This CHANGELOG!
### Changed
* BREAKING: Updated to Svelte2, and in the process changed the API to use `component.setWidthRatio(ratio: number)` to manually manage the component width.
* Dropped the browserify dependency, using rollup instead.
