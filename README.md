# 🏗️ Flutter TDD Clean Architecture Templates

A comprehensive collection of templates to scaffold Flutter applications following **Clean Architecture** principles with **Test-Driven Development (TDD)** practices.

<!-- ![Extension Demo](images/extension-demo.gif) -->

## 📋 Table of Contents

- [🎯 Overview](#-overview)
- [✨ Features](#-features)
- [🗂️ Template Structure](#️-template-structure)
- [🧱 Architecture Layers](#-architecture-layers)
- [📁 Folder Organization](#-folder-organization)
- [🔧 Core Infrastructure](#-core-infrastructure)
- [🧪 Testing Structure](#-testing-structure)
- [📦 Dependencies](#-dependencies)
- [🚀 Usage](#-usage)
- [📚 Examples](#-examples)
- [🤝 Contributing](#-contributing)

## 🎯 Overview

These templates implement **Uncle Bob's Clean Architecture** adapted for Flutter development, following these principles:

- **Separation of Concerns**: Each layer has a single responsibility
- **Dependency Inversion**: Dependencies flow inward, toward business logic
- **Testability**: Every component can be unit tested in isolation
- **Scalability**: Easy to maintain and extend as the project grows
- **Feature-First Organization**: Code organized by business features

<!-- <div align="center">
  <img src="images/clean-architecture-diagram.png" alt="Clean Architecture Layers" width="600"/>
  <p><em>Clean Architecture layers implemented in this extension</em></p>
</div> -->

## ✨ Features

### 🎯 **Extension Commands Available**

| Command | Description | Preview |
|---------|-------------|---------|
| **Create Initial Needs** | Sets up core infrastructure | ![Initial Setup](images/create-initial.png) |
| **Check Dependencies** |Check all Clean Arch dependencies | ![Check Dependencies](images/check-dependencies.png) |
| **Add Dependencies** |Add all Clean Arch dependencies | ![Add Dependencies](images/add-dependencies.png) |
| **Create Feature** | Generates feature folder structure | ![Create Feature](images/create-folders.png) |
| **New Use Case** | Creates use case with tests | ![New UseCase](images/new-usecase.png) |
| **New Repository** | Creates repository pattern files | ![New Repository](images/new-repository.png) |

### 🔧 **Right-Click Context Menu**
![Context Menu](images/context-menu.png)

Access all commands directly from VSCode's context menu by right-clicking on any folder.

## 🗂️ Template Structure

```
.my_templates/flutter_tdd_clean_templates/
├── config/                          # 🔧 Project configuration
│   └── injection_container.template
├── core/                            # 🧠 Shared infrastructure
│   ├── api/
│   │   ├── api_request_handler.template
│   │   ├── dio_interceptor.template
│   │   └── handle_exception.template
│   ├── config/
│   │   └── core_injection.template
│   ├── errors/
│   │   ├── exceptions.template
│   │   └── failure.template
│   ├── storage/
│   │   ├── exports_local_storage.template
│   │   ├── local_storage_handler.template
│   │   └── local_storage_keys.template
│   ├── usecase/
│   │   └── usecase_base.template
│   └── utils/
│       ├── either.template
│       └── typedef.template
├── feature/                         # 🎯 Feature-specific templates
│   ├── usecase/
│   │   ├── params/
│   │   │    └── {{usecase_name.snakeCase}}_usecase.template
│   │   ├── no_params
│   │   │    └── {{usecase_name.snakeCase}}_usecase.template
│   ├── repository/
│   │   └── {{repository_name.snakeCase}}_repository.template
│   │   └── {{repository_name.snakeCase}}_repository_impl.template
│   │       
│   └── datasource/
│       └── {{repository_name.snakeCase}}_datasource.template
│ 
└── test/                           # 🧪 Testing templates
    ├── core/
    │   ├── api/
    │   │   └── api_request_handler_test.template
    │   ├── fixtures/
    │   │   └── fixture_reader.template
    │   ├── datasources/
    │   │   └── {{repository_name.snakeCase}}_datasource_test.template
    │   ├── repository/
    │   │   └── {{repository_name.snakeCase}}_repository_impl_test.template
    ├── usecase/
    │    └── params/
    │         └── {{usecase_name.snakeCase}}_usecase_test.template
    │   ├── no_params
              └── {{usecase_name.snakeCase}}_usecase_test.template
```

## 🧱 Architecture Layers

<!-- <div align="center">
  <img src="images/architecture-flow.png" alt="Architecture Flow" width="700"/>
  <p><em>Data flow between Clean Architecture layers</em></p>
</div> -->

### 📱 **Presentation Layer** (`lib/src/{feature}/presentation/`)
Handles UI components and user interactions.
- **Pages**: Full-screen widgets (screens)
- **Widgets**: Reusable UI components of the feature
- **BLoCs/Cubits**: State management components
- **Utils**: Presentation-specific utilities

### 🎯 **Domain Layer** (`lib/src/{feature}/domain/`)
Contains business logic and rules (Framework independent).
- **Entities**: Core business objects
- **Repositories**: Abstract interfaces for data access
- **Use Cases**: Application-specific business rules

### 🔌 **Data Layer** (`lib/src/{feature}/data/`)
Manages data from various sources.
- **Models**: Data transfer objects with JSON serialization
- **Repositories**: Concrete implementations of domain repositories
- **Datasources**: Abstract interfaces and implementations for data sources 

### 💉 **Config** (`lib/src/{feature}/config/`)
Contains the injection dependencies of the feature. 

### ⚙️ **Core Layer** (`lib/core/`)
Shared functionality across the entire application.
- **API**: HTTP client configuration and error handling
- **Storage**: Local and secure storage abstractions and his implementations
- **Errors**: Application-wide error handling
- **Utils**: Common utilities and type definitions
- **UseCase**: Base classes for use cases
- **Config**: Injections of dependencies of core


## 📁 Folder Organization

### 🎯 **Feature-First Structure**
Each feature follows this pattern:
```
lib/src/{feature_name}/
├── data/
│   ├── datasources/
│   ├── models/
│   └── repositories/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
├── presentation/
│   ├── blocs/
│   ├── pages/
│   ├── utils/
│   └── widgets/
└── config/
```

### 🧪 **Testing Structure**
Tests mirror the main structure:
```
test/src/{feature_name}/
├── data/
│   ├── datasources/
│   ├── models/
│   └── repositories/
├── domain/
│   ├── entities/
│   └── usecases/
└── presentation/
    ├── blocs/
    ├── pages/
    └── widgets/
```

## 🔧 Core Structure

### 🌐 **API Layer**
- **ApiRequestHandler**: Centralized HTTP request management
- **DioInterceptor**: Authentication and logging
- **HandleException**: Unified error handling

### ⚡ **Config Layer**
- Uses **GetIt** for service location
- Modular registration by feature
- Easy to mock for testing

### 💾 **Storage Layer**
- **LocalStorageHandler**: Unified interface for storage
- **LocalStorageKeys**: Centralized key management
- Supports both regular and secure storage

### 🐞 **Errors Layer**
- **ServerException**: Represents a standardized server-side error within the application
- **Failure**: Represents an error that has been transformed from a low-level [Exception] (e.g., [ServerException]) into a higher-level abstraction suitable for the domain and presentation layers

### 🧩 **Usecase Layer**
- **UsecaseBaseWithParams**: Base class for a use case that requires input [Params]
- **UsecaseBaseWithoutParams**: Base class for a use case that does not require input parameters

### ⚡ **Utils Layer**
- **Either**: A generic representation of a value that can be one of two possible types
- **ResultFuture**: This allow to get a short way to reuse the declared method when some contract is created
- **DataMap**: With this approach we eliminate boilerplate

## 🧪 Testing Structure

### 🔧 **Test Types Included**
- **Unit Tests**: For use cases, repositories, and business logic
- **Bloc Tests**: For presentation integration flow with state management
- **Widget Tests**: For presentation components
- **Integration Tests**: For complete user flows

### 🎭 **Mocking Strategy**
- **Mocktail**: For creating test doubles
- **BlocTest**: For testing BLoC/Cubit states
- **Fixtures**: Sample data for testing loaded from json

### 📊 **Test Structure**
```
test/
├── core/                    # Core functionality tests
├── src/{feature}/          # Feature-specific tests
└── fixtures/               # Utils function read json
```

## 📦 Dependencies

![Dependencies Preview](images/dependencies-preview.png)

### 🏗️ **Core Dependencies**
```yaml
dependencies:
  # State Management
  flutter_bloc: ^9.1.1
  bloc: ^9.0.0
  
  # Dependency Injection  
  get_it: ^8.2.0
  
  # Network
  dio: ^5.9.0
  
  # Storage
  shared_preferences: ^2.5.3
  flutter_secure_storage: ^9.2.4
  
  # Utilities
  equatable: ^2.0.7

dev_dependencies:
  # Testing
  mocktail: ^1.0.4
  bloc_test: ^10.0.0
  flutter_test:
    sdk: flutter
```

<!-- TODO -->
<!-- ## 🚀 Usage -->

<!-- ### 📹 **Quick Start Video**
<div align="center">
  <a href="https://youtu.be/your-video-id">
    <img src="images/video-thumbnail.png" alt="Quick Start Video" width="500"/>
  </a>
  <p><em>Click to watch the complete setup guide (5 minutes)</em></p>
</div> -->

### 1️⃣ **Setup Initial Architecture**

![Step 1](gif/step1-initial-setup.gif)

```bash
# Right-click on project folder → "TDD Clean Arch.: Create initial needs"
```
This creates the complete core infrastructure.

### 2️⃣ **Add Dependencies**

![Step 2](gif/step2-add-dependencies.gif)

```bash
# Right-click on project folder → "TDD Clean Arch.: Add dependencies"
```
Automatically adds all required dependencies to `pubspec.yaml`.

### 3️⃣ **Create Feature Folders**

![Step 3](gif/step3-create-folders.gif)

```bash
# Right-click on lib/src/ → "TDD Clean Arch.: Create feature"
# Enter feature name (e.g., "authentication")
```
This create the entire folder structure to a new feature

### 4️⃣ **Generate Use Cases**

![Step 4](gif/step4-new-usecase.gif)

```bash
# Right-click on feature/domain/usecases/ → "TDD Clean Arch.: New usecase with params"
# Enter use case name (e.g., "login_user")
```
This creates a usecase with support to Params

```bash
# Right-click on feature/domain/usecases/ → "TDD Clean Arch.: New usecase without params"
# Enter use case name (e.g., "logout_user")
```
This creates a usecase with no needs to Params

### 5️⃣ **Generate Repository**

![Step 5](gif/step5-new-repository.gif)

```bash
# Right-click on feature/domain/repository/ → "TDD Clean Arch.: New Repository"
# Enter repository name (e.g., "authentication")
```
This create a repository, with his respective datasource

## 📚 Examples

### 🔐 **Generated Project Structure**

<div align="center">
  <img src="images/generated-project-structure.png" alt="Generated Project Structure" width="400"/>
  <p><em>Complete feature structure generated by the extension</em></p>
</div>

### **Authentication Feature Example**
```
lib/src/authentication/
├── data/
│   ├── datasources/
│   │   └── authentication_remote_datasource.dart
│   ├── models/
│   │   └── user_model.dart
│   └── repositories/
│       └── authentication_repository_impl.dart
├── domain/
│   ├── entities/
│   │   └── user.dart
│   ├── repositories/
│   │   └── i_authentication_repository.dart
│   └── usecases/
│       ├── login.dart
│       ├── logout.dart
│       └── get_current_user.dart
└── presentation/
    ├── blocs/
    │   └── authentication_bloc.dart
    ├── pages/
    │   ├── login_page.dart
    │   └── profile_page.dart
    ├── widgets/
    │     ├── login_form.dart
    │     └── user_avatar.dart
    │ 
    └── utils/
          ├── form_validators.dart
          ├── context_extensions.dart
          └── snackbar_helper.dart
```

### 🧪 **Generated Test Example**

![Generated Test](images/generated-test-example.png)

```dart
class MockIAuthenticationRepository extends Mock implements IAuthenticationRepository
// test/src/authentication/domain/usecases/login_user_test.dart
void main() {
  late LoginUsecase usecase;
  late IAuthenticationRepository mockIRepository;

  setUp(() {
    mockIRepository = MockIAuthenticationRepository(); 
    usecase = LoginUsecase(mockIRepository);

  });

  //! To this example we going suppose that in the repository call the method [login]
  test(
    'LoginUsecase: [IAuthenticationRepository.login] should call with the correct parameters',
    () async {
      // Arrange
      final params = Params(email: 'test@gmail.com', password: 'password');
      when(
        () => mockIRepository.login(email: params.email, password: params.password),
      ).thenAnswer((_) async => Right(Token(accessToken: 'accessToken', tokenType: 'tokenType'))); // ! TODO: Replace 

      // Act
      final result = await usecase(params); // Here we call the usecase and fired the IRepository.methodCall

      // Assert
      expect(result, Right<Failure, Token>(Token(accessToken: 'accessToken', tokenType: 'tokenType'))); // ! TODO: Replace [Token] by your entity
      verify(
        () => mockIRepository.login(email: params.email, password: params.password), // ! TODO: Replace [mockIRepository.login] by your real call
      ).called(1); //! To Verify the repo is called once
      verifyNoMoreInteractions(mockIRepository); //! Verify not more interacion with the IRepository
    },
  );
}
```

## 🎯 **Template Variables**

Templates support the following placeholders:

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `{{package_name}}` | Project package name | `my_app` |
| `{{feature_name}}` | Feature name | `authentication` |
| `{{usecase_name}}` | Use case name | `login_user` |

### 📝 **Format Variations**
Each placeholder supports multiple case formats:
- `{{placeholder.snakeCase}}` → `login_user`
- `{{placeholder.camelCase}}` → `loginUser`
- `{{placeholder.pascalCase}}` → `LoginUser`
- `{{placeholder.lowerCase}}` → `login user`
- `{{placeholder.upperCase}}` → `LOGIN USER`

## 🏗️ **Architecture Benefits**

### ✅ **Testability**
- Each layer can be tested independently
- Easy mocking with dependency injection
- High test coverage achievable

### 🚀 **Scalability**
- Features are independent modules
- Easy to add new features without affecting existing code
- Clear separation of concerns

### 🔧 **Maintainability**
- Code is organized by business logic
- Dependencies flow in one direction
- Easy to understand and modify

### 🎯 **Flexibility**
- Easy to swap implementations
- Framework-agnostic business logic
- Adaptable to changing requirements

## 🛠️ **Installation**

1. **From VSCode Marketplace:**
   - Open VSCode
   - Go to Extensions (Ctrl+Shift+X)
   - Search "TDD Clean Architecture"
   - Click Install

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <img src="logo.png" alt="Footer Banner" width="600"/>
  <h3>🎯 Happy Coding with TDD and Clean Architecture! 🎯</h3>
  <p>Built with ❤️ for the Flutter community</p>
  
  [![GitHub Stars](https://img.shields.io/github/stars/alcampospalacios/flutter_tdd_clean_architecture?style=social)](https://github.com/alcampospalacios/flutter_tdd_clean_architecture)
  [![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/d/alcampospalacios.tdd-clean-architecture)](https://marketplace.visualstudio.com/items?itemName=alcampospalacios.tdd-clean-architecture)
  [![VS Code Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/alcampospalacios.tdd-clean-architecture)](https://marketplace.visualstudio.com/items?itemName=alcampospalacios.tdd-clean-architecture&ssr=false#review-details)
</div>