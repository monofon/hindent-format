'use strict';

import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as path from 'path';

class HindentFormatEditsProvider implements
    vscode.DocumentFormattingEditProvider,
    vscode.DocumentRangeFormattingEditProvider {
    hindentAvailable: boolean = false;
    enable: boolean = true;
    command: string = "hindent";
    arguments: Array<string> = [];

    constructor() { this.configure(); }

    configure() {
        const config = vscode.workspace.getConfiguration('hindent-format');
        this.enable = config.get('enable', true);
        this.command = config.get('command', 'hindent');

        if (this.enable) {
            let result = child_process.spawnSync(this.command, ['--version']);
            if (!result.status) {
                this.hindentAvailable = true;

                console.log("hindent-format: using executable: " + this.command);
            } else {
                this.hindentAvailable = false;
                vscode.window.showWarningMessage("hindent-format: cannot execute hindent command: " + this.command);
            }
        }
    }

    formatHindent(text: string) {
        let cwd = '.';
        // May this helps hindent pick up the .hindent.yaml file
        if (vscode.window.activeTextEditor) {
            let documentPath = vscode.window.activeTextEditor.document.uri.fsPath;
            cwd = path.dirname(documentPath);
        }
        let result = child_process.spawnSync(this.command, this.arguments, { cwd: cwd, input: text });

        if (result.error) {
            let error = <NodeJS.ErrnoException>result.error;
            let message = error.message;
            if (error.code === "ENOENT") {
                message = "Could not locate hindent. Try specifying the hindent-format.command setting?";
            }
            vscode.window.showErrorMessage(message);
            return '';
        }

        if (!result.status) {
            return result.stdout.toString();
        } else {
            vscode.window.showWarningMessage(result.stderr.toString().split('\n')[0]);
            return '';
        }
    }

    provideDocumentFormattingEdits(
        document: vscode.TextDocument, options: vscode.FormattingOptions,
        token: vscode.CancellationToken):
        vscode.TextEdit[] | Thenable<vscode.TextEdit[]> {

        let formatted = this.formatHindent(document.getText());
        if (formatted !== '') {
            let range = document.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
            return [vscode.TextEdit.replace(range, formatted)];
        } else {
            return [];
        }
    }

    provideDocumentRangeFormattingEdits(
        document: vscode.TextDocument, range: vscode.Range,
        options: vscode.FormattingOptions, token: vscode.CancellationToken):
        vscode.TextEdit[] | Thenable<vscode.TextEdit[]> {

        let formatted = this.formatHindent(document.getText(range));
        if (formatted !== '') {
            return [vscode.TextEdit.replace(range, formatted)];
        } else {
            return [];
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log("hindent-format: active!");
    let hindentFormatProvider = new HindentFormatEditsProvider();

    if (hindentFormatProvider.hindentAvailable) {
        vscode.languages.registerDocumentFormattingEditProvider(
            'haskell', hindentFormatProvider);
        console.log("hindent-format: registered document formatting provider");

        vscode.languages.registerDocumentRangeFormattingEditProvider(
            'haskell', hindentFormatProvider);
        console.log("hindent-format: registered selection formatting provider");

        vscode.commands.registerTextEditorCommand('hindent-format.format', (textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
            let range = textEditor.selection.with();
            if (range.isEmpty) {
                range = textEditor.document.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
            }
            let formatted = hindentFormatProvider.formatHindent(textEditor.document.getText(range));
            if (formatted !== '') {
                edit.replace(range, formatted);
            }
        });
        console.log("hindent-format: registered palette command");
    }
}

export function deactivate() { }
