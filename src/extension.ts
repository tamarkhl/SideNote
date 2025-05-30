import * as vscode from 'vscode';
import { registerHighlightCommand } from './features/highlight';
import { registerNoteCommand } from './features/notes';


export function activate(context: vscode.ExtensionContext) {
    console.log('✅ SideNote extension activated');
    registerHighlightCommand(context);
    registerNoteCommand(context);
}

export function deactivate() {}




// --- const disposable
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json

//vscode.window.showInformationMessage
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user