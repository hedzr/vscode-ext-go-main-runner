# Go Main Runner

Run or Debug golang main function in-place.

## Features

It is so unbelievable that's so hard to start running or debugging a program within Golang developing in vscode.

This extension adds two links on top of `func main()` so that you can run/debug it without leaving editor and type command in terminal window.

![image-20240411221538829](https://cdn.jsdelivr.net/gh/hzimg/blog-pics@master/uPic/image-20240411221538829.png)

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

Since v1.3.0, you can enable or disable `verbose` tag, or specify buildTags in settings.

```json
{
  "go-main-runner.main.run.verbose": true,
  "go-main-runner.main.run.tags": "hzwork,more"
}
```

#### Run as Package or Single File

You can launch main() function from this package, or only `main.go` file by setting with:

```json
{
  "go-main-runner.main.run.asPackage": false
}
```

### Launch with config

> **WHY**: We added this feature to avoid switching between sidebars ('Explorer' and 'Run or Debug') at first time.

The new status item allows picking a launch config and 'Run' (not debug) shortly.

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

You don't need our launch config status item because there is a native one:

```json
{
  "debug.showInStatusBar": "always"
}
```

But here is another choice.

### Tilde Folder in Terminal

> **WHY**: We add this feature for logging outputs by a hardenned logger, which can mask the disk locations to prevent to leak user names or disk layouts and vice versa.

Since v1.3.0, we recognize 'file:line' pattern in terminal, even if it's a file staring with tilde folder.

In zsh, a tilde folder is a hashed tag which can be mapped to the real path. For example,
`~work/rust.work/a.rs` might be resolved to `/Volumes/VolWork/workspaces/rust.work/a.rs`.
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

## Release Notes

Users appreciate release notes as you update your extension.

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

### [1.0.0]

Just a replacement to `go run ./main.go`.



## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
