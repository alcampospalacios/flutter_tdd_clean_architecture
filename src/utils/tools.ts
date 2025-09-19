import { camelCase, pascalCase, snakeCase } from 'change-case';
import { Uri, window, workspace } from 'vscode';
import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
const axios = require('axios').default;

declare global {
  interface String {
    replaceName(searchTerm: string, replaceFor: string): string;
  }
}

String.prototype.replaceName = function (searchTerm: string, replaceFor: string): string {
  let targetText = this;

  if (searchTerm.includes('lowerCase')) {
    targetText = targetText.replaceAll(searchTerm, replaceFor.toLowerCase());
  }

  if (searchTerm.includes('upperCase')) {
    targetText = targetText.replaceAll(searchTerm, replaceFor.toUpperCase());
  }

  if (searchTerm.includes('snakeCase')) {
    targetText = targetText.replaceAll(searchTerm, snakeCase(replaceFor));
  }

  if (searchTerm.includes('pascalCase')) {
    targetText = targetText.replaceAll(searchTerm, pascalCase(replaceFor));
  }

  if (searchTerm.includes('camelCase')) {
    targetText = targetText.replaceAll(searchTerm, camelCase(replaceFor));
  }

  targetText = targetText.replaceAll(searchTerm, replaceFor);

  return `${targetText}`;
};

export function getClickedFolder(uri: Uri): string {
  // TODO: Check to mac and linux compatibility
  const path = uri.fsPath.replaceAll('\\', '/');
  return path;
}

export function getRootFolder(uri: Uri): string {
  return workspace.getWorkspaceFolder(uri)?.uri.fsPath!;
}

export async function getPackageName(uri: Uri): Promise<string> {
  try {
    // TODO: Check to mac and linux compatibility
    const rootFolder = getRootFolder(uri);
    const packageName = path.basename(rootFolder);
    // const packageName = rootFolder[rootFolder.length - 1];
    return packageName;
  } catch (error) {
    window.showErrorMessage('Error load pubspec.yaml');
    return '';
  }
}

export async function getExtensionFileTemplates(): Promise<string> {
  return await workspace.getConfiguration('scaffolding').get('layers.templates')!;
}

export async function getRepoAuthor(): Promise<string> {
  return await workspace.getConfiguration('scaffolding').get('repository.author')!;
}

export async function getRepoName(): Promise<string> {
  return await workspace.getConfiguration('scaffolding').get('repository.repo')!;
}

export async function getRepoFolder(): Promise<string> {
  return await workspace.getConfiguration('scaffolding').get('repository.targetdir')!;
}

export async function donwloadTemplateFiles(file: string, url: string) {
  const response = await axios({
    method: 'get',
    url: url,
    responseType: 'stream',
  });
  await response.data.pipe(fs.createWriteStream(file));
}

/**
 * 📝 HELPER FUNCTION: Get use case name (should be moved to shared utilities)
 *
 * This function should be accessible from the command registration,
 * so you might want to move it to utils or make it available here.
 */
export async function getUsecaseName(): Promise<string | undefined> {
  const usecaseName = await vscode.window.showInputBox({
    title: 'Create Use Case',
    prompt: 'Use case name? (prefer snake_case format!)',
    placeHolder: 'Ex: get_user_profile, login_user, fetch_products',
    validateInput: function (value: string) {
      if (!value || value?.includes(' ')) {
        return 'Name is required and spaces are not allowed!';
      }
      return null;
    },
  });

  return usecaseName;
}

/**
 * 📥 LEGACY FUNCTION: Download templates (kept for compatibility)
 *
 * This function is kept for compatibility with previous versions,
 * but now templates are organized in the new folder structure.
 */
export async function getTemplatesFile(uri: Uri) {
  const rootFolder = getRootFolder(uri);
  const defaultTemplateFolder = `${rootFolder}/.my_templates`;

  if (!fs.existsSync(defaultTemplateFolder)) {
    fs.mkdirSync(defaultTemplateFolder, { recursive: true });
  }

  try {
    const { recursiveDownload } = require('gh-retrieve');

    await recursiveDownload({
      author: await getRepoAuthor(),
      repo: await getRepoName(),
      targetdir: await getRepoFolder(),
      outdir: defaultTemplateFolder,
    });

    window.showInformationMessage('✅ Templates downloaded successfully!');
  } catch (err: any) {
    console.log('Error downloading templates:', err.stack);
    window.showErrorMessage(`❌ Error downloading templates: ${err.message}`);
  }
}
