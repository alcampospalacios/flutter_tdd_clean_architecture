import { readFileSync } from "fs";
import { Uri, window } from "vscode";
import * as utils from "../utils/tools";
import fs = require("fs");
import { dirname } from "path";

export async function createInitials(uri: Uri) {
  const clickedFolder = utils.getClickedFolder(uri);
  let rootFolder = utils.getRootFolder(uri);
  rootFolder = rootFolder.replaceAll("\\", "/");
  let packageName = await utils.getPackageName(uri);
  packageName = packageName.replaceAll("\\", "/");

  const templateBaseFolder = `${rootFolder}/.my_templates/flutter_tdd_clean_templates`;

  if (!fs.existsSync(templateBaseFolder)) {
    const YES_NO = await window.showWarningMessage(
      "The '.my_templates/flutter_tdd_clean_templates' folder was not found!\nDo you want to download the templates from the repository?",
      "Yes",
      "No"
    );
    if (YES_NO === "Yes") {
      await downloadInitialTemplates(uri);
      window.showInformationMessage("Templates downloaded successfully! Please run the command again.");
      return;
    } else {
      window.showErrorMessage("Cannot continue without templates!");
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
          folder
        );
        totalFilesCreated += filesCreated;
        window.showInformationMessage(`✅ Created ${filesCreated} files from ${folder} templates`);
      } else {
        window.showWarningMessage(`⚠️ Folder ${folder} not found in templates`);
      }
    }

    if (totalFilesCreated > 0) {
      window.showInformationMessage(`🎉 Initial setup completed! ${totalFilesCreated} files created successfully!`);
    } else {
      window.showWarningMessage("No template files were found to create.");
    }
  } catch (error) {
    console.log("Error creating initial templates:", error);
    window.showErrorMessage(`❌ Error creating initial templates: ${error}`);
    throw error;
  }
}

async function copyInitialTemplatesFromFolder(
  templateFolder: string,
  rootFolder: string,
  clickedFolder: string,
  packageName: string,
  folderType: string
): Promise<number> {
  // Get all template files recursively from this specific folder
  const templateFiles = getAllTemplateFiles(templateFolder);
  let filesCreated = 0;
  
  for (const templateFile of templateFiles) {
    try {
      // Get relative path from template folder (preserving subdirectory structure)
      const relativePath = templateFile.replace(templateFolder + "/", "");
      
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
      destinationPath = destinationPath.replace(".template", "");
      
      // Replace placeholders in path
      destinationPath = replacePlaceholdersInPath(destinationPath, {
        custom_folder: clickedFolder,
        package_name: packageName,
        root_folder: rootFolder
      });

      // Read template content
      let templateContent = readFileSync(templateFile, "utf8");
      
      // Replace placeholders in content - including package references
      templateContent = replacePlaceholdersInContent(templateContent, {
        custom_folder: clickedFolder,
        package_name: packageName,
        root_folder: rootFolder
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
  Object.keys(placeholders).forEach(key => {
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
  Object.keys(placeholders).forEach(key => {
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
      console.error("Error creating directory:", err);
      return;
    }

    fs.writeFile(path, contents, "utf8", (error) => {
      if (error) {
        console.error("Error writing file:", path, error);
      } else {
        console.log("Created file:", path);
      }
    });
  });
}

// Promise version for better async handling
function writeFileExtPromise(path: string, contents: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirname(path), { recursive: true }, function (err: any) {
      if (err) {
        console.error("Error creating directory:", err);
        reject(err);
        return;
      }

      fs.writeFile(path, contents, "utf8", (error) => {
        if (error) {
          console.error("Error writing file:", path, error);
          reject(error);
        } else {
          console.log("✅ Created file:", path);
          resolve();
        }
      });
    });
  });
}

async function downloadInitialTemplates(uri: Uri) {
  const rootFolder = utils.getRootFolder(uri);
  const defaultTemplateFolder = `${rootFolder}/.my_templates/flutter_tdd_clean_templates`;

  if (!fs.existsSync(defaultTemplateFolder)) {
    fs.mkdirSync(defaultTemplateFolder, { recursive: true });
  }

  try {
    const { recursiveDownload } = require("gh-retrieve");

    await recursiveDownload({
      author: await utils.getRepoAuthor(), // repository owner
      repo: await utils.getRepoName(), // repository name
      targetdir: await utils.getRepoFolder(), // target directory to download
      outdir: defaultTemplateFolder, // directory to download in
    });

    window.showInformationMessage("Templates downloaded successfully!");
  } catch (err: any) {
    console.log("Error downloading templates:", err.stack);
    window.showErrorMessage(`Error downloading templates: ${err.message}`);
    throw err;
  }
}