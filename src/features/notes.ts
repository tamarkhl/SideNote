import * as vscode from 'vscode';
import * as fs from 'fs'; //read-write files
import * as path from 'path'; //construct file paths

type Note = {
    uri: string;
    line: number;
    content: string;
};

let noteDecorationType: vscode.TextEditorDecorationType | null = null;

const NOTES_FILE = '.vscode/sidenote.notes.json'; //notes location in the project folder

function loadNotes() {
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath; //find root folder in the project
    if (!folder) return;

    const filePath = path.join(folder, NOTES_FILE); //constract full path to notes 

    if (fs.existsSync(filePath)) { //if file exists
        const raw = fs.readFileSync(filePath, 'utf-8'); //read it
        try {
            notes = JSON.parse(raw); //parse to JSON and save
        } catch {
            notes = [];
        }
    }
}

function saveNotes() {
    const folder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath; //find root folder
    if (!folder) return;

    const filePath = path.join(folder, NOTES_FILE); //constract fuul path

    const json = JSON.stringify(notes, null, 2); //convert notes array to JSON
    fs.mkdirSync(path.dirname(filePath), { recursive: true }); //ensure directory exists
    fs.writeFileSync(filePath, json, 'utf-8'); //save
}

let notes: Note[] = [];

export function registerNoteCommand(context: vscode.ExtensionContext) {
    loadNotes();

    const addNoteCommand = vscode.commands.registerCommand('sidenote.addNote', async () => { //defining the addNote command
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const uri = document.uri.toString();
        const line = editor.selection.active.line;

        const existing = notes.find(n => n.uri === uri && n.line === line); //existing note- if exists
        const input = await vscode.window.showInputBox({ //if existing- add existing, else- wait for user's note.
            prompt: `Enter a note for line ${line + 1}`,
            value: existing?.content ?? '',
        });

        if (!input) return;

        // Remove old note
        notes = notes.filter(n => !(n.uri === uri && n.line === line)); //replace old note if exists.
        notes.push({ uri, line, content: input });

        saveNotes(); // 👈 Save to file
        applyNoteDecorations(editor);
        
    });

    context.subscriptions.push(addNoteCommand);

    const editorChangeListener = vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            applyNoteDecorations(editor);
        }
    });
    context.subscriptions.push(editorChangeListener);
}

export function applyNoteDecorations(editor: vscode.TextEditor) {
    const fileUri = editor.document.uri.toString();
    const fileNotes = notes.filter(n => n.uri === fileUri);

    // Clear previous decoration type if it exists
    if (noteDecorationType) {
        noteDecorationType.dispose();
    }

    // Create a new decoration type (💬 icon)
    noteDecorationType = vscode.window.createTextEditorDecorationType({
        isWholeLine: false,
        after: {
            contentText: '💬',
            margin: '0 0 0 1rem',
        }
    });

    const decorations = fileNotes.map(n => ({
        range: new vscode.Range(
            n.line,
            editor.document.lineAt(n.line).range.end.character,
            n.line,
            editor.document.lineAt(n.line).range.end.character
        ),
        hoverMessage: n.content
    }));

    editor.setDecorations(noteDecorationType, decorations);
}

export function registerDeleteNoteCommand(context: vscode.ExtensionContext) {
    const deleteNoteCommand = vscode.commands.registerCommand('sidenote.deleteNote', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor.');
            return;
        }

        const fileUri = editor.document.uri.toString();
        const line = editor.selection.active.line;

        const index = notes.findIndex(n => n.uri === fileUri && n.line === line);
        if (index === -1) {
            vscode.window.showInformationMessage('No note found on this line.');
            return;
        }

        const confirm = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: `Delete note on line ${line + 1}?`
        });

        if (confirm !== 'Yes') return;

        notes.splice(index, 1);
        await saveNotes();

        applyNoteDecorations(editor);
        vscode.window.setStatusBarMessage('🗑 Note deleted', 2000);
    });

    context.subscriptions.push(deleteNoteCommand);
}