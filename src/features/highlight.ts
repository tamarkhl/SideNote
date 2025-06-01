import * as vscode from 'vscode';
let highlightDecorationType: vscode.TextEditorDecorationType | null = null;

export function registerHighlightCommand(context: vscode.ExtensionContext) {
    console.log('✅ Highlight feature loaded');

    const highlightCommand = vscode.commands.registerCommand('sidenote.highlightSelection', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showWarningMessage('No text selected to highlight.');
            return;
        }

        highlightDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 255, 0, 0.4)',
            borderRadius: '4px',
        });

        editor.setDecorations(highlightDecorationType, [selection]);
        vscode.window.setStatusBarMessage('✔ Text highlighted!', 2000);
    });

    context.subscriptions.push(highlightCommand);
}

export function registerDeleteHighlightCommand(context: vscode.ExtensionContext) {
    const deleteHighlightCommand = vscode.commands.registerCommand('sidenote.deleteHighlight', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const line = editor.selection.active.line;
        const range = new vscode.Range(line, 0, line, editor.document.lineAt(line).text.length);

        if (highlightDecorationType) {
            editor.setDecorations(highlightDecorationType, []);
            vscode.window.setStatusBarMessage('🧹 Highlight cleared!', 2000);
        } else {
            vscode.window.showWarningMessage('No highlight to delete.');
        }
    });

    context.subscriptions.push(deleteHighlightCommand);
}