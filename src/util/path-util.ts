'use strict';

// import sh from 'shelljs';
// import fs from 'fs';
import { homedir } from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
// import { window, workspace, ExtensionContext } from 'vscode';
import commonAncestorPath from 'common-ancestor-path';
import * as consts from './consts';
import * as osUtil from './os-util';

export class CodePathConfig {
    exportDirectoryOverride: string = '';
    nodePath: string = '';
}


export default abstract class Path {

    /**
     * 
     */
    public static getNodePath(): string {
        // const hasVolta = !!whichNormalized('volta');
        // if (hasVolta) {
        //   // get the actual Node binary location that is not inside the target directory (i.e. the globally installed version)
        //   const nodePath = await Process.execCaptureOut(`volta which node`, { processOptions: { cwd: __dirname } });
        //   return pathNormalized(nodePath);
        // }
        const p = vscode.workspace.getConfiguration(consts.AppScopeName).get<string>('paths.node');
        return p || 'node';
    }

    /**
     * 
     */
    public static getNpmPath(): string {
        const p = vscode.workspace.getConfiguration(consts.AppScopeName).get<string>('paths.npm');
        return p || 'npm';
    }

    /**
     * 
     */
    public static getYarnPath(): string {
        const p = vscode.workspace.getConfiguration(consts.AppScopeName).get<string>('paths.yarn');
        return p || 'yarn';
    }

    public static getSystemPath(what: string): string | undefined {
        const systemPathName = osUtil.isWindows() ? 'paths.windows' : 'paths.posix';
        return vscode.workspace.getConfiguration(consts.AppScopeName).get<string>(`${systemPathName}.${what}`);
    }

    public static getShellPath(): string {
        const p = this.getSystemPath('shell');
        return p || 'bash';
    }

    public static getShellName(): string {
        const p = this.getShellPath();
        // https://stackoverflow.com/questions/4250364/how-to-trim-a-file-extension-from-a-string-in-javascript
        return path.parse(p).name;
    }

    static getShellConfig(what: string, shell: string | null = null, dontCheck = false): string {
        if (!shell) {
            // look-up shell
            shell = this.getShellName();
        }
        const target = `shells.${shell}.${what}`;
        const val = vscode.workspace.getConfiguration(consts.AppScopeName).get<string>(target);
        if (!dontCheck && !val) {
            throw new Error(`Could not read config value "${target}" - It must not be empty or undefined!`);
        }
        return val!;
    }

    public static getShellInlineFlags(): string {
        return this.getShellConfig('inlineFlags');
    }

    public static getShellPauseCommand(): string {
        return this.getShellConfig('pause');
    }

    public static getShellSep(): string {
        return this.getShellConfig('sep');
    }

    static fixExecutablePath(p: string): string {
        if (p.includes(' ')) {
            return `"${p}"`;
        } else {
            return p;
        }
    }


    /**
     * Get command executable path
     * @param {string} command the command being queried
     * @return {string} the actual path where `command` is
     */
    public static whichNormalized(command: string): string | null {
        // const cp = require('child_process');
        const fpath = cp.execSync('which "${command}"');
        // const fpath = await this.executeAndRead('which "${command}"');
        return fpath ? this.pathNormalized(fpath.toString().trim()) : null;
    }

    public static realPathSyncNormalized(fpath: string, options: any): string {
        return this.pathNormalized(fs.realpathSync(fpath, options));
    }

    public static pathResolve(...paths: string[]): string {
        return this.pathNormalized(path.resolve(...paths));
    }

    /**
     * @param  {...string} paths 
     * @returns {string}
     */
    public static pathJoin(...paths: string[]): string {
        return this.pathNormalized(path.join(...paths));
    }

    /**
     * @param {*} from Usually the shorter (potential parent/folder) path.
     * @param {*} to The (usually) more concrete file path.
     */
    public static pathRelative(from: string, to: string): string {
        from = this.pathNormalized(from);
        to = this.pathNormalized(to);
        const sep = '/';
        if (!from.endsWith(sep)) { from += '/'; }
        if (!to.endsWith(sep)) { to += '/'; }
        return this.pathNormalized(path.relative(from, to));
    }

    /**
     * It appears, VSCode is now not normalizing or normalizing to lower-case drive letter (e.g. in Uri.fspath!!!):
     * @see https://code.visualstudio.com/api/references/vscode-api#Uri 
     * @see https://github.com/microsoft/vscode/issues/45760#issuecomment-373417966
     * @see https://github.com/microsoft/vscode/blob/94c9ea46838a9a619aeafb7e8afd1170c967bb55/test/unit/coverage.js#L81
     * 
     * Before that (in 2016), they decided for upper-case drive letters:
     * @see https://github.com/microsoft/vscode/issues/9448
     * @see https://github.com/microsoft/vscode/commit/a6c845baf7fed4a186e3b744c5c14c0be53494fe
     */
    public static normalizeDriveLetter(fpath: string): string {
        if (fpath && fpath[1] === ':') {
            fpath = fpath[0].toUpperCase() + fpath.substr(1);
        }
        return fpath;
    }

