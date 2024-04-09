'use strict';

import path from 'path';
import * as vscode from 'vscode';
import { AppScopeName } from '../util/consts';

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
			title: "▷ Run",
			tooltip: "Run main() function in Terminal Window",
			command: `${AppScopeName}.codelensAction`,
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

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

	private codeLenses: vscode.CodeLens[] = [];
	private regex: RegExp;
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

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		if (vscode.workspace.getConfiguration(AppScopeName).get("enableCodeLens", true)) {
			this.codeLenses = [];
			const regex = new RegExp(this.regex);
			const text = document.getText();
			let matches;
			while ((matches = regex.exec(text)) !== null) {
				const line = document.lineAt(document.positionAt(matches.index).line);
				const indexOf = line.text.indexOf(matches[0]);
				const position = new vscode.Position(line.lineNumber, indexOf);
				const range = document.getWordRangeAtPosition(position, new RegExp(this.regex));
				if (range) {
					this.codeLenses.push(new RunFileCodeLens(document.fileName, range));
					this.codeLenses.push(new DebugFileCodeLens(document.fileName, range));
				}
			}
			return this.codeLenses;
		}
		return [];
	}

	public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
		if (vscode.workspace.getConfiguration(AppScopeName).get("enableCodeLens", true)) {
			console.log("codelens:", codeLens);
			return codeLens;
		}
		return null;
	}

}
