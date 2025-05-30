import * as vscode from 'vscode';


type Note = {
    uri: string;
    line: number;
    content: string;
};

const notes: Note[] = [];

export function registerNoteCommand(context: vscode.ExtensionContext) {
    console.log('✅ notes feature loaded');

    const addNoteCommand = vscode.commands.registerCommand('sidenote.addNote', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        const document = editor.document;
        const uri = document.uri.toString();
        const line = editor.selection.active.line;

        const existing = notes.find(n => n.uri === uri && n.line === line);
        const placeholder = existing ? existing.content : 'Add a note for this line';

        const input = await vscode.window.showInputBox({
            prompt: `Enter a note for line ${line + 1}`,
            value: placeholder,
        });

        if (!input) return;

        // Remove existing note if any, and add new one
        const index = notes.findIndex(n => n.uri === uri && n.line === line);
        if (index !== -1) notes.splice(index, 1);
        notes.push({ uri, line, content: input });

        applyNoteDecorations(editor);
    });

    context.subscriptions.push(addNoteCommand);
}

function applyNoteDecorations(editor: vscode.TextEditor) {
    const uri = editor.document.uri.toString();

    const decorations: vscode.DecorationOptions[] = notes
        .filter(n => n.uri === uri)
        .map(n => ({
            range: new vscode.Range(n.line, 0, n.line, 0),
            hoverMessage: `💬 ${n.content}`,
        }));

    const decorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: true,
        after: {
            contentText: ' 💬',
            margin: '0 0 0 1rem',
            color: '#999',
        },
    });

    editor.setDecorations(decorationType, decorations);
}