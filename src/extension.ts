'use strict';

import * as vscode from 'vscode';
import * as child_process from 'child_process';
import { Position } from 'vscode';

class HindentFormatEditsProvider implements
    vscode.DocumentFormattingEditProvider,
    vscode.DocumentRangeFormattingEditProvider {
  command: string = null;
  arguments: Array<string> = null;

  constructor() { this.configure(); }

  configure() {
    const config = vscode.workspace.getConfiguration('hindentFormat');
    const commandline = config.get('command', 'hindent');
    const args = commandline.split(' ');

    let result = child_process.spawnSync(args[0], ['--version']);
    if (!result.status) {
      this.command = args[0];
      this.arguments = args.slice(1);

      // Use `editor.wrappingColumn` if no line width is given on the hindent
      // commandline.
      if (this.arguments.indexOf('--line-length') == -1) {
        const wrappingColumn = vscode.workspace.getConfiguration('editor').get(
            'wrappingColumn', '80');
        this.arguments.push('--line-length');
        this.arguments.push(wrappingColumn);
      }
    } else {
      this.command = null;
      this.arguments = null;
    }
  }

  formatHindent(text: string) {
    if (this.command != null) {
      let result = child_process.spawnSync(
          this.command, this.arguments, {'input': text});
      if (!result.status) {
        return result.stdout.toString();
      } else {
        // TODO Make warning widget disappear after 5 seconds.
        vscode.window.showWarningMessage(result.stderr.toString());
        return text;
      }
    } else {
      return '';
    }
  }

  provideDocumentFormattingEdits(
      document: vscode.TextDocument, options: vscode.FormattingOptions,
      token: vscode.CancellationToken):
      vscode.TextEdit[]|Thenable<vscode.TextEdit[]> {
    let formatted = this.formatHindent(document.getText());
    if (formatted != '') {
      let range = document.validateRange(new vscode.Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE));
      return [vscode.TextEdit.replace(range, formatted)];
    }
    else
      return [];
  }

  provideDocumentRangeFormattingEdits(
      document: vscode.TextDocument, range: vscode.Range,
      options: vscode.FormattingOptions, token: vscode.CancellationToken):
      vscode.TextEdit[]|Thenable<vscode.TextEdit[]> {
    let formatted = this.formatHindent(document.getText(range));
    if (formatted != '')
      return [vscode.TextEdit.replace(range, formatted)];
    else
      return [];
  }
}

export function activate(context: vscode.ExtensionContext) {
  // TODO Do not activate, if hindent cannot be executed.
  let hindentFormatProvider = new HindentFormatEditsProvider();

  vscode.languages.registerDocumentFormattingEditProvider(
      'haskell', hindentFormatProvider);
  vscode.languages.registerDocumentRangeFormattingEditProvider(
      'haskell', hindentFormatProvider);
  vscode.commands.registerTextEditorCommand('haskell.hindent',
    (textEditor: vscode.TextEditor, textEditorEdit: vscode.TextEditorEdit) => {
    const document = textEditor.document;
    const newText = new HindentFormatEditsProvider().formatHindent(document.getText());
    const documentRange = new vscode.Range(
      new vscode.Position(0, 0),
      document.lineAt(document.lineCount - 1).range.end
    )


    textEditorEdit.replace(documentRange, newText);
  });

  vscode.workspace.onDidChangeConfiguration(function(event) {
    hindentFormatProvider.configure();
  });
}

export function deactivate() {}
