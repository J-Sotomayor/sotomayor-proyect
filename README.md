# NoteManager

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.2.

## 🚀 Features

- Responsive design using Angular Material
- Firebase authentication (Email/Password)
- Firestore integration for notes and users
- Admin panel with user management (CRUD, password reset, block/unblock)
- Notes filtering (All, New, Completed)
- Export notes to PDF and Excel
- Form validation for note creation
- Role-based access control

---

## 🔧 Development server

To start a local development server, run:

```bash
ng serve
```

Then open your browser and navigate to `http://localhost:4200/`.

The application will reload automatically on any source file changes.

---

## 🔨 Code scaffolding

Generate a new component:

```bash
ng generate component component-name
```

To see all available schematics:

```bash
ng generate --help
```

---

## 🏗️ Building the project

To compile the project:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

---

## 🧪 Running unit tests

To run unit tests using [Karma](https://karma-runner.github.io):

```bash
ng test
```

---

## 🧪 Running end-to-end tests

Angular CLI does not include e2e testing by default.

To set it up, choose a tool like Cypress or Protractor.

---

## 🔥 Firebase Setup (Required)

> Before running the app, you need to set up Firebase correctly.

### 1. Install Firebase dependencies

```bash
npm install firebase @angular/fire
```

### 2. Configure Firebase environment

In both `src/environments/environment.ts` and `environment.prod.ts`, add your Firebase credentials:

```ts
export const environment = {
  production: false,
  firebase: {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID'
  }
};
```

> You can find these values in your [Firebase Console](https://console.firebase.google.com/).

### 3. Update `AppModule` with Firebase modules

In `app.module.ts`, make sure the Firebase modules are imported:

```ts
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

@NgModule({
  imports: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    // other modules...
  ]
})
```

### 4. Enable services in Firebase Console

In your Firebase project:

- Enable **Authentication → Email/Password**
- Enable **Firestore Database**
- Create collections like `users`, `notes` if needed
- Set up Firestore rules appropriately for your app

---

## 📦 How to Clone and Run the Project

1. Clone this repository:

```bash
git clone https://github.com/your-username/note-manager.git
```

2. Navigate to the project directory:

```bash
cd note-manager
```

3. Install dependencies:

```bash
npm install
```

4. Add your Firebase configuration in `environment.ts` and `environment.prod.ts`.

5. Run the app:

```bash
ng serve
```

---

## 📚 Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [AngularFire Documentation](https://github.com/angular/angularfire)
- [Firebase Console](https://console.firebase.google.com/)

---

## 📬 Feedback

Feel free to open issues or pull requests to contribute to this project.