    public static pathNormalized(fpath: string): string {
        return fpath.replace(/\\/g, '/');
    }

    /**
     * In addition to standard normalization, also enforces upper-case drive letter.
     */
    public static pathNormalizedForce(fpath: string): string {
        return this.normalizeDriveLetter(this.pathNormalized(fpath));
    }

    public static getPathRelativeToCommonAncestor(fpath: string, ...otherPaths: string[]): string {
        const common = this.getCommonAncestorPath(fpath, ...otherPaths);
        return this.pathNormalizedForce(
            common &&
            this.pathRelative(common, fpath) ||
            fpath
        );
    }

    /**
     * @see https://github.com/isaacs/common-ancestor-path#readme
     */
    public static getCommonAncestorPath(...paths: string[]): string {
        // NOTE: the library requires OS-specific separators
        if (paths.length === 0) {
            return '';
        }
        paths = paths.map(p => path.resolve(p));
        const result = commonAncestorPath(...paths);
        return this.pathNormalized(result || '');
    }

    public static isFileInPath(parent: string, file: string): boolean {
        const relative = this.pathRelative(parent, file);
        return (!!relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
    }

    public static renderPath(fpath: string): string {
        const home = homedir();
        if (fpath.startsWith(home)) {
            fpath = '~' + fpath.substring(home.length);
        }
        return fpath;
    }

}

export class PathHolder {
    cfg?: CodePathConfig;
    context?: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext | null = null, _cfg: CodePathConfig | null = null) {
        if (context) {
            this.context = context;
        }
        if (_cfg) {
            this.cfg = _cfg; // this.setCodePathConfig(_cfg);
        }
    }

    public setCodePathConfig(_cfg: CodePathConfig) {
        this.cfg = _cfg;
    }

    public getDefaultExportDirectory() {
        const dir = Path.pathResolve(this.getUserDataDirectory(), 'exports');
        return this.cfg?.exportDirectoryOverride || dir;
    }

    public getApplicationDataPath(basePath: string, zip = true): string {
        let exportPath = Path.pathJoin(
            this.getDefaultExportDirectory(),
            `${basePath}${consts.AppDataFileNameSuffix}`
        );
        if (zip) {
            exportPath += '.zip';
        }
        return exportPath;
    }

    //


    public getResourcePath(...relativePathSegments: string[]): string {
        return this.asAbsolutePath(Path.pathJoin('resources', ...relativePathSegments));
    }

    public getUserDataDirectory(): string {
        return this.asAbsolutePath('userdata');
    }

    public getLogsDirectory() {
        return Path.pathResolve(this.getUserDataDirectory(), 'logs');
    }



    /**
     * @returns normalized, absolute path to the dbux-code extension directory.
     */
    public getCodeDirectory(): string {
        return this.asAbsolutePath('.');
    }

    public getThemeResourcePath(...relativePathSegments: string[]) {
        return {
            light: this.getResourcePath('light', ...relativePathSegments),
            dark: this.getResourcePath('dark', ...relativePathSegments)
        };
    }

    public getThemeResourcePathUri(...relativePathSegments: string[]) {
        return {
            light: vscode.Uri.file(this.getResourcePath('light', ...relativePathSegments)),
            dark: vscode.Uri.file(this.getResourcePath('dark', ...relativePathSegments))
        };
    }

    public asAbsolutePath(fpath: string): string {
        if (this.context) {
            return Path.pathNormalizedForce(this.context.asAbsolutePath(fpath));
        }
        return '';
    }

    public getExtensionPath(): string {
        if (this.context) {
            return Path.pathNormalizedForce(this.context.extensionPath);
        }
        return '';
    }

    public getGitPath(): string {
        const p = vscode.workspace.getConfiguration(consts.AppScopeName).get<string>('paths.git');
        return p || 'git';
    }

} // class PathHolder

export const execPaths = {
    pathHolder: new PathHolder(),

    get git(): string {
        return this.pathHolder.getGitPath();
    },
    get node(): string {
        return Path.getNodePath();
    },
    get npm(): string {
        return Path.getNpmPath();
    },
    get yarn(): string {
        return Path.getYarnPath();
    },
    shell: {
        get path(): string {
            return Path.getShellPath();
        },
        get name(): string {
            return Path.getShellName();
        },
        get inlineFlags(): string {
            return Path.getShellInlineFlags();
        },
        get pauseCommand(): string {
            return Path.getShellPauseCommand();
        },
        get sep(): string {
            return Path.getShellSep();
        },
    },
    /**
     * Put shell executable paths in quotation marks, plus -
     * 
     * hackfix: work-around volta bug for yarn and npm.
     * @see https://github.com/volta-cli/volta/issues/1199
     */
    inShell: {
        get yarn() {
            const { yarn } = execPaths;
            return Path.fixExecutablePath(yarn);
        },
        get npm() {
            const { npm } = execPaths;
            return Path.fixExecutablePath(npm);
        }
    }
};