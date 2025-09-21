// import * as vscode from "vscode";
import * as fs from 'fs';
import * as vscode from 'vscode';
import { createFolders } from './commands/create_folders';
import { createUsecase } from './commands/create_usecase';
import { createInitials } from './commands/create_initials';
import { createRepository } from './commands/create_repository';
import { getTemplatesFile, getUsecaseName } from './utils/tools';
import { createUsecaseWithoutParams } from './commands/create_usecase_without_params';
import {
  addCleanArchDependencies,
  checkCleanArchDependencies,
  previewCleanArchDependencies,
} from './commands/create_dependencies_pubspec_last_avaible';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'tdd-clean-architecture.createFolders',
      async (uri: vscode.Uri) => {
        await createFolders(uri);
      },
    ),
  );

  context.subscriptions.push(
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
    ),
  );

  context.subscriptions.push(
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
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'tdd-clean-architecture.createInitials',
      async (uri: vscode.Uri) => {
        // Use the new createInitials function that handles all template files
        await createInitials(uri);
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'tdd-clean-architecture.createRepository',
      async (uri: vscode.Uri) => {
        // Use the new createInitials function that handles all template files
        await createRepository(uri);
      },
    ),
  );

  // 📦 NEW: Command to add all Clean Architecture dependencies
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'tdd-clean-architecture.addDependencies',
      async (uri: vscode.Uri) => {
        await addCleanArchDependencies(uri);
      },
    ),
  );

  // 📋 NEW: Command to preview dependencies before adding
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'tdd-clean-architecture.previewDependencies',
      async (uri: vscode.Uri) => {
        await previewCleanArchDependencies(uri);
      },
    ),
  );

  // 🔍 NEW: Command to check current dependency status
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'tdd-clean-architecture.checkDependencies',
      async (uri: vscode.Uri) => {
        await checkCleanArchDependencies(uri);
      },
    ),
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
}
