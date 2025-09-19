import { readFileSync } from 'fs';
import { Uri, window } from 'vscode';
import * as utils from '../utils/tools';
import fs = require('fs');
import { dirname } from 'path';
import { getUsecaseName } from '../utils/tools';

/**
 * 🎯 MAIN FUNCTION: Creates a new Use Case with its test
 *
 * This function creates only:
 * 1. The main Use Case file in lib/src/{feature}/domain/usecases/
 * 2. The corresponding test file in test/src/{feature}/domain/usecases/
 *
 * It NO LONGER creates repository or datasource (those will be done separately)
 *
 * @param uri - URI of the folder where the command was executed
 */
export async function createUsecase(uri: Uri) {
  // 📁 STEP 1: Get project information and context
  const clickedFolder = utils.getClickedFolder(uri);
  let rootFolder = utils.getRootFolder(uri);
  rootFolder = rootFolder.replaceAll('\\', '/');
  let packageName = await utils.getPackageName(uri);
  packageName = packageName.replaceAll('\\', '/');

  // 📝 STEP 2: Get the use case name from user input
  const usecaseName = await getUsecaseName();
  if (!usecaseName) {
    return; // User cancelled or didn't enter a name
  }

  // 🔍 STEP 3: Extract feature name from the clicked folder path
  const featureName = getFeatureNameFromPath(clickedFolder);
  if (!featureName) {
    window.showErrorMessage(
      'Could not determine feature name from the selected folder. Please select a folder within a feature.',
    );
    return;
  }

  try {
    // 📂 STEP 4: Define specific templates for use cases
    const templateBaseFolder = `${rootFolder}/.my_templates/flutter_tdd_clean_templates`;

    const usecaseTemplates = [
      {
        templatePath: `${templateBaseFolder}/feature/usecase/params/${usecaseName}_usecase.template`,
        destinationPath: `${rootFolder}/lib/src/${featureName}/domain/usecases/${usecaseName}_usecase.dart`,
        type: 'usecase',
      },
      {
        templatePath: `${templateBaseFolder}/test/usecase/params/${usecaseName}_usecase_test.template`,
        destinationPath: `${rootFolder}/test/src/${featureName}/domain/usecases/${usecaseName}_usecase_test.dart`,
        type: 'test',
      },
    ];

    let filesCreated = 0;

    // 🔄 STEP 5: Process each template
    for (const template of usecaseTemplates) {
      if (fs.existsSync(template.templatePath)) {
        await processUsecaseTemplate(template.templatePath, template.destinationPath, {
          featureName,
          usecaseName,
          packageName,
          clickedFolder,
          rootFolder,
        });
        filesCreated++;
        console.log(`✅ Created ${template.type}: ${template.destinationPath}`);
      } else {
        window.showWarningMessage(`⚠️ Template not found: ${template.templatePath}`);
      }
    }

    // 🎉 STEP 6: Show results
    if (filesCreated > 0) {
      window.showInformationMessage(
        `🎉 Use Case '${usecaseName}' created successfully! ${filesCreated} files generated.`,
      );
    } else {
      window.showErrorMessage('❌ No files were created. Please check that the templates exist.');
    }
  } catch (error) {
    console.error('Error creating use case:', error);
    window.showErrorMessage(`❌ Error creating use case: ${error}`);
    throw error;
  }
}

/**
 * 🔄 FUNCTION: Process an individual use case template
 *
 * Reads the template, replaces all placeholders and writes the final file.
 *
 * @param templatePath - Path to the template file
 * @param destinationPath - Path where to create the final file
 * @param placeholders - Object with all values to replace
 */
async function processUsecaseTemplate(
  templatePath: string,
  destinationPath: string,
  placeholders: {
    featureName: string;
    usecaseName: string;
    packageName: string;
    clickedFolder: string;
    rootFolder: string;
  },
) {
  try {
    // 📖 Read template content
    let templateContent = readFileSync(templatePath, 'utf8');

    // 🔄 Replace placeholders in content
    templateContent = replacePlaceholdersInContent(templateContent, placeholders);

    // 🎨 Fix Dart-specific imports
    templateContent = fixDartImports(templateContent, placeholders.packageName);

    // 💾 Write the final file
    await writeFileExtPromise(destinationPath, templateContent);
  } catch (error) {
    console.error(`Error processing template ${templatePath}:`, error);
    throw error;
  }
}

/**
 * 🔄 FUNCTION: Replace placeholders in content
 *
 * Replaces all placeholders with their format variants:
 * - {{placeholder}} → original value
 * - {{placeholder.lowerCase}} → in lowercase
 * - {{placeholder.upperCase}} → in UPPERCASE
 * - {{placeholder.snakeCase}} → in snake_case
 * - {{placeholder.pascalCase}} → in PascalCase
 * - {{placeholder.camelCase}} → in camelCase
 */
function replacePlaceholdersInContent(content: string, placeholders: any): string {
  let result = content;

  // List of all available placeholders
  const allPlaceholders: any = {
    feature_name: placeholders.featureName,
    usecase_name: placeholders.usecaseName,
    package_name: placeholders.packageName,
    custom_folder: placeholders.clickedFolder,
    root_folder: placeholders.rootFolder,
  };

  // Replace each placeholder with all its variants
  Object.keys(allPlaceholders).forEach((key) => {
    const value = allPlaceholders[key];
    result = result.replaceName(`{{${key}}}`, value);
    result = result.replaceName(`{{${key}.lowerCase}}`, value);
    result = result.replaceName(`{{${key}.upperCase}}`, value);
    result = result.replaceName(`{{${key}.snakeCase}}`, value);
    result = result.replaceName(`{{${key}.pascalCase}}`, value);
    result = result.replaceName(`{{${key}.camelCase}}`, value);
  });

  return result;
}

/**
 * 🎨 FUNCTION: Fix Dart imports
 *
 * Replaces hardcoded package references in imports
 * to use the correct name of the current package.
 */
function fixDartImports(content: string, packageName: string): string {
  return content.replace(/package:gymtor\//g, `package:${packageName}/`);
}

/**
 * 🔍 FUNCTION: Extract feature name from clicked path
 *
 * Looks for common patterns in Clean Architecture structure
 * to automatically determine the feature name.
 *
 * Supported patterns:
 * - /src/FEATURE_NAME/domain/...
 * - /lib/src/FEATURE_NAME/...
 * - /test/src/FEATURE_NAME/...
 */
function getFeatureNameFromPath(clickedFolder: string): string {
  const pathParts = clickedFolder.split('/');

  // Look for 'src' index in the path
  const srcIndex = pathParts.indexOf('src');

  if (srcIndex !== -1 && srcIndex + 1 < pathParts.length) {
    // Feature name is right after 'src'
    return pathParts[srcIndex + 1];
  }

  // If we don't find 'src', try other patterns
  const domainIndex = pathParts.indexOf('domain');
  if (domainIndex !== -1 && domainIndex - 1 >= 0) {
    // Feature name is right before 'domain'
    return pathParts[domainIndex - 1];
  }

  // As last resort, use the second-to-last element of the path
  if (pathParts.length >= 2) {
    return pathParts[pathParts.length - 2];
  }

  return '';
}

/**
 * 💾 FUNCTION: File writing with Promises
 *
 * Creates necessary directories and writes the file asynchronously.
 */
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
