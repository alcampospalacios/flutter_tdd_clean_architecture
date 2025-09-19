// import * as vscode from "vscode";
import * as fs from 'fs';
import * as vscode from 'vscode';
import { createFolders } from './commands/create_folders';
import { createUsecase } from './commands/create_usecase';
import { createInitials } from './commands/create_initials';
import { createRepository } from './commands/create_repository';
import { getTemplatesFile, getUsecaseName } from './utils/tools';
import { createUsecaseWithoutParams } from './commands/create_usecase_without_params';

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand(
    'tdd-clean-architecture.createFolders',
    async (uri: vscode.Uri) => {
      await createFolders(uri);
    },
  );

  vscode.commands.registerCommand(
    'tdd-clean-architecture.createUsecase',
    async (uri: vscode.Uri) => {
      // Check if specific use case templates exist
      if (await usecaseTemplatesOk(uri)) {
        await createUsecase(uri); // Pass the use case name
      } else {
        const YES_NO = await vscode.window.showWarningMessage(
          'The use case templates were not found!\\nDo you want to download the templates from the repository?',
          'Yes',
          'No',
        );

        if (YES_NO === 'Yes') {
          await getTemplatesFile(uri);
          vscode.window.showInformationMessage(
            'Templates downloaded! Please run the command again.',
          );
        } else {
          vscode.window.showInformationMessage(
            `Tip: Look for templates in github:\\nhttps://github.com/alcampospalacios/flutter_tdd_clean_templates/tree/main/.my_templates/flutter_tdd_clean_templates`,
          );
          vscode.window.showErrorMessage(`Cannot continue without templates!`);
        }
      }
    },
  );

  vscode.commands.registerCommand(
    'tdd-clean-architecture.createUsecaseNoParams',
    async (uri: vscode.Uri) => {
      // Check if specific use case templates exist
      if (await usecaseTemplatesOk(uri)) {
        await createUsecaseWithoutParams(uri); // Pass the use case name
      } else {
        const YES_NO = await vscode.window.showWarningMessage(
          'The use case templates were not found!\\nDo you want to download the templates from the repository?',
          'Yes',
          'No',
        );

        if (YES_NO === 'Yes') {
          await getTemplatesFile(uri);
          vscode.window.showInformationMessage(
            'Templates downloaded! Please run the command again.',
          );
        } else {
          vscode.window.showInformationMessage(
            `Tip: Look for templates in github:\\nhttps://github.com/alcampospalacios/flutter_tdd_clean_templates/tree/main/.my_templates/flutter_tdd_clean_templates`,
          );
          vscode.window.showErrorMessage(`Cannot continue without templates!`);
        }
      }
    },
  );

  vscode.commands.registerCommand(
    'tdd-clean-architecture.createInitials',
    async (uri: vscode.Uri) => {
      // Use the new createInitials function that handles all template files
      await createInitials(uri);
    },
  );

  vscode.commands.registerCommand(
    'tdd-clean-architecture.createRepository',
    async (uri: vscode.Uri) => {
      // Use the new createInitials function that handles all template files
      await createRepository(uri);
    },
  );

  async function usecaseTemplatesOk(uri: vscode.Uri): Promise<boolean> {
    try {
      // Get the root folder path
      const rootFolder = uri.path.substring(1, uri.path.indexOf('/lib'));
      const templateBaseFolder = `${rootFolder}/.my_templates/flutter_tdd_clean_templates`;

      // Define the specific template paths for use cases
      const requiredTemplates = [
        `${templateBaseFolder}/feature/usecase/params/{{usecase_name.snakeCase}}_usecase.template`,
        `${templateBaseFolder}/test/usecase/params/{{usecase_name.snakeCase}}_usecase_test.template`,
      ];

      // Check if all required templates exist
      for (const templatePath of requiredTemplates) {
        if (!fs.existsSync(templatePath)) {
          console.log(`❌ Template not found: ${templatePath}`);
          return false;
        }
      }

      console.log(`✅ All use case templates found for: {{usecase_name.snakeCase}}`);
      return true;
    } catch (error) {
      console.error('Error checking use case templates:', error);
      return false;
    }
  }

  async function baseTemplatesOk(uri: vscode.Uri): Promise<boolean> {
    try {
      // Get the root folder path
      const rootFolder = uri.path.substring(1, uri.path.indexOf('/lib'));
      const templateBaseFolder = `${rootFolder}/.my_templates/flutter_tdd_clean_templates`;

      // Check if base template folders exist
      const baseFolders = [
        `${templateBaseFolder}/feature`,
        `${templateBaseFolder}/test`,
        `${templateBaseFolder}/core`,
        `${templateBaseFolder}/config`,
      ];

      for (const folderPath of baseFolders) {
        if (!fs.existsSync(folderPath)) {
          console.log(`❌ Base template folder not found: ${folderPath}`);
          return false;
        }
      }

      console.log(`✅ Base template structure exists`);
      return true;
    } catch (error) {
      console.error('Error checking base templates:', error);
      return false;
    }
  }

  /**
   * 🔍 LEGACY FUNCTION: Check templates using configuration (updated for new structure)
   *
   * This function maintains compatibility with the existing configuration-based
   * template checking, but adapts it for the new folder structure.
   *
   * @param uri - VSCode URI to get the root folder
   * @returns Promise<boolean> - true if configured templates exist, false otherwise
   */
  async function templatesOk(uri: vscode.Uri): Promise<boolean> {
    try {
      const folderList = (await vscode.workspace
        .getConfiguration('scaffolding')
        .get('layers.templates')) as Array<string>;

      const templateList = folderList.filter((element) => element.endsWith('.template'));

      if (folderList.length <= 0 && templateList.length <= 0) {
        return false;
      }

      const rootFolder = uri.path.substring(1, uri.path.indexOf('/lib'));

      if (templateList && templateList.length > 0) {
        for (const key in templateList) {
          if (Object.prototype.hasOwnProperty.call(templateList, key)) {
            const element = templateList[key];

            // Extract just the filename from the template path
            let fileName = element.substring(element.lastIndexOf('/') + 1, element.length);

            // NEW: Check in organized folder structure
            // Try different possible locations for the template
            const possiblePaths = [
              // Original location (for backwards compatibility)
              `${rootFolder}/.my_templates/flutter_tdd_clean_templates/${fileName}`,
              // New organized locations
              `${rootFolder}/.my_templates/flutter_tdd_clean_templates/feature/usecase/params/${fileName}`,
              `${rootFolder}/.my_templates/flutter_tdd_clean_templates/test/usecase/params/${fileName}`,
              // Other possible organized locations
              `${rootFolder}/.my_templates/flutter_tdd_clean_templates/feature/repository/params/${fileName}`,
              `${rootFolder}/.my_templates/flutter_tdd_clean_templates/feature/datasource/params/${fileName}`,
            ];

            // Check if template exists in any of the possible locations
            let templateFound = false;
            for (const templatePath of possiblePaths) {
              if (fs.existsSync(templatePath)) {
                templateFound = true;
                console.log(`✅ Found template: ${templatePath}`);
                break;
              }
            }

            if (!templateFound) {
              console.log(`❌ Template not found in any location: ${fileName}`);
              return false;
            }
          }
        }
      } else {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking templates:', error);
      return false;
    }
  }
}
