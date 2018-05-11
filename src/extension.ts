'use strict';

import * as vscode from 'vscode';
import * as child_process from 'child_process';

class HindentFormatEditsProvider implements
  vscode.DocumentFormattingEditProvider,
  vscode.DocumentRangeFormattingEditProvider {
  hindentFound: boolean = false;
  command: string = "hindent";
  arguments: Array<string> = [];

  constructor() { this.configure(); }

  configure() {
    const config = vscode.workspace.getConfiguration('hindentFormat');
    const commandline = config.get('command', 'hindent');
    const args = commandline.split(' ');

    let result = child_process.spawnSync(args[0], ['--version']);
    if (!result.status) {
      this.hindentFound = true;
      this.command = args[0];
      this.arguments = args.slice(1);

      // Use `editor.wrappingColumn` if no line width is given on the hindent
      // commandline.
      if (this.arguments.indexOf('--line-length') === -1) {
        const wrappingColumn = vscode.workspace.getConfiguration('editor').get(
          'wrappingColumn', '80');
        this.arguments.push('--line-length');
        this.arguments.push(wrappingColumn);
      }
    }
  }

  formatHindent(text: string) {
    if (this.hindentFound) {
      let result = child_process.spawnSync(
        this.command, this.arguments, { 'input': text });
      if (!result.status) {
        return result.stdout.toString();
      } else {
        // TODO Make warning widget disappear after 5 seconds.
        vscode.window.showWarningMessage(result.stderr.toString().split('\n')[0]);
        return '';
      }
    } else {
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
  // TODO Do not activate, if hindent cannot be executed.
  let hindentFormatProvider = new HindentFormatEditsProvider();

  vscode.languages.registerDocumentFormattingEditProvider(
    {scheme: '', language: 'haskell'}, hindentFormatProvider);
  vscode.languages.registerDocumentRangeFormattingEditProvider(
    {scheme: '', language: 'haskell'}, hindentFormatProvider);

  vscode.workspace.onDidChangeConfiguration(function (event) {
    hindentFormatProvider.configure();
  });
}

export function deactivate() { }