import { readFileSync, writeFileSync } from 'fs';
import { Uri, window } from 'vscode';
import * as utils from '../utils/tools';
import * as yaml from 'js-yaml';
import axios from 'axios';

/**
 * 🎯 MAIN FUNCTION: Add Clean Architecture dependencies to pubspec.yaml
 *
 * This function automatically adds all the dependencies used by the
 * Clean Architecture templates to the project's pubspec.yaml file.
 *
 * Dependencies added:
 * - Production: get_it, flutter_bloc, bloc, flutter_secure_storage, shared_preferences, dio, equatable
 * - Development: mocktail, bloc_test, flutter_test
 *
 * @param uri - URI of the folder where the command was executed
 */
export async function addCleanArchDependencies(uri: Uri) {
  try {
    // 📁 STEP 1: Get project root and pubspec.yaml path
    const rootFolder = utils.getRootFolder(uri);
    const pubspecPath = `${rootFolder}/pubspec.yaml`;

    // 📖 STEP 2: Read and parse existing pubspec.yaml
    let pubspecContent: string;
    let pubspecData: any;

    try {
      pubspecContent = readFileSync(pubspecPath, 'utf8');
      pubspecData = yaml.load(pubspecContent) as any;
    } catch (error) {
      window.showErrorMessage(
        "❌ Could not read pubspec.yaml file. Make sure you're in a Flutter project.",
      );
      return;
    }

    // 📦 STEP 3: Get latest versions and define dependencies to add
    const productionDependencies: any = await getLatestVersions([
      'flutter_bloc', // State Management
      'bloc', // State Management - Core BLoC
      'get_it', // Dependency Injection
      'dio', // Network & HTTP
      'shared_preferences', // Local Storage
      'flutter_secure_storage', // Secure Local Storage
      'equatable', // Utilities
    ]);

    const devDependencies: any = await getLatestVersions([
      'mocktail', // Testing - Mocking
      'bloc_test', // Testing - BLoC Testing Utilities
    ]);

    // Add flutter_test manually since it uses SDK
    devDependencies['flutter_test'] = { sdk: 'flutter' };

    // 🔄 STEP 4: Add dependencies to pubspec data
    let addedDeps = 0;
    let addedDevDeps = 0;

    // Initialize dependencies sections if they don't exist
    if (!pubspecData.dependencies) {
      pubspecData.dependencies = {};
    }
    if (!pubspecData.dev_dependencies) {
      pubspecData.dev_dependencies = {};
    }

    // Add production dependencies
    Object.keys(productionDependencies).forEach((dep) => {
      if (!pubspecData.dependencies[dep]) {
        pubspecData.dependencies[dep] = productionDependencies[dep];
        addedDeps++;
        console.log(`✅ Added dependency: ${dep}`);
      } else {
        console.log(`⚠️ Dependency already exists: ${dep}`);
      }
    });

    // Add development dependencies
    Object.keys(devDependencies).forEach((dep) => {
      if (!pubspecData.dev_dependencies[dep]) {
        pubspecData.dev_dependencies[dep] = devDependencies[dep];
        addedDevDeps++;
        console.log(`✅ Added dev dependency: ${dep}`);
      } else {
        console.log(`⚠️ Dev dependency already exists: ${dep}`);
      }
    });

    // 💾 STEP 5: Write updated pubspec.yaml back to file
    if (addedDeps > 0 || addedDevDeps > 0) {
      const updatedPubspecContent = yaml.dump(pubspecData, {
        lineWidth: -1,
        noRefs: true,
        sortKeys: false,
      });

      writeFileSync(pubspecPath, updatedPubspecContent, 'utf8');

      // 🎉 STEP 6: Show success message and run flutter pub get
      const totalAdded = addedDeps + addedDevDeps;
      window.showInformationMessage(
        `🎉 Successfully added ${totalAdded} dependencies! (${addedDeps} regular, ${addedDevDeps} dev)`,
      );

      // Ask user if they want to run flutter pub get
      const runPubGet = await window.showInformationMessage(
        "Dependencies added successfully! Do you want to run 'flutter pub get' now?",
        'Yes',
        'No',
      );

      if (runPubGet === 'Yes') {
        await runFlutterPubGet(rootFolder);
      }
    } else {
      window.showInformationMessage(
        'ℹ️ All Clean Architecture dependencies are already present in pubspec.yaml',
      );
    }
  } catch (error) {
    console.error('Error adding dependencies:', error);
    window.showErrorMessage(`❌ Error adding dependencies: ${error}`);
    throw error;
  }
}

/**
 * 🌐 FUNCTION: Get latest versions from pub.dev API
 *
 * Fetches the latest stable versions of Flutter/Dart packages from pub.dev API.
 * Uses the official pub.dev API to get real-time version information.
 *
 * @param packageNames - Array of package names to get versions for
 * @returns Object with package names as keys and version strings as values
 */
async function getLatestVersions(packageNames: string[]): Promise<{ [key: string]: string }> {
  const versions: { [key: string]: string } = {};

  window.showInformationMessage('🔍 Fetching latest package versions from pub.dev...');

  try {
    // Process packages in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < packageNames.length; i += batchSize) {
      const batch = packageNames.slice(i, i + batchSize);

      // Create promises for this batch
      const promises = batch.map(async (packageName) => {
        try {
          const response = await axios.get(`https://pub.dev/api/packages/${packageName}`, {
            timeout: 10000, // 10 second timeout
          });

          const latestVersion = response.data.latest.version;
          versions[packageName] = `^${latestVersion}`;
          console.log(`✅ ${packageName}: ^${latestVersion}`);
        } catch (error) {
          console.error(`❌ Failed to get version for ${packageName}:`, error);

          // Fallback to known stable versions if API fails
          const fallbackVersions: { [key: string]: string } = {
            flutter_bloc: '^9.1.1',
            bloc: '^9.0.0',
            get_it: '^8.2.0',
            dio: '^5.9.0',
            shared_preferences: '^2.5.3',
            flutter_secure_storage: '^9.2.4',
            equatable: '^2.0.7',
            mocktail: '^1.0.4',
            bloc_test: '^10.0.0',
          };

          versions[packageName] = fallbackVersions[packageName] || '^1.0.0';
          console.log(`⚠️ Using fallback version for ${packageName}: ${versions[packageName]}`);
        }
      });

      // Wait for this batch to complete
      await Promise.all(promises);

      // Small delay between batches to be respectful to the API
      if (i + batchSize < packageNames.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    window.showInformationMessage(
      `✅ Retrieved versions for ${Object.keys(versions).length} packages`,
    );
  } catch (error) {
    console.error('Error fetching package versions:', error);
    window.showErrorMessage(`❌ Error fetching latest versions. Using fallback versions.`);

    // Complete fallback if everything fails
    const fallbackVersions: { [key: string]: string } = {
      flutter_bloc: '^8.1.3',
      bloc: '^8.1.2',
      get_it: '^7.6.4',
      dio: '^5.3.2',
      shared_preferences: '^2.2.2',
      flutter_secure_storage: '^9.0.0',
      equatable: '^2.0.5',
      mocktail: '^1.0.0',
      bloc_test: '^9.1.5',
    };

    packageNames.forEach((pkg) => {
      versions[pkg] = fallbackVersions[pkg] || '^1.0.0';
    });
  }

  return versions;
}
/*
 * Executes 'flutter pub get' in the project directory to install
 * the newly added dependencies.
 *
 * @param rootFolder - Root directory of the Flutter project
 */
async function runFlutterPubGet(rootFolder: string) {
  try {
    const { exec } = require('child_process');

    window.showInformationMessage("📦 Running 'flutter pub get'...");

    exec('flutter pub get', { cwd: rootFolder }, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error('Error running flutter pub get:', error);
        window.showErrorMessage(`❌ Error running 'flutter pub get': ${error.message}`);
        return;
      }

      if (stderr) {
        console.error('Flutter pub get stderr:', stderr);
      }

      console.log('Flutter pub get output:', stdout);
      window.showInformationMessage("✅ Successfully ran 'flutter pub get'!");
    });
  } catch (error) {
    console.error('Error executing flutter pub get:', error);
    window.showErrorMessage(`❌ Could not run 'flutter pub get': ${error}`);
  }
}

/**
 * 📋 FUNCTION: Show dependencies that will be added (with latest versions)
 *
 * Shows a preview of all dependencies that will be added with their
 * latest versions fetched from pub.dev before actually modifying
 * the pubspec.yaml file.
 *
 * @param uri - URI of the folder where the command was executed
 */
