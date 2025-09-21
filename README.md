# 🏗️ Flutter TDD Clean Architecture Templates

A comprehensive collection of templates to scaffold Flutter applications following **Clean Architecture** principles with **Test-Driven Development (TDD)** practices.

## 📋 Table of Contents

- [🎯 Overview](#-overview)
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
- **Datasources**: Abstract interfaces for data sources

### ⚙️ **Core Layer** (`lib/core/`)
Shared functionality across the entire application.
- **API**: HTTP client configuration and error handling
- **Storage**: Local and secure storage abstractions
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
└── presentation/
    ├── blocs/
    ├── pages/
    ├── utils/
    └── widgets/
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

### 💾 **Storage Layer**
- **LocalStorageHandler**: Unified interface for storage
- **LocalStorageKeys**: Centralized key management
- Supports both regular and secure storage

### ⚡ **Dependency Injection**
- Uses **GetIt** for service location
- Modular registration by feature
- Easy to mock for testing

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

## 🚀 Usage

### 1️⃣ **Setup Initial Architecture**
```bash
# Right-click on project folder → "TDD Clean Arch.: Create initial needs"
```
This creates the complete core infrastructure.

### 2️⃣ **Add Dependencies**
```bash
# Right-click on project folder → "TDD Clean Arch.: Add dependencies"
```
Automatically adds all required dependencies to `pubspec.yaml`.

### 3️⃣ **Create Feature Folders**
```bash
# Right-click on lib/src/ → "TDD Clean Arch.: Create folders"
# Enter feature name (e.g., "authentication")
```
This create the entire folder structure to a new feature

### 4️⃣ **Generate Use Cases**
```bash
# Right-click on feature/domain/usecases/ → "TDD Clean Arch.: New usecase with params"
# Enter use case name (e.g., "login_user")
```
This creates a usecase with support to Params

```bash
# Right-click on feature/domain/usecases/ → "TDD Clean Arch.: New usecase without params","
# Enter use case name (e.g., "login_user")
```
This creates a usecase with no needs to Params

### 5️⃣ **Generate Repository**
```bash
# Right-click on feature/domain/repository/ → "TDD Clean Arch.: New Repository"
# Enter repository name (e.g., "authentication")
```
This create a repository, with his respective datasource

## 📚 Examples

### 🔐 **Authentication Feature Example**
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

### 🧪 **Test Example**
```dart
class MockIAuthenticationRepository extends Mock implements IAuthenticationRepository
// test/src/authentication/domain/usecases/login_user_test.dart
void main() {
  group('Login', () {
    late Login usecase;
    late IAuthenticationRepository mockRepository;

    setUp(() {
      mockRepository = MockIAuthenticationRepository();
      usecase = Login(mockRepository);
    });

    test('should return User when login is successful', () async {
      // arrange
      const tUser = User(id: '1', email: 'test@test.com');
      when(() => mockRepository.login(any(), any()))
          .thenAnswer((_) async => const Right(tUser));

      // act
      final result = await usecase(LoginParams(
        email: 'test@test.com',
        password: 'password',
      ));

      // assert
      expect(result, const Right<Failure, User>(tUser));
      verify(() => mockRepository.login('test@test.com', 'password')).called(1);
      verifyNoMoreInteractions(mockRepository);
    });
  });
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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <h3>🎯 Happy Coding with TDD and Clean Architecture! 🎯</h3>
  <p>Built with ❤️ for the Flutter community</p>
</div>