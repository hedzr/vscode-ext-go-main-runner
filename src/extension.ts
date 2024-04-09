// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// import { ExtensionContext, languages, commands, Disposable, workspace } from 'vscode';
import { CodelensProvider } from './codelens-providers/codelens-provider';
import * as cu from './util/codelens-util';
import { AppScopeName, GolangId } from './util/consts';

// let disposables: Disposable[] = [];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "go-main-runner" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('go-main-runner.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from go-main-runner!');
	});

	context.subscriptions.push(disposable);

	// --- our main activators ---

	cu.setContext(context);

	const codelensProvider = new CodelensProvider();

	// see: https://code.visualstudio.com/api/references/document-selector
	// context.subscriptions.push(vscode.languages.registerCodeLensProvider(AppLangId, codelensProvider));
	context.subscriptions.push(vscode.languages.registerCodeLensProvider(GolangId, codelensProvider));
	// disposables.push(languages.registerCodeLensProvider("*", codelensProvider));

	context.subscriptions.push(vscode.commands.registerCommand(`${AppScopeName}.enableCodeLens`, () => {
		vscode.workspace.getConfiguration(AppScopeName).update("enableCodeLens", true, true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(`${AppScopeName}.disableCodeLens`, () => {
		vscode.workspace.getConfiguration(AppScopeName).update("enableCodeLens", false, true);
	}));

	context.subscriptions.push(vscode.commands.registerCommand(`${AppScopeName}.codelensAction`, cu.launchMainProg));
}

// This method is called when your extension is deactivated
export function deactivate() {
	// if (disposables) {
	// 	disposables.forEach(item => item.dispose());
	// }
	// disposables = [];
}
