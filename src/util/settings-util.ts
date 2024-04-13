import * as vscode from 'vscode';
import { AppScopeName } from './consts';

export const settings = {
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
    get enableRunModeCmd(): string { return `${AppScopeName}.launchConfigs.pickForRun`; },
    get enableDebugModeCmd(): string { return `${AppScopeName}.launchConfigs.pickForDebug`; },
    get enableRunOrDebug(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("launch.enableRunOrDebug", true);
    },
    set enableRunOrDebug(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("launch.enableRunOrDebug", b, true);
    },

    get enableCodeLensCmd(): string { return `${AppScopeName}.codeLens.enable`; },
    get disableCodeLensCmd(): string { return `${AppScopeName}.codeLens.disable`; },
    get codeLensActionCmd(): string { return `${AppScopeName}.codeLens.runOrDebug`; },
    get launchMainFuncCmd(): string { return this.codeLensActionCmd; },
    get enableCodeLens(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.enableCodeLens", true);
    },
    set enableCodeLens(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("main.enableCodeLens", b, true);
    },

    get runAsPackageCmd(): string { return `${AppScopeName}.codeLens.runAsPackage`; },
    get runAsSingleFileCmd(): string { return `${AppScopeName}.codeLens.runAsSingleFile`; },
    get runAsPackage(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.asPackage", true);
    },
    set runAsPackage(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("main.run.asPackage", b, true);
    },

    get enableVerboseBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.enableVerbose`; },
    get disableVerboseBuildTagCmd(): string { return `${AppScopeName}.codeLens.buildTags.disableVerbose`; },
    get enableVerboseBuildTag(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.verbose", true);
    },
    set enableVerboseBuildTag(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("main.run.verbose", b, true);
    },
    get enableDelveBuildTag(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.buildtag.delve", false);
    },
    get enableVscodeBuildTag(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("main.run.buildtag.vscode", true);
    },
    get runBuildTagsCmd(): string { return `${AppScopeName}.build-tags`; },
    get runBuildTags(): string {
        return vscode.workspace.getConfiguration(AppScopeName).get<string>("main.run.tags", '');
    },
    set runBuildTags(b: string) {
        vscode.workspace.getConfiguration(AppScopeName).update("main.run.tags", b, true);
    },
    get runConfigs(): any[] {
        return vscode.workspace.getConfiguration(AppScopeName).get<any[]>("main.run.configs", []);
    },
    set runConfigs(b: any[]) {
        vscode.workspace.getConfiguration(AppScopeName).update("main.run.configs", b, true);
    },
};

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
}
