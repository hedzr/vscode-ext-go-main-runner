# Go Main Runner

Run or Debug golang main function in-place.

## Requirements

- Visual Studio Code 1.75 or newer (or editors compatible with VS Code 1.75+ APIs)
- Go 1.18 or newer
- Visual Studio Code Extensions:
  - [VS Code Go extension](https://marketplace.visualstudio.com/items?itemName=golang.go)

## Features

Here's primary features:

- Start `go run` on a main func in editor: `runInTerminal` or `asTask`.
- Easily play vscode launch configs at first time.
- Support tilde folder links in Terminal window.

> See the [CHANGELOG](https://marketplace.visualstudio.com/items/hedzr.go-main-runner/changelog).

It is so unbelievable that's so hard to start running a program via `go run` within Golang developing in vscode.

This is why we build this extension.

The first thing is we added two links on top of `func main()`. Clicking them to run/debug without leaving editor and type command in terminal window.

![image-20240411221538829](https://cdn.jsdelivr.net/gh/hzimg/blog-pics@master/uPic/image-20240411221538829.png)

When you click `Run` button, we will launch the `main()` with `go run` in vscode integrated terminal window.
Clicking `Debug` button causes a normal debugging session via `dlv`.

Also a status button for vscode Launch Configs has been added since v1.2.0. It looks like:

![image-20240411221741867](https://cdn.jsdelivr.net/gh/hzimg/blog-pics@master/uPic/image-20240411221741867.png)

It's a shortcut for picking and running (not debugging) a launch config at first time.

### Run/Debug `main()`

> **WHY**: We added this feature to avoid typing `cd dir; go run ./main.go` after switching to Terminal window.

This feature starts running/debugging a main() function right here, without args.

#### Build Tags

But you may specify buildTags at Go extension settings:

```json
{
  "go.buildTags": "hzstudio,hzwork",
}
```

And `vscode` will be appended implicitly into it automatically.

Since v1.2.1, you can enable or disable `verbose` tag.  
Since v1.2.2, you can enable or disable `delve` tag.  
Since v1.2.3, you can enable or disable `vecode` tag.
Since v1.2.9, you can enable or disable `docker`, `k8s` and `istio`.

```json
{
  "go-main-runner.main.run.tags.verbose": false,
  "go-main-runner.main.run.tags.delve": false,
  "go-main-runner.main.run.tags.docker": false,
  "go-main-runner.main.run.tags.k8s": false,
  "go-main-runner.main.run.tags.istio": false,
  "go-main-runner.main.run.tags.vscode": true,
  "go-main-runner.main.run.tags.more": "hzwork,more"
}
```

These sources will be inpected when building buildTags for `go run` command line:

- settings `go.buildTags`
- settings `go-main-runner.main.run.tags.*`
- `-tags` in `buildFlags` key, if a picked launch config in using

#### Run as Package or Single File

You can launch `main()` function with package mode, or only single `main.go` file:

```json
{
  "go-main-runner.main.run.asPackage": false
}
```

#### Run Mode

Since v1.2.10, we bring a new feature to run main.go as a [vscode Task]. You could enable it with `settings.json`:

```json
{
  // "go-main-runner.main.run.mode": "runInTerminal",
  "go-main-runner.main.run.mode": "asTask",
}
```

In this mode, clicking `Run` beyond `func main` will start a task.

It is a normal vscode Task, so you can make it concrete as a task.json, A sample `task.json` might be:

```json
{
	"version": "2.0.0",
	"tasks": [
		{
			"type": "go-main-runner",
			"task": "go-main-run ./cli/rd",
			"problemMatcher": [],
			"label": "./cli/rd: go-main-run ./cli/rd"
		}
	]
}
```

We recommend it because you can rerun it without switching to the `main.go`: You could request a keybinding to `Tasks: Rerun Last Task`. Our private `keybindings.json` is a reference:

```json
[
    {
      "key": "cmd+; cmd+;",
      "command": "workbench.action.tasks.reRunTask"
    }
]
```

It is useful while you are invoking `main.go` again and again.

### Launch with config

> **WHY**: We added this feature to avoid switching between sidebars ('Explorer' and 'Run or Debug') at first time. Shortcut players have never seen me.

The new status item allows picking a launch config and 'Run' (not debug) it shortly.

This button will hide itself after first picked, since a native status item can be shown by vscode.
But if you desire a Run button rather than debug sth, you may disable it in setting:

```json
{
  "go-main-runner.launch.enableStatusItemOnce": false,
  // "debug.showInStatusBar": "onFirstSessionStart"
  // "debug.showInStatusBar": "never"
}
```

This status item can also be hidden from settings (by `go-main-runner.launch.enableStatusItem`).

As a tip, you don't need our launch config status item because there is a native one:

```json
{
  "debug.showInStatusBar": "always"
}
```

But ours is another choice.

#### Use `runInTerminal` mode with lsaunch config

`runInTerminal` mode means that current file in editor will be launched into terminal by `go run`, and the selected launch config will be applied if necessary: the [tags] and [args] in the launch config will be reused in `go run` command line.

```json
{
  "go-main-runner.launch.mode": "runInTerminal" // or "run" and "debug"
}
```

And another two modes, `run` and `debug`, runs the target within dlv dap mode, just like launching by vscode launch configs and launch.json.

```json
{
  "go-main-runner.launch.mode": "debug" // this is default behavior of vscode
}
```

### Tilde Folder in Terminal

> **WHY**: We add this feature for logging outputs by a hardenned logger, which can mask the disk locations to prevent to leak user names or disk layouts and vice versa.

Since v1.2.1, we recognize 'file:line' pattern in terminal, even if it's a file staring with tilde folder.

In zsh, a tilde folder is a hashed tag which can be mapped to the real path. For example,
`~work/go.work/a.go` might be resolved to `/Volumes/VolWork/workspaces/go.work/a.go`.
If you have defined a hash link with:

```bash
workDrive='/Volumes/VolWork/workspaces'
hash -d work="$workDrive"
ls -la ~work/
```

All defined hashed pairs can be found generally by invoking:

```bash
hash -d
```

There is a old post (in chinese only) to introduce more about Tilde Folder/Named Direcotries: [tilde expansion and named directories](https://hedzr.com/devops/shell/tilde-expansion-and-named-directories/).

## Keybindings

These keybindings are predefined:

| Command                                    | Keys             | Win/Linux        |
| ------------------------------------------ | ---------------- | ---------------- |
| Debug: Start Debugging                     | <kbd>⌘M ⌘B</kbd> | <kbd>^M ^B</kbd> |
| Debug: Start Without Debugging             | <kbd>⌘M ⌘N</kbd> | <kbd>^M ^N</kbd> |
| Go Main Runner: Disable Codelens           | <kbd>⌥⌘F10</kbd> | <kbd>⇧^F10</kbd> |
| Go Main Runner: Enable CodeLens            | <kbd>⌘F10</kbd>  | <kbd>^F10</kbd>  |
| Go Main Runner: Run or Debug main()        | <kbd>⌘M ⌘R</kbd> | <kbd>^M ^R</kbd> |
| Go Main Runner: Run with Launch Configs... | <kbd>⌘M ⌘L</kbd> | <kbd>^M ^L</kbd> |
| Go Main Runner: Toggle Delve BuildTag      | <kbd>⌥⌘D</kbd>   | <kbd>⇧^D</kbd>   |
| Go Main Runner: Toggle Verbose BuildTag    | <kbd>⌥⌘V</kbd>   | <kbd>⇧^V</kbd>   |
| Go Main Runner: Toggle Docker BuildTag     | <kbd>⌥⌘R</kbd>   | <kbd>⇧^R</kbd>   |
| Go Main Runner: Toggle K8s BuildTag        | <kbd>⌥⌘K</kbd>   | <kbd>⇧^K</kbd>   |
| Go Main Runner: Toggle Istio BuildTag      | <kbd>⌥⌘I</kbd>   | <kbd>⇧^I</kbd>   |

Note that in vscode there were two builtin keybindings:

| Command                        | Keys           |
| ------------------------------ | -------------- |
| Debug: Start Debugging         | <kbd>F5</kbd>  |
| Debug: Start Without Debugging | <kbd>^F5</kbd> |



## Commands

#### Go Main Runner: Enable CodeLens

This command enables codelens support, it causes detecting `func main()` and the links binding to them to execute.

#### Go Main Runner: Disable CodeLens

The opposition.

#### Go Main Runner: Toggle Delve BuildTag

Enable/disable `-tags delve`.

#### Go Main Runner: Toggle Verbose BuildTag

Enable/disable `-tags verbose`. Shortcut is <kbd>⌥⌘V</kbd> (Or <kbd>⇧^V</kbd> for windows/linux).

`verbose` is used to enable `slog.Verbose()` logging. The `slog.Verbose` is an enhanced feature of `hedzr/logg/slog`, which is optimized and disable in normal build but can print to logging device only if `verbose` tag defined.

We assume you will code yours following this principle. If so, this command takes benifit to you to *debug* the main program offline (by `go run`).

#### Go Main Runner: Toggle Docker/K8s/Istio BuildTag

Enable/disable `-tags docker` (or `k8s`, `istio`).

These tags are partial of [hedzr/is]/states/buildtags.

#### Go Main Runner: Debug...

This command is a replacement of `Debug: Start Debugging...`.

## For more information

* [Golang Ext: Debugging: Launch Config](https://github.com/golang/vscode-go/blob/master/docs/debugging.md#configure)
* [Golang Ext: Debugging: Launch Config: Attributes](https://github.com/golang/vscode-go/blob/master/docs/debugging.md#configuration)
* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

## Contributing

Welcome.

## License

[Apache 2.0](https://github.com/hedzr/vscode-ext-go-main-runner/blob/master/LICENSE)
