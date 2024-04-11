# Go Main Runner

Run or Debug golang main function in-place.

## Features

This extension adds two links on top of `func main()` so that you can run/debug it without leaving editor and type command in terminal window.

![image-20240411221538829](https://cdn.jsdelivr.net/gh/hzimg/blog-pics@master/uPic/image-20240411221538829.png)

Also a status button for vscode Launch Configs has been added since v1.2.0. It looks like:

![image-20240411221741867](https://cdn.jsdelivr.net/gh/hzimg/blog-pics@master/uPic/image-20240411221741867.png)

It a shortcut for picking it to run (not debug) a launch config.

### Run/Debug `main()`

This feature start run/debug a main() function right here, without args.

But you may specify buildTags at Go extension settings:

```json
{
  "go.buildTags": "hzstudio,hzwork",
}
```

And `vscode` will be appended into it automatically.

### Launch with config

The new status item allows picking a launch config and 'Run' (not debug) shortly.

This button will hide itself after first picked, since a native status item can be shown by vscode.
But if you desire a Run button rather than debug sth, you may disable `go-main-runner.enableStatusItemOnce` setting:

```json
{
    "go-main-runner.enableStatusItemOnce": false
}
```

It can also be hidden from settings.

The default behavior is running a config, you can change it from settings.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.2.0

- review the settings entries, command entries
- picking a launch config from statusbar
  - allow show/hide a status item for launch configs
  - allow starting a Run without debugging (If you want start debugging, you may change our default behavior from settings)

### 1.1.0

- changed: the buildTags will be retrieved from [Go][^2] settings. see also setting 'go.buildTags'.
- changed: we will append 'vscode' into buildTags.

### 1.0.0

Just a replacement to `go run ./main.go`.



## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
