'use strict';

import path from 'path';
import * as vscode from 'vscode';
import { AppScopeName, GolangId } from '../util/consts';
import * as cu from '../util/codelens-util';
import { TSettings, settings } from '../util/settings-util';

// interface M1<T> {
// 	[index: string]: T,
// 	[index: number]: T;
// }

type func4Map = () => void;
type funcMap = Map<string, func4Map>;

function getValue<T, K extends keyof T>(data: T, key: K) {
	return data[key];
}
function setValue<T, K extends keyof T, V extends T[K]>(data: T, key: K, value: V) {
	data[key] = value;
}

class FileCodeLens extends vscode.CodeLens {
	file: string;
	constructor(file: string, range: vscode.Range, command?: vscode.Command) {
		super(range, command);
		this.file = file;
	}
	public workDir(): string {
		return path.dirname(this.file);
	}
}

class RunFileCodeLens extends FileCodeLens {
	constructor(file: string, range: vscode.Range, command?: vscode.Command) {
		super(file, range, command);
		// super.command = opts;
		this.command = {
			title: "▷ Run", // title: `$(debug-start) Run`,
			tooltip: "Run main() function in Terminal Window",
			// command: 'debug.startFromConfig',
			command: settings.launchMainFuncCmd,
			arguments: [this.file]
		};
	}
}

class DebugFileCodeLens extends FileCodeLens {
	constructor(file: string, range: vscode.Range, command?: vscode.Command) {
		super(file, range, command);
		// super.command = opts;
		this.command = {
			title: "Debug",
			tooltip: "Debug main() function",
			command: "workbench.action.debug.start",
			arguments: [this.file],
			// when: "debuggersAvailable && debugState == 'inactive'"
		};
	}
}

interface LocT {
	file: string,
	range: vscode.Range,
};

// class Loc implements LocT {
// 	file: string;
// 	range: vscode.Range;
// 	constructor(file: string, range: vscode.Range) {
// 		this.file = file;
// 		this.range = range;
// 	}
// };

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

	private codeLenses: vscode.CodeLens[] = [];
	private regex: RegExp;
	private locations: LocT[] = [];
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		// see: https://regex101.com/r/BVRyIR/1
		this.regex = /(?=\n?)func main\(\) (.*)/g;
		// this.regex = /(.+)/g;

		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});
	}

	public install(context: vscode.ExtensionContext) {
		settings.install(context); //
		cu.install(context);       // codelens helper wants a saved context to locate workspace folder

		// see: https://code.visualstudio.com/api/references/document-selector
		// context.subscriptions.push(vscode.languages.registerCodeLensProvider(AppLangId, codelensProvider));
		context.subscriptions.push(vscode.languages.registerCodeLensProvider(GolangId, this));
		// disposables.push(languages.registerCodeLensProvider("*", codelensProvider));

		context.subscriptions.push(vscode.commands.registerCommand(settings.enableCodeLensCmd, () => {
			settings.enableCodeLens = true;
			vscode.window.showInformationMessage(`[${AppScopeName}] CodeLens (go run func main) is ${settings.enableCodeLens ? 'enabled' : 'disabled'}`);
		}));
		context.subscriptions.push(vscode.commands.registerCommand(settings.disableCodeLensCmd, () => {
			settings.enableCodeLens = false;
			vscode.window.showInformationMessage(`[${AppScopeName}] CodeLens (go run func main) is ${settings.enableCodeLens ? 'enabled' : 'disabled'}`);
		}));

		this.installBuildTagBooleanCfg(context, 'enableVerboseBuildTag', [
			settings.enableVerboseBuildTagCmd, settings.disableVerboseBuildTagCmd, settings.toggleVerboseBuildTagCmd
		]);
		this.installBuildTagBooleanCfg(context, 'enableDelveBuildTag', [
			settings.enableDelveBuildTagCmd, settings.disableDelveBuildTagCmd, settings.toggleDelveBuildTagCmd
		]);
		this.installBuildTagBooleanCfg(context, 'enableDockerBuildTag', [
			settings.enableDockerBuildTagCmd, settings.disableDockerBuildTagCmd, settings.toggleDockerBuildTagCmd
		]);
		this.installBuildTagBooleanCfg(context, 'enableK8sBuildTag', [
			settings.enableK8sBuildTagCmd, settings.disableK8sBuildTagCmd, settings.toggleK8sBuildTagCmd
		]);
		this.installBuildTagBooleanCfg(context, 'enableIstioBuildTag', [
			settings.enableIstioBuildTagCmd, settings.disableIstioBuildTagCmd, settings.toggleIstioBuildTagCmd
		]);
		this.installBuildTagBooleanCfg(context, 'enableVscodeBuildTag', [
			settings.enableVscodeBuildTagCmd, settings.disableVscodeBuildTagCmd, settings.toggleVscodeBuildTagCmd
		]);
	}

	installBuildTagBooleanCfg(context: vscode.ExtensionContext, cfgname: TSettings, commands: string[]) {
		context.subscriptions.push(vscode.commands.registerCommand(commands[0], () => { setValue(settings, cfgname, true); }));
		context.subscriptions.push(vscode.commands.registerCommand(commands[1], () => { setValue(settings, cfgname, false); }));
		context.subscriptions.push(vscode.commands.registerCommand(commands[2], () => {
			setValue(settings, cfgname, !getValue(settings, cfgname));
			vscode.window.showInformationMessage(`buildtag '${cfgname}' is ${getValue(settings, cfgname) ? 'enabled' : 'disabled'}`);
		}));
	}

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		if (settings.enableCodeLens) {
			this.codeLenses = [];
			this.locations = [];
			const regex = new RegExp(this.regex);
			const text = document.getText();
			let matches;
			while ((matches = regex.exec(text)) !== null) {
				const line = document.lineAt(document.positionAt(matches.index).line);
				const indexOf = line.text.indexOf(matches[0]);
				const position = new vscode.Position(line.lineNumber, indexOf);
				const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
				if (range) {
					// const loc = new Loc(document.fileName, range);
					const loc = <LocT>{ file: document.fileName, range: range };
					this.codeLenses.push(new RunFileCodeLens(document.fileName, range));
					this.codeLenses.push(new DebugFileCodeLens(document.fileName, range));
					this.locations.push(loc);
					// console.log('[func main] add location: ', loc);
				}
			}
			console.log('[func main] locations: ', this.locations);
			return this.codeLenses;
		}
		return [];
	}

	public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
		if (settings.enableCodeLens) {
			// console.log("codelens:", codeLens);
			return codeLens;
		}
		return null;
	}

}
