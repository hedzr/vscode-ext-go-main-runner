import * as vscode from 'vscode';
import { AppRunTerminalName, AppScopeName } from './consts';
import Term from '../terminal/term';
import path from 'path';
// import * as cp from 'child_process';
import * as fs from 'fs';

export function listExtensions(predicate: (value: vscode.Extension<any>, index: number, array: readonly vscode.Extension<any>[]) => unknown, thisArg?: any) {
    let extensions = vscode.extensions.all;
    // extensions = extensions.filter(extension => !extension.id.startsWith('vscode.'));
    extensions = extensions.filter(predicate, thisArg);
    console.log(extensions);
}

export function listVscodeExtensions() {
    listExtensions(extension => extension.id.startsWith('vscode.'));
}

export function listNonVscodeExtensions() {
    listExtensions(extension => !extension.id.startsWith('vscode.'));
}

export function listAllCommands() {
    // vscode.QuickPicks.
}

export function focusedEditingFilePath(): string {
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        // for getting file path
        const filePath = activeEditor.document.uri.path;
        return filePath;
    }
    return '';
}

export async function openVscodeSettings(jsonDirectly: boolean = false, filter = '') {
    if (jsonDirectly) {
        await vscode.commands.executeCommand(
            'workbench.action.openSettingsJson',
            // { revealSetting: { key: 'decorateFiles.filePaths', edit: true } }
            filter // 'editor.formatOnSaveTimeout'
        );
        return;
    }
    await vscode.commands.executeCommand('workbench.action.openSettings', filter);
}

export function settingsActionSearch(...args: any[]) {
    vscode.commands.executeCommand('settings.action.search', ...args);
}

export function findGoMod(fromPath: string): string {
    const dir = path.dirname(fromPath);
    if (dir === fromPath) {
        return '';
    }
    const gomodfile = path.join(dir, "go.mod");
    if (fs.existsSync(gomodfile)) {
        return gomodfile;
    }
    return findGoMod(dir);
}


//


export enum LaunchMode {
    RunInTerminal = 'runInTerminal',
    Run = 'run',
    Debug = 'debug',
}

export function debug(...args: any[]) {
    vscode.commands.executeCommand('workbench.action.debug.start', ...args);
}

export function run(...args: any[]) {
    vscode.commands.executeCommand('workbench.action.debug.run', ...args);
}

export function debugFromConfig(...args: any[]) {
    vscode.commands.executeCommand('workbench.action.debug.selectandstart', ...args);
}

export function showLaunchConfigsAndStartDebug() {
    // debugFromConfig();
    showLaunchConfigsAndStart();
}

export function showLaunchConfigsAndStart() {
    showQuickOpen('debug ');
}

export function showQuickOpen(...args: any[]) {
    vscode.commands.executeCommand('workbench.action.quickOpen', ...args);
}

export function showCommands(...args: any[]) {
    // if (!args) {
    //     args = ['>'];
    // }
    vscode.commands.executeCommand('workbench.action.showCommands', ...args);
}

export function selectConfigAndRun(...args: any[]) {
    vscode.commands.executeCommand('debug.startFromConfig', ...args);
    // Error: 'launch.json' does not exist for passed workspace folder
}

export function runWithConfig(runCmd: string, config?: any, callback?: () => void | null) {
    if (config) {
        const tags = buildTags(config);
        if (tags) {
            config.buildFlags = `${config.buildFlags} -tags '${tags}'`;
        }
    }
    vscode.commands.executeCommand(runCmd, config).then(() => {
        // vscode.window.showInformationMessage('OK!');
        settings.picked = true;
        settings.pickedConfigName = config?.name;
        // launchConfigsStatusBarItem.hide();
        if (callback) { callback(); }
    }, err => {
        console.log(err);
        // vscode.window.showInformationMessage('Error: ' + err.message);
    });
}

