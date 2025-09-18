import { readFileSync } from 'fs';
import { Uri, window } from 'vscode';
import * as utils from '../utils/tools';
import fs = require('fs');
import { dirname } from 'path';

export async function createInitials(uri: Uri) {
  const clickedFolder = utils.getClickedFolder(uri);
  let rootFolder = utils.getRootFolder(uri);
  rootFolder = rootFolder.replaceAll('\\', '/');
  let packageName = await utils.getPackageName(uri);
  packageName = packageName.replaceAll('\\', '/');

  const templateBaseFolder = `${rootFolder}/.my_templates/flutter_tdd_clean_templates`;

  if (!fs.existsSync(templateBaseFolder)) {
    const YES_NO = await window.showWarningMessage(
      "The '.my_templates/flutter_tdd_clean_templates' folder was not found!\nDo you want to download the templates from the repository?",
      'Yes',
      'No',
    );
    if (YES_NO === 'Yes') {
      await downloadInitialTemplates(uri);
      window.showInformationMessage(
        'Templates downloaded successfully! Please run the command again.',
      );
      return;
    } else {
      window.showErrorMessage('Cannot continue without templates!');
      return;
    }
  }

  try {
    // Copy templates from specific initial folders: config, core, test
    const initialFolders = ['config', 'core', 'test'];
    let totalFilesCreated = 0;

    for (const folder of initialFolders) {
      const folderPath = `${templateBaseFolder}/${folder}`;
      if (fs.existsSync(folderPath)) {
        const filesCreated = await copyInitialTemplatesFromFolder(
          folderPath,
          rootFolder,
          clickedFolder,
          packageName,
          folder,
        );
        totalFilesCreated += filesCreated;
        window.showInformationMessage(`✅ Created ${filesCreated} files from ${folder} templates`);
      } else {
        window.showWarningMessage(`⚠️ Folder ${folder} not found in templates`);
      }
    }

    if (totalFilesCreated > 0) {
      window.showInformationMessage(
        `🎉 Initial setup completed! ${totalFilesCreated} files created successfully!`,
      );
    } else {
      window.showWarningMessage('No template files were found to create.');
    }
  } catch (error) {
    console.log('Error creating initial templates:', error);
    window.showErrorMessage(`❌ Error creating initial templates: ${error}`);
    throw error;
  }
}

async function copyInitialTemplatesFromFolder(
  templateFolder: string,
  rootFolder: string,
  clickedFolder: string,
  packageName: string,
  folderType: string,
): Promise<number> {
  // Get all template files recursively from this specific folder
  const templateFiles = getAllTemplateFiles(templateFolder);
  let filesCreated = 0;

  for (const templateFile of templateFiles) {
    try {
      // Get relative path from template folder (preserving subdirectory structure)
      const relativePath = templateFile.replace(templateFolder + '/', '');

      // Create destination path maintaining the folder structure
      let destinationPath: string;

      if (folderType === 'config') {
        // config/ templates go directly to lib/config/
        destinationPath = `${rootFolder}/lib/config/${relativePath}`;
      } else if (folderType === 'core') {
        // core/ templates go to lib/core/ maintaining subdirectories
        // Example: core/api/dio_interceptor.template -> lib/core/api/dio_interceptor.dart
        destinationPath = `${rootFolder}/lib/core/${relativePath}`;
      } else if (folderType === 'test') {
        // test/ templates go to test/ maintaining subdirectories
        // Example: test/core/api/api_request_handler_test.template -> test/core/api/api_request_handler_test.dart
        destinationPath = `${rootFolder}/test/${relativePath}`;
      } else {
        // Default behavior - maintain original structure
        destinationPath = `${rootFolder}/${folderType}/${relativePath}`;
      }

      // Remove .template extension
      destinationPath = destinationPath.replace(/\.template$/, '.dart');

      // Replace placeholders in path
      destinationPath = replacePlaceholdersInPath(destinationPath, {
        custom_folder: clickedFolder,
        package_name: packageName,
        root_folder: rootFolder,
      });

      // Read template content
      let templateContent = readFileSync(templateFile, 'utf8');

      // Replace placeholders in content - including package references
      templateContent = replacePlaceholdersInContent(templateContent, {
        custom_folder: clickedFolder,
        package_name: packageName,
        root_folder: rootFolder,
      });

      // Special handling for imports in Dart files
      templateContent = fixDartImports(templateContent, packageName);

      // Write the file
      await writeFileExtPromise(destinationPath, templateContent);
      filesCreated++;
      console.log(`✅ Created: ${destinationPath}`);
    } catch (error) {
      console.error(`❌ Error processing template ${templateFile}:`, error);
      window.showErrorMessage(`Error processing template: ${templateFile}`);
    }
  }

  return filesCreated;
}

// Fix Dart imports to use the correct package name
function fixDartImports(content: string, packageName: string): string {
  // Replace hardcoded package references like 'package:gymtor/' with the actual package name
  // This handles cases where templates might have specific package references
  return content.replace(/package:gymtor\//g, `package:${packageName}/`);
}

function getAllTemplateFiles(dir: string): string[] {
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

function replacePlaceholdersInPath(path: string, placeholders: any): string {
  let result = path;

  // Replace each placeholder with all its variants
  Object.keys(placeholders).forEach((key) => {
    const value = placeholders[key];
    result = result.replaceName(`{{${key}}}`, value);
    result = result.replaceName(`{{${key}.lowerCase}}`, value);
    result = result.replaceName(`{{${key}.upperCase}}`, value);
    result = result.replaceName(`{{${key}.snakeCase}}`, value);
    result = result.replaceName(`{{${key}.pascalCase}}`, value);
    result = result.replaceName(`{{${key}.camelCase}}`, value);
  });

  return result;
}

function replacePlaceholdersInContent(content: string, placeholders: any): string {
  let result = content;

  // Replace each placeholder with all its variants
  Object.keys(placeholders).forEach((key) => {
    const value = placeholders[key];
    result = result.replaceName(`{{${key}}}`, value);
    result = result.replaceName(`{{${key}.lowerCase}}`, value);
    result = result.replaceName(`{{${key}.upperCase}}`, value);
    result = result.replaceName(`{{${key}.snakeCase}}`, value);
    result = result.replaceName(`{{${key}.pascalCase}}`, value);
    result = result.replaceName(`{{${key}.camelCase}}`, value);
  });

  return result;
}

function writeFileExt(path: string, contents: string) {
  fs.mkdir(dirname(path), { recursive: true }, function (err: any) {
    if (err) {
      console.error('Error creating directory:', err);
      return;
    }

    fs.writeFile(path, contents, 'utf8', (error) => {
      if (error) {
        console.error('Error writing file:', path, error);
      } else {
        console.log('Created file:', path);
      }
    });
  });
}

// Promise version for better async handling
function writeFileExtPromise(path: string, contents: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirname(path), { recursive: true }, function (err: any) {
      if (err) {
        console.error('Error creating directory:', err);
        reject(err);
        return;
      }

      fs.writeFile(path, contents, 'utf8', (error) => {
        if (error) {
          console.error('Error writing file:', path, error);
          reject(error);
        } else {
          console.log('✅ Created file:', path);
          resolve();
        }
      });
    });
  });
}

async function downloadInitialTemplates(uri: Uri) {
  console.log('=== STARTING DOWNLOAD DEBUG ===');

  const rootFolder = utils.getRootFolder(uri);
  const defaultTemplateFolder = `${rootFolder}/.my_templates/flutter_tdd_clean_templates`;
  const author = await utils.getRepoAuthor();
  const repo = await utils.getRepoName();
  const targetdir = await utils.getRepoFolder();

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
