'use strict';

import * as vscode from 'vscode';
import ZallyOpenAPILintingProvider from './provider/lintprovider';

export function activate(context: vscode.ExtensionContext) {
	let linter = new ZallyOpenAPILintingProvider();	
	linter.activate(context);
	vscode.languages.registerCodeActionsProvider('yaml', linter);
}

export function deactivate() {
}
