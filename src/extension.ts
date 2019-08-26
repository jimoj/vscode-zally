'use strict';

import * as vscode from 'vscode';
import ZallyOpenAPILintingProvider from './provider/lintprovider';

export function activate(context: vscode.ExtensionContext) {
	let linter = new ZallyOpenAPILintingProvider();	
	linter.activate(context);
	vscode.languages.registerCodeActionsProvider('yaml', linter);
}

//import * as https from 'https';
//import * as http from 'http';

//import { exec, spawn } from "child_process";
// import { platform } from "os";

// const diagnosticCollection = vscode.languages.createDiagnosticCollection("zally-openapi-linter");
// const config = vscode.workspace.getConfiguration("zally-openapi-linter");

// let maxNumberOfProblems = config.maxNumberOfProblems || 20;
// let serverUrl : string = config.serverUrl || "http://localhost:9000";

// export function activate(context: vscode.ExtensionContext) {
// 	// let linter = new ZallyOpenAPILinter(config)
// 	console.log("zally-lint");
// 	let disposable = vscode.commands.registerCommand('extension.zally-lint', getDiagnostic);
// 	context.subscriptions.push(disposable);

// 	context.subscriptions.push(
// 		diagnosticCollection,
// 		disposable,
// 		vscode.workspace.onDidOpenTextDocument(getDiagnostic),
// 		vscode.workspace.onDidSaveTextDocument(getDiagnostic)
// 	);
// }

export function deactivate() {
}

// export async function doNoOP(document: vscode.TextDocument) {
// 	console.log("FooBar");
// }

// export async function getDiagnostic(document: vscode.TextDocument) {
// 	console.log(document.languageId)

// 	let rgx = new RegExp(/^(?<scheme>[a-zA-Z+.-]+)/);
// 	let rgxMatch = rgx.exec(serverUrl);
// 	// let rgxMatch = serverUrl.match(rgx);

// 	if( rgxMatch ) {
// 		// let rgxGroups = rgxMatch['groups'];
// 		// console.error(rgxGroups);
// 		// console.log(rgxGroups);
// 	}

// 	console.log("Foo");
// 	// console.log(rgx);
// 	console.log(rgxMatch);

// 	/*
// 		switch(rgxGroups.scheme) {
// 			case 'https':
// 				break;
// 			case 'http':
// 				break;
// 		}
// 	*/
// }

// export default class ZallyOpenAPILinter {
// 	static readonly limit: number = 3;
// 	static process: number = 0;

// 	private config: vscode.WorkspaceConfiguration;
// 	private useHTTPS: boolean = false;

// 	public constructor(config: vscode.WorkspaceConfiguration) {
// 		this.config = config;

// 	}

// 	public async sendRequest() { }
// 	private parseUrl(): void {
// 	}
// }

// export function sendRequest() {
// }

