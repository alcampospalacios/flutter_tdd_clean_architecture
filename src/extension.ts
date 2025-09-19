// import * as vscode from "vscode";
import * as fs from 'fs';
import * as vscode from 'vscode';
import { createFolders } from './commands/create_folders';
import { createUsecase, getTemplatesFile } from './commands/create_usecase';
import { createInitials } from './commands/create_initials';
import { createRepository } from './commands/create_repository';

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
      if (await templatesOk(uri)) {
        await createUsecase(uri);
      } else {
        const YES_NO = await vscode.window.showWarningMessage(
          "The '.my_templates' folder was not found!\nDo you want to download some default templates as an example?\nPS: You can create your own examples using them as a base.",
          'Yes',
          'No',
        );
        if (YES_NO === 'Yes') {
          getTemplatesFile(uri);
        } else {
          vscode.window.showInformationMessage(
            `Tip: Look for templates in github:\nhttps://github.com/alcampospalacios/flutter_tdd_clean_architecture/tree/main/.my_templates/flutter_tdd_clean_templates`,
          );

          vscode.window.showErrorMessage(`It is not possible to continue without templates!`);
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

  async function templatesOk(uri: vscode.Uri): Promise<Boolean> {
    const folderList = (await vscode.workspace
      .getConfiguration('scaffolding')
      .get('layers.templates')) as Array<string>;

    const templateList = folderList.filter((element) => element.endsWith('.template'));

    if (folderList.length <= 0 && templateList.length <= 0) {
      return false;
    }

    const rootFolder = uri.path.substring(1, uri.path.indexOf('/lib'));
    let fileName = '';

    if (templateList && templateList.length > 0) {
      for (const key in templateList) {
        if (Object.prototype.hasOwnProperty.call(templateList, key)) {
          const element = templateList[key];

          let fileName = element.substring(element.lastIndexOf('/') + 1, element.length);

          const templateFile = `${rootFolder}/.my_templates/flutter_tdd_clean_templates/${fileName}`;
          if (!fs.existsSync(templateFile)) {
            return false;
          }
        }
      }
    } else {
      return false;
    }

    return true;
  }
}