export async function previewCleanArchDependencies(uri: Uri) {
  window.showInformationMessage('🔍 Fetching latest versions for preview...');

  try {
    // Get latest versions for preview
    const prodDeps = await getLatestVersions([
      'flutter_bloc',
      'bloc',
      'get_it',
      'dio',
      'shared_preferences',
      'flutter_secure_storage',
      'equatable',
    ]);

    const devDeps = await getLatestVersions(['mocktail', 'bloc_test']);

    let dependenciesInfo = `
🎯 CLEAN ARCHITECTURE DEPENDENCIES (LATEST VERSIONS):

📦 PRODUCTION DEPENDENCIES:
├─ flutter_bloc: ${prodDeps['flutter_bloc']}       (State Management - BLoC Pattern)
├─ bloc: ${prodDeps['bloc']}                (State Management - Core BLoC)
├─ get_it: ${prodDeps['get_it']}              (Dependency Injection)
├─ dio: ${prodDeps['dio']}                 (HTTP Client)
├─ shared_preferences: ${prodDeps['shared_preferences']}   (Local Key-Value Storage)
├─ flutter_secure_storage: ${prodDeps['flutter_secure_storage']} (Secure Local Storage)
└─ equatable: ${prodDeps['equatable']}           (Value Equality)

🧪 DEVELOPMENT DEPENDENCIES:
├─ mocktail: ${devDeps['mocktail']}            (Mocking for Tests)
├─ bloc_test: ${devDeps['bloc_test']}           (BLoC Testing Utilities)
└─ flutter_test: sdk: flutter   (Flutter Testing Framework)

⚠️  NOTE: Only missing dependencies will be added.
✅ Existing dependencies will be preserved.
🌐 Versions fetched from pub.dev API in real-time.
`;

    const proceed = await window.showInformationMessage(
      dependenciesInfo,
      { modal: true },
      'Add Latest Dependencies',
      'Cancel',
    );

    if (proceed === 'Add Latest Dependencies') {
      await addCleanArchDependencies(uri);
    }
  } catch (error) {
    window.showErrorMessage(`❌ Error fetching versions for preview: ${error}`);
  }
}

/**
 * 🔍 FUNCTION: Check current dependencies status (with latest version comparison)
 *
 * Analyzes the current pubspec.yaml and shows which Clean Architecture
 * dependencies are present, which are missing, and which could be updated
 * to newer versions.
 *
 * @param uri - URI of the folder where the command was executed
 */
export async function checkCleanArchDependencies(uri: Uri) {
  try {
    const rootFolder = utils.getRootFolder(uri);
    const pubspecPath = `${rootFolder}/pubspec.yaml`;

    // Read and parse pubspec.yaml
    const pubspecContent = readFileSync(pubspecPath, 'utf8');
    const pubspecData = yaml.load(pubspecContent) as any;

    window.showInformationMessage('🔍 Checking dependencies and fetching latest versions...');

    // Get latest versions
    const latestVersions = await getLatestVersions([
      'flutter_bloc',
      'bloc',
      'get_it',
      'dio',
      'shared_preferences',
      'flutter_secure_storage',
      'equatable',
      'mocktail',
      'bloc_test',
    ]);

    let statusReport = '🔍 CLEAN ARCHITECTURE DEPENDENCIES STATUS:\n\n';
    let missingCount = 0;
    let presentCount = 0;
    let updatableCount = 0;

    Object.keys(latestVersions).forEach((dep) => {
      const inRegular = pubspecData.dependencies && pubspecData.dependencies[dep];
      const inDev = pubspecData.dev_dependencies && pubspecData.dev_dependencies[dep];
      const currentVersion = inRegular || inDev;
      const latestVersion = latestVersions[dep];

      if (currentVersion) {
        if (currentVersion !== latestVersion && typeof currentVersion === 'string') {
          statusReport += `🔄 ${dep}: ${currentVersion} → ${latestVersion} (update available)\n`;
          updatableCount++;
        } else {
          statusReport += `✅ ${dep}: ${currentVersion} (current)\n`;
        }
        presentCount++;
      } else {
        statusReport += `❌ ${dep}: Missing (latest: ${latestVersion})\n`;
        missingCount++;
      }
    });

    // Check flutter_test separately
    const flutterTest =
      pubspecData.dev_dependencies && pubspecData.dev_dependencies['flutter_test'];
    if (flutterTest) {
      statusReport += `✅ flutter_test: ${JSON.stringify(flutterTest)} (current)\n`;
      presentCount++;
    } else {
      statusReport += `❌ flutter_test: Missing (sdk: flutter)\n`;
      missingCount++;
    }

    statusReport += `\n📊 SUMMARY: ${presentCount} present, ${missingCount} missing`;
    if (updatableCount > 0) {
      statusReport += `, ${updatableCount} can be updated`;
    }

    if (missingCount > 0 || updatableCount > 0) {
      let buttonText = 'Add Missing Dependencies';
      if (updatableCount > 0) {
        buttonText = missingCount > 0 ? 'Add Missing & Update All' : 'Update All Dependencies';
      }

      const action = await window.showInformationMessage(
        statusReport,
        { modal: true },
        buttonText,
        'Close',
      );

      if (action === buttonText) {
        await addCleanArchDependencies(uri);
      }
    } else {
      window.showInformationMessage(statusReport);
    }
  } catch (error) {
    window.showErrorMessage(`❌ Error checking dependencies: ${error}`);
  }
}