function buildTags(config?: any): string {
    var buildTags = vscode.workspace.getConfiguration('go').get("buildTags", 'vscode');
    var tags: string[] = [];
    buildTags.split(/[ ,]+/).forEach((v, i, a) => {
        if (v !== '' && v !== 'vscode' && tags.indexOf(v) === -1) { tags.push(v); }
    });
    let matches = /-tags ['"]?([^'" ]+)/.exec(config?.buildFlags);
    if (matches !== null) {
        matches[1].split(/[ ,]+/).forEach((v, i, a) => {
            if (v !== '' && v !== 'vscode' && tags.indexOf(v) === -1) { tags.push(v); }
        });
    }
    if (settings.enableVerboseBuildTag && tags.indexOf('verbose') === -1) { tags.push('verbose'); }
    if (settings.enableDelveBuildTag && tags.indexOf('delve') === -1) { tags.push('delve'); }
    settings.runBuildTags.split(/[ ,]+/).forEach((v, i, a) => {
        if (v !== '' && tags.indexOf(v) === -1) { tags.push(v); }
    });
    if (settings.enableVscodeBuildTag && tags.indexOf('vscode') === -1) { tags.push('vscode'); }
    // console.log(`tags: verbose=${settings.enableVerboseBuildTag}, delve=${settings.enableDelveBuildTag}, vscode=${settings.enableVscodeBuildTag}`);
    buildTags = tags.join(',');
    // if (!/[ ,]?vscode[ ,]?/.test(buildTags)) {
    //     buildTags = `${buildTags.replace(/[ ,]+$/, '')},vscode`.replace(/^[ ,]+/, '');
    // }
    return buildTags;
}

// see: https://stackoverflow.com/questions/43007267/how-to-run-a-system-command-from-vscode-extension
export function launchMainProg(src: string, config?: any, ...extraArgs: any[]) {
    // const currFile = focusedEditingFilePath();
    // console.log("codelensAction.args:", args, 'file path:', currFile, 'src file:', src);
    const gomod = findGoMod(src);
    if (!gomod) {
        vscode.window.showInformationMessage('Fail to go run: go.mod not found.');
        return;
    }

    const minSizeArg = settings.gorunMinSize ? '-ldflags="-s -w" ' : '';
    const disArg = settings.disableLocalInlineOptimizations ? '-gcflags=all="-N -l" ' : '';
    const verboseArg = settings.gorunVerbose ? '-v ' : '';
    const workDir = path.dirname(gomod);
    const mainGo = src;
    const mainGoDir = path.dirname(mainGo);
    const tags = buildTags(config);
    const tagsArg = tags ? `-tags ${tags} ` : '';
    const sources = settings.runAsPackage ? mainGoDir : mainGo;
    const args = (config?.args ?? []).join(' ');

    const cmd = `go run ${minSizeArg}${disArg}${verboseArg}${tagsArg} ${sources} ${args}`;
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

let terminalOperator: Term;
let privates = {
    picked: false,
    pickedConfigName: '',
};

export const settings = {
    get picked() { return privates.picked; },
    set picked(b: boolean) { privates.picked = b; },
    get pickedConfigName() { return privates.pickedConfigName; },
    set pickedConfigName(v: string) { privates.pickedConfigName = v; },

    install(c: vscode.ExtensionContext) {
        // context = c;
        terminalOperator = new Term(c);
    },

    get launches(): any[] {
        if (vscode.workspace.workspaceFolders) {
            const workspace = vscode.workspace.workspaceFolders[0];
            const conf = vscode.workspace.getConfiguration("launch", workspace.uri);
            const configurations = conf.get<any[]>("configurations");

            //     if(!configurations) {
            //         return;
            //     }

            // configurations.forEach((config) => {
            //         // read or modify the config
            //     })

            if (configurations) {
                return configurations;
            }
        }
        return [];
    },

    get enableStatusItemCmd(): string { return `${AppScopeName}.launchConfigs.enableStatusItem`; },
    get disableStatusItemCmd(): string { return `${AppScopeName}.launchConfigs.disableStatusItem`; },
    get runStatusItemCmd(): string { return `${AppScopeName}.launchConfigs.runOrDebug`; },
    get launchWithConfigsCmd(): string { return this.runStatusItemCmd; },
    get statusItemVisible(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("launch.enableStatusItem", true);
    },
    set statusItemVisible(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("launch.enableStatusItem", b, true);
    },
    get statusItemVisibleOnce(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("launch.enableStatusItemOnce", true);
    },
    set statusItemVisibleOnce(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("launch.enableStatusItemOnce", b, true);
    },
    // get enableRunModeCmd(): string { return `${AppScopeName}.launchConfigs.pickForRun`; },
    // get enableDebugModeCmd(): string { return `${AppScopeName}.launchConfigs.pickForDebug`; },
    // get enableRunOrDebug(): boolean {
    //     return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("launch.enableRunOrDebug", true);
    // },
    // set enableRunOrDebug(b: boolean) {
    //     vscode.workspace.getConfiguration(AppScopeName).update("launch.enableRunOrDebug", b, true);
    // },
    get launchMode(): LaunchMode {
        return vscode.workspace.getConfiguration(AppScopeName).get<LaunchMode>("launch.mode", LaunchMode.RunInTerminal);
    },
    set launchMode(b: LaunchMode) {
        vscode.workspace.getConfiguration(AppScopeName).update("launch.mode", b, true);
    },

    get enableCodeLensCmd(): string { return `${AppScopeName}.codeLens.enable`; },
    get disableCodeLensCmd(): string { return `${AppScopeName}.codeLens.disable`; },
    get codeLensActionCmd(): string { return `${AppScopeName}.codeLens.runOrDebug`; },
    get launchMainFuncCmd(): string { return this.codeLensActionCmd; },

    get enableCodeLens(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.enableCodeLens", true); },
    set enableCodeLens(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.enableCodeLens", b, true); },

    get runAsPackageCmd(): string { return `${AppScopeName}.codeLens.runAsPackage`; },
    get runAsSingleFileCmd(): string { return `${AppScopeName}.codeLens.runAsSingleFile`; },
    get runAsPackage(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.asPackage", true); },
    set runAsPackage(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.asPackage", b, true); },

    get enableVerboseBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.enableVerbose`; },
    get disableVerboseBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.disableVerbose`; },
    get toggleVerboseBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.toggleVerbose`; },

    get enableDelveBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.enableDelve`; },
    get disableDelveBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.disableDelve`; },
    get toggleDelveBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.toggleDelve`; },

    get enableDockerBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.enableDocker`; },
    get disableDockerBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.disableDocker`; },
    get toggleDockerBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.toggleDocker`; },

    get enableK8sBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.enableK8s`; },
    get disableK8sBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.disableK8s`; },
    get toggleK8sBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.toggleK8s`; },

    get enableIstioBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.enableIstio`; },
    get disableIstioBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.disableIstio`; },
    get toggleIstioBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.toggleIstio`; },

    get enableVscodeBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.enableVscode`; },
    get disableVscodeBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.disableVscode`; },
    get toggleVscodeBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.toggleVscode`; },

    get enableVerboseBuildTag(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.tags.verbose", false); },
    set enableVerboseBuildTag(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.tags.verbose", b, true); },
    get enableDelveBuildTag(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.tags.delve", false); },
    set enableDelveBuildTag(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.tags.delve", b, true); },
    get enableDockerBuildTag(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.tags.docker", false); },
    set enableDockerBuildTag(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.tags.docker", b, true); },
    get enableK8sBuildTag(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.tags.k8s", false); },
    set enableK8sBuildTag(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.tags.k8s", b, true); },
    get enableIstioBuildTag(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.tags.istio", false); },
    set enableIstioBuildTag(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.tags.istio", b, true); },
    get enableVscodeBuildTag(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.tags.vscode", true); },
    set enableVscodeBuildTag(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.tags.vscode", b, true); },

    get runBuildTagsCmd(): string { return `${AppScopeName}.build-tags`; },
    get runBuildTags(): string { return vscode.workspace.getConfiguration(AppScopeName).get<string>("main.run.tags.more", ''); },
    set runBuildTags(b: string) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.tags.more", b, true); },
    get runConfigs(): any[] { return vscode.workspace.getConfiguration(AppScopeName).get<any[]>("main.run.configs", []); },
    set runConfigs(b: any[]) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.configs", b, true); },

    get gorunVerbose(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.verbose", false); },
    set gorunVerbose(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.verbose", b, true); },
    get gorunMinSize(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.min-size", true); },
    set gorunMinSize(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.min-size", b, true); },
    get disableLocalInlineOptimizations(): boolean { return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.no-optimize", false); },
    set disableLocalInlineOptimizations(b: boolean) { vscode.workspace.getConfiguration(AppScopeName).update("main.run.no-optimize", b, true); },

} as const;

export type TSettings = keyof typeof settings;

export class Store {
    context?: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext | null = null) {
        if (context) {
            this.context = context;
        }
    }

    public get selectedLaunchConfigName(): string {
        return this.context?.workspaceState.get<string>(`${AppScopeName}.selectedLaunchConfig`, '') || '';
    }
    public set selectedLaunchConfigName(s: string) {
        this.context?.workspaceState.update(`${AppScopeName}.selectedLaunchConfig`, s);
    }
};

