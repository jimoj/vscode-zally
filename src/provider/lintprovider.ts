'use strict';

import * as vscode from 'vscode';
import * as request from 'request';

export interface ZallyViolation {
    title: string;
    description: string;
    violation_type: string;
    rule_link: string;
    paths: string[];
    pointer: string;
    start_line: number;
    end_line: number;
}

export interface ZallyViolationCount {
    must: number;
    should: number;
    may: number;
    hint: number;
}

export interface ZallyResponseBody {
    external_id: string;
    message: string;
    violations: ZallyViolation[];
    violations_count: ZallyViolationCount;
    api_definition: string;
}

export default class ZallyOpenAPILintingProvider implements vscode.CodeActionProvider {
    private static readonly commandId: string = 'zally.runLintingCodeAction';
    private static readonly defaultUrl: string = 'http://localhost:8000/';
    private static isRunning: boolean = false;

    private readonly yamlOpenapiRgx: RegExp = new RegExp(/^openapi:/);

    private serverUrl: string;
	private command: vscode.Disposable;
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor() {
        this.serverUrl = ZallyOpenAPILintingProvider.defaultUrl;
        this.command = vscode.commands.registerCommand(ZallyOpenAPILintingProvider.commandId, this.runCodeAction, this);
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection();
    }

    public activate(context: vscode.ExtensionContext): void {
        let subscriptions = context.subscriptions;
        subscriptions.push(this);
        vscode.workspace.onDidChangeConfiguration(this.loadConfiguration, this, subscriptions);
        this.loadConfiguration();

		vscode.workspace.onDidOpenTextDocument(this.doZallyLinting, this, subscriptions);
		vscode.workspace.onDidCloseTextDocument((textDocument)=> {
			this.diagnosticCollection.delete(textDocument.uri);
		}, null, subscriptions);

		vscode.workspace.onDidSaveTextDocument(this.doZallyLinting, this);
		vscode.workspace.textDocuments.forEach(this.doZallyLinting, this);
	}

	public dispose(): void {
		this.diagnosticCollection.clear();
		this.diagnosticCollection.dispose();
		this.command.dispose();
	}

    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.Command[] {
        let diagnostic: vscode.Diagnostic = context.diagnostics[0];
		// return [{
		// 	    title: "Accept Zally Rule Suggestions",
        //      command: ZallyOpenAPILintingProvider.commandId,
        //      arguments: [document]
        // }];
        return [];
    }

    private doZallyLinting(document: vscode.TextDocument): void {
        if ( ZallyOpenAPILintingProvider.isRunning ) {
            return;
        }
        let lang = document.languageId;
        if (lang !== 'json' && lang !== 'yaml') {
            return;
        }

        if ( lang === 'yaml' ) {
            let match = this.yamlOpenapiRgx.exec(document.lineAt(0).text);
            if (!match) {
                return;
            }
        }

        ZallyOpenAPILintingProvider.isRunning = true;

        request.post(this.serverUrl + 'api-violations',
        {
            json: {
                api_definition_string: document.getText()
            },
	    rejectUnauthorized: false
		
        },
        (error, res, body: ZallyResponseBody) => {
            if (error) {
                console.error(error);
                ZallyOpenAPILintingProvider.isRunning = false;
                return;
            }

            let diagnostics: vscode.Diagnostic[] = [];

            body.violations.forEach(violation => {
                let violationRange = new vscode.Range(violation.start_line -1, 0, violation.end_line -1, 0);
                let violationMessage = violation.description + "\n\n" + violation.rule_link;
                let violationSeverity: vscode.DiagnosticSeverity;
                switch( violation.violation_type ) {
                    case "MUST":
                        violationSeverity = vscode.DiagnosticSeverity.Error;
                        break;
                    case "SHOULD":
                        violationSeverity = vscode.DiagnosticSeverity.Warning;
                        break;
                    case "MAY":
                        violationSeverity = vscode.DiagnosticSeverity.Information;
                        break;
                    default:
                        violationSeverity = vscode.DiagnosticSeverity.Hint;
                }

                let violationDiagnostic = new vscode.Diagnostic(violationRange, violationMessage, violationSeverity);
                diagnostics.push(violationDiagnostic);
            });

            this.diagnosticCollection.set(document.uri, diagnostics);
            ZallyOpenAPILintingProvider.isRunning = false;
        });
    }

    private runCodeAction(document: vscode.TextDocument, range: vscode.Range, message:string): any {
    }

    private loadConfiguration(): void {
        let section = vscode.workspace.getConfiguration('zally');
        if (section) {
            this.serverUrl = section.get<string>('serverUrl', ZallyOpenAPILintingProvider.defaultUrl);
        }
    }
}
