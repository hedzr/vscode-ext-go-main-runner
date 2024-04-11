
import path = require('path');
import * as vscode from 'vscode';
// import * as cp from 'child_process';
import * as fs from 'fs';
import Term from '../terminal/term';
import { AppRunTerminalName, AppScopeName } from './consts';
import * as su from './sbar-util';

// let context: vscode.ExtensionContext;
let terminalOperator: Term;

export function install(c: vscode.ExtensionContext) {
    // context = c;
    terminalOperator = new Term(c);
    su.install(c);

    c.subscriptions.push(vscode.commands.registerCommand(`${AppScopeName}.codelensAction`, launchMainProg));
}

export function focusedEditingFilePath(): string {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        // for getting file path
        const filePath = activeEditor.document.uri.path;
        return filePath;
    }
    return '<unknown>';
}

export function findGoMod(fromPath: string): string {
    const dir = path.dirname(fromPath);
    const gomodfile = path.join(dir, "go.mod");
    if (fs.existsSync(gomodfile)) {
        return gomodfile;
    }
    if (dir) {
        return findGoMod(dir);
    }
    return '';
}

// see: https://stackoverflow.com/questions/43007267/how-to-run-a-system-command-from-vscode-extension
export function launchMainProg(src: string, ...args: any[]) {
    // const currFile = focusedEditingFilePath();
    // console.log("codelensAction.args:", args, 'file path:', currFile, 'src file:', src);
    const gomod = findGoMod(src);
    if (gomod) {
        const workDir = path.dirname(gomod);
        const mainGo = src;
        var buildTags = vscode.workspace.getConfiguration('go').get("buildTags", 'vscode');
        if (!/[ ,]?vscode[ ,]?/.test(buildTags)) {
            buildTags = `${buildTags.replace(/[ ,]+$/, '')},vscode`.replace(/^[ ,]+/, '');
        }
        const cmd = `go run -tags '${buildTags}' ${mainGo}`;
        console.log(`Sending command to terminal '${AppRunTerminalName}': ${cmd}`);

        // const execShell = (cmd: string) =>
        // 	new Promise<string>((resolve, reject) => {
        // 		cp.exec(cmd, (err, out) => {
        // 			if (err) {
        // 				console.log('stderr: ' + err);
        // 				return reject(err);
        // 			}
        // 			console.log('stdout: ' + out);
        // 			return resolve(out);
        // 		});
        // 	});
        // const cp = require('child_process')
        // execShell(cmd);

        // const terminal = new Term();
        terminalOperator.sendCommandToDefaultTerminal(workDir, cmd);
    }
}