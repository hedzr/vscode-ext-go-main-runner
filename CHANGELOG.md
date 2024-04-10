# Change Log

All notable changes to the "go-main-runner" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### [1.1.0]

- changed: the buildTags will be retrieved from [Go][^2] settings. see also setting 'go.buildTags'.
- changed: we will append 'vscode' into buildTags.

[^2]: Go extension for vscode

### [1.0.0]

- Initial release
- added 'Run' and 'Debug' codelens links on top of `func main` line.
