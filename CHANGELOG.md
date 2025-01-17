# Change Log

All notable changes to the "go-main-runner" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [History]

### [1.2.15]

- upgrade deps for the security patches
  - fixed #3, #4 and #5

### [1.2.13]

- fixed #2, “go: no go files listed” occurs when no tags are added

### [1.2.12]

- upgrade deps
- added missed declaration to [VS Code Go extension](https://marketplace.visualstudio.com/items?itemName=golang.go)
- improved main func test regexp

### [1.2.11]

- fix params passing for main run task

### [1.2.10]

- run `main.go` with `asTask` mode: add support to vscode Task so that you can rerun it easier.
- improve codes.
- move to vscode v1.75+.

### [1.2.9]

- added supports to more build tags: `docker`, `k8s` and `istio`.
- improve codes.
- fixed 'undefined' at end of go run cmdline

### [1.2.8]

- improved regexp for tilde folder
- fix readme

### [1.2.7]

- fix changelog and readme

### [1.2.6]

- fix 2 shortcuts
- update readme for new keybindings
- enable toasts for build tags shortcuts
- run main func: retrieve tags and args from selected launch config

### [1.2.5]

- add shortcut: build tag: toggle verbose command (<kbd>cmd+option+v</kbd>)
- add shortcut: build tag: toggle delve command (<kbd>cmd+option+d</kbd>)
- add more shortcuts (see all at readme)
- fix conflicts between tags (`.more`) and verbose (`.verbose`)
- more...

### [1.2.3]

- fix bugs
- refactor codes
- add support for build tag 'vscode' and 'delve'
- add support to '-v'
- add supports to no-optimize and min-size

### [1.2.2]

- fix wrong command name (for launch config status item)
- fix tooltip of status item
- fix running launch config when quick pick cancelled
- rename launch commands to meaningful properties

### [1.2.1]

- review the descriptions and documents
- refine settings (entry names, ...)
- Running main():
  - added `go-main-runner.main.run.asPackage` to enable running main.go under package context instead of as a single file.
- Launch Configs:
  - changed `go-main-runner.launch.enableRunOrDebug` with default value `true`.
  - changed `go-main-runner.launch.enableRunOrDebug` with default value `true`.
- Links in Terminal:
  - added: recognize 'file:line' pattern starting with tilde folder name and jump, in terminal
- Build Tags for running main():
  - added: append 'verbose' build tag if setting enabled.
  - added: append 'verbose' build tag always.
  - added: append Go Extension build tags automatically.
  - added: append build tags specified from settings.
  
  > A tilde folder is a hashed folder, for example: `~work/rust.work/a.rs` might be resolved to `/Volumes/VolWork/workspaces/rust.work/a.rs`.
  > See also zsh/bash command `hash -d`.

### [1.2.0]

- review the settings entries, command entries
- picking a launch config from statusbar
  - allow show/hide a status item for launch configs
  - allow starting a Run without debugging (If you want start debugging, you may change our default behavior from settings)

### [1.1.0]

- changed: the buildTags will be retrieved from [Go][^2] settings. see also setting 'go.buildTags'.
- changed: we will append 'vscode' into buildTags.

[^2]: Go extension for vscode

### [1.0.0]

- Initial release
- added 'Run' and 'Debug' codelens links on top of `func main` line.
