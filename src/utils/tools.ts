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
  console.log('=== STARTING DOWNLOAD DEBUG ===');

  const rootFolder = getRootFolder(uri);
  const defaultTemplateFolder = `${rootFolder}/.my_templates/flutter_tdd_clean_templates`;
  const author = await getRepoAuthor();
  const repo = await getRepoName();
  const targetdir = await getRepoFolder();

  console.log('=== CONFIGURATION VALUES ===');
  console.log('Root folder:', rootFolder);
  console.log('Template folder:', defaultTemplateFolder);
  console.log('Author:', author);
  console.log('Repo:', repo);
  console.log('Target dir:', targetdir);
  console.log('Expected URL:', `https://github.com/${author}/${repo}/tree/main/${targetdir}`);

  // Crear carpeta si no existe
  if (!fs.existsSync(defaultTemplateFolder)) {
    console.log('Creating directory:', defaultTemplateFolder);
    fs.mkdirSync(defaultTemplateFolder, { recursive: true });
    console.log('Directory created successfully');
  } else {
    console.log('Directory already exists');
  }

  // Verificar que gh-retrieve esté disponible
  try {
    const ghRetrieve = require('gh-retrieve');
    console.log('gh-retrieve loaded successfully');
    console.log('Available methods:', Object.keys(ghRetrieve));
  } catch (requireError) {
    console.error('Error loading gh-retrieve:', requireError);
    window.showErrorMessage('gh-retrieve module not found. Run: npm install gh-retrieve');
    return;
  }

  try {
    const { recursiveDownload } = require('gh-retrieve');

    console.log('=== STARTING RECURSIVE DOWNLOAD ===');

    const downloadConfig = {
      author: author, // "alcampospalacios"
      repo: repo, // "flutter_tdd_clean_architecture"
      targetdir: targetdir, // ".my_templates/flutter_tdd_clean_templates/"
      outdir: defaultTemplateFolder, // local destination
    };

    console.log('Download config:', JSON.stringify(downloadConfig, null, 2));
    console.log(
      'This should download from:',
      `https://github.com/${author}/${repo}/tree/main/${targetdir}`,
    );
    console.log('To local folder:', defaultTemplateFolder);

    // Ejecutar la descarga
    console.log('Calling recursiveDownload...');
    await recursiveDownload(downloadConfig);
    console.log('recursiveDownload completed without throwing error');

    // Verificar qué se descargó
    console.log('=== VERIFYING DOWNLOAD RESULTS ===');
    if (fs.existsSync(defaultTemplateFolder)) {
      try {
        const items = fs.readdirSync(defaultTemplateFolder, { withFileTypes: true });
        console.log('Items in template folder:', items.length);

        items.forEach((item) => {
          const type = item.isDirectory() ? 'DIR' : 'FILE';
          console.log(`  ${type}: ${item.name}`);
        });

        // Contar archivos .template recursivamente
        const templateFiles = getAllTemplateFiles(defaultTemplateFolder);
        console.log('Template files found:', templateFiles.length);
        templateFiles.forEach((file) => {
          console.log(`  TEMPLATE: ${file}`);
        });
      } catch (readError) {
        console.error('Error reading downloaded folder:', readError);
      }
    } else {
      console.error('Template folder does not exist after download!');
    }

    console.log('=== DOWNLOAD SUCCESS ===');
    window.showInformationMessage('Templates downloaded successfully!');
  } catch (err: any) {
    console.log('=== DOWNLOAD ERROR ===');
    console.log('Error type:', typeof err);
    console.log('Error name:', err.name);
    console.log('Error message:', err.message);
    console.log('Error code:', err.code);
    console.log('Error stack:', err.stack);

    // Información adicional si está disponible
    if (err.response) {
      console.log('HTTP Response status:', err.response.status);
      console.log('HTTP Response data:', err.response.data);
    }

    if (err.config) {
      console.log('Request config:', err.config);
    }

    console.log('Full error object:', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));

    window.showErrorMessage(`Error downloading templates: ${err.message}`);
    throw err;
  }
}

export function getAllTemplateFiles(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = `${dir}/${item}`;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllTemplateFiles(fullPath));
    } else if (item.endsWith('.template')) {
      files.push(fullPath);
    }
  }

  return files;
}
