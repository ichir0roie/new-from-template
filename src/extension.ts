// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as gcp from './getCurrentPath';

const fse=require('fs-extra');


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "new-project" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('new-from-template.newFromTemplate', createProject);

	context.subscriptions.push(disposable);
}

async function createProject(uri:vscode.Uri|undefined=undefined){
	const templateMap=getTemplateMapConfiguration();
	const input=await vscode.window.showInputBox(
		{
			title:'template key'
		});
	// const input:string|undefined="bareFolder";
	if(!input){
		console.log('input escape');
		return;
	}
	let templatePath:string|undefined=templateMap.get(input);
	if(templatePath===undefined||templatePath===""){
		vscode.window.showErrorMessage('not found template path');
		return;
	}
	let currentPath:string|undefined=uri?.fsPath;
	if(uri===undefined){
		currentPath=await gcp.getCurrentFolder();
	}
	
	if(currentPath===undefined||currentPath===''){
		vscode.window.showErrorMessage('current path not folder');
		return;
	}
	
	await copyFolder(templatePath,currentPath);


}

async function copyFolder(inputPath:string,outputPath:string){
	vscode.window.showInformationMessage('copy '+inputPath+' to '+outputPath); 
	
	let outputPathAdjust=outputPath;
	if(outputPath[outputPath.length-1]!=='/'){
		outputPathAdjust=outputPath+'/';
	}

	// const outputName=await vscode.window.showInputBox(
	// 	{
	// 		title:'new name'
	// 	});
	// if(!outputName){
	// 	return;
	// }

	// const inputIsDir=await gcp.checkDir(inputPath);
	// if(!inputIsDir){
		
	// }
	let inputPathTemp=inputPath;
	if(inputPathTemp[inputPathTemp.length-1]==='/'){
		inputPathTemp=inputPathTemp.substring(0,inputPathTemp.length-1);
	}
	let tree=inputPathTemp.split('/');
	let outputName=tree[tree.length-1];
	
	outputPathAdjust=outputPathAdjust+outputName;
	
	const source=vscode.Uri.file(inputPath);
	const target=vscode.Uri.file(outputPathAdjust);

	try{
		vscode.workspace.fs.copy(source,target);
	}catch (error){
		console.log(error);
	}
	

	
}

function getTemplateMapConfiguration():Map<string,string>{
	let templateMap=new Map<string,string>();

	let ws=vscode.workspace;
	let config=ws.getConfiguration();
	let templates:any=config.get('templates');
	if(templates===undefined){return templateMap;}
	for (let key in templates){
		templateMap.set(key,templates[key]);
	}
	return templateMap;
}

// this method is called when your extension is deactivated
export function deactivate() {}
