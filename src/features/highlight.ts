import * as vscode from 'vscode';

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

        const decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 255, 0, 0.4)',
            borderRadius: '4px',
        });

        editor.setDecorations(decorationType, [selection]);
        vscode.window.setStatusBarMessage('✔ Text highlighted!', 2000);
    });

    context.subscriptions.push(highlightCommand);
}