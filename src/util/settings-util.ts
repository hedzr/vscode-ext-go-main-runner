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
    get statusItemVisible(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("enableStatusItem", true);
    },
    set statusItemVisible(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("enableStatusItem", b, true);
    },
    get statusItemVisibleOnce(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("enableStatusItemOnce", true);
    },
    set statusItemVisibleOnce(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("enableStatusItemOnce", b, true);
    },
    get enableRunOrDebug(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("enableRunOrDebug", true);
    },
    set enableRunOrDebug(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("enableRunOrDebug", b, true);
    },
    get enableCodeLens(): boolean {
        return vscode.workspace.getConfiguration(AppScopeName).get<boolean>("enableCodeLens", true);
    },
    set enableCodeLens(b: boolean) {
        vscode.workspace.getConfiguration(AppScopeName).update("disableCodeLens", b, true);
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
