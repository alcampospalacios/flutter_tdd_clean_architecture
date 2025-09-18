import { camelCase, pascalCase, snakeCase } from "change-case";
import { Uri, window, workspace } from "vscode";
import fs = require("fs");
const axios = require("axios").default;

declare global {
  interface String {
    replaceName(searchTerm: string, replaceFor: string): string;
  }
}

String.prototype.replaceName = function (
  searchTerm: string,
  replaceFor: string
): string {
  let targetText = this;

  if (searchTerm.includes("lowerCase")) {
    targetText = targetText.replaceAll(searchTerm, replaceFor.toLowerCase());
  }

  if (searchTerm.includes("upperCase")) {
    targetText = targetText.replaceAll(searchTerm, replaceFor.toUpperCase());
  }

  if (searchTerm.includes("snakeCase")) {
    targetText = targetText.replaceAll(searchTerm, snakeCase(replaceFor));
  }

  if (searchTerm.includes("pascalCase")) {
    targetText = targetText.replaceAll(searchTerm, pascalCase(replaceFor));
  }

  if (searchTerm.includes("camelCase")) {
    targetText = targetText.replaceAll(searchTerm, camelCase(replaceFor));
  }

  targetText = targetText.replaceAll(searchTerm, replaceFor);

  return `${targetText}`;
};

export function getClickedFolder(uri: Uri): string {
  // TODO: Check to mac and linux compatibility
  const path =   uri.fsPath.replaceAll("\\", "/");
  return path;
}

export function getRootFolder(uri: Uri): string {
  return workspace.getWorkspaceFolder(uri)?.uri.fsPath!;
}

export async function getPackageName(uri: Uri): Promise<string> {
  try {
    // TODO: Check to mac and linux compatibility
    const rootFolder = getRootFolder(uri).split("\\");
    const packageName = rootFolder[rootFolder.length - 1];
    return packageName;
  } catch (error) {
    window.showErrorMessage("Error load pubspec.yaml");
    return "";
  }
}

export async function getExtensionFileTemplates(): Promise<string> {
  return await workspace
    .getConfiguration("scaffolding")
    .get("layers.templates")!;
}

export async function getRepoAuthor(): Promise<string> {
  return await workspace
    .getConfiguration("scaffolding")
    .get("repository.author")!;
}

export async function getRepoName(): Promise<string> {
  return await workspace
    .getConfiguration("scaffolding")
    .get("repository.repo")!;
}

export async function getRepoFolder(): Promise<string> {
  return await workspace
    .getConfiguration("scaffolding")
    .get("repository.targetdir")!;
}

export async function donwloadTemplateFiles(file: string, url: string) {
  const response = await axios({
    method: "get",
    url: url,
    responseType: "stream",
  });
  await response.data.pipe(fs.createWriteStream(file));
}
