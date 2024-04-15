# Go Main Runner

Run or Debug golang main function in-place.

## Features

Here's primary features:

- Start `go run` on a main func in editor
- Easily play vscode launch configs at first time.
- Support tilde folder link in Terminal window.

It is so unbelievable that's so hard to start running a program via `go run` within Golang developing in vscode.

This is why we build this extension.

So we adds two links on top of `func main()` so that you can run/debug it without leaving editor and type command in terminal window.

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

Since v1.2.1, you can enable or disable `verbose` tag, or specify buildTags in settings.

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

As a tip, you don't need our launch config status item because there is a native one:

```json
{
  "debug.showInStatusBar": "always"
}
```

But ours is another choice.



### Tilde Folder in Terminal

> **WHY**: We add this feature for logging outputs by a hardenned logger, which can mask the disk locations to prevent to leak user names or disk layouts and vice versa.

Since v1.2.1, we recognize 'file:line' pattern in terminal, even if it's a file staring with tilde folder.

In zsh, a tilde folder is a hashed tag which can be mapped to the real path. For example,
`~work/rust.work/a.go` might be resolved to `/Volumes/VolWork/workspaces/go.work/a.go`.
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

## For more information

* [Golang Ext: Debugging: Launch Config](https://github.com/golang/vscode-go/blob/master/docs/debugging.md#configure)
* [Golang Ext: Debugging: Launch Config: Attributes](https://github.com/golang/vscode-go/blob/master/docs/debugging.md#configuration)
* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
