# This file contains a setup that i am partial to for react apps

1. Generate a project with vite
   a. use the following config:

```
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import eslint from "vite-plugin-eslint";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
    },
    server: {
      port: 3000,
      open: true,
    },
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      eslint(),
      // svgr options: https://react-svgr.com/docs/options/
      svgr({ svgrOptions: { icon: true } }),
    ],
  };
});

```

2. Setup the following scripts, replacing the env variables as needed

```
"scripts": {
    "start": "vite",
    "start:test": "npm run build:test && node server.js",
    "build": "vite build",
    "build:test": "cross-env VITE_DI_FEDERATION_URI=https://samples.auth0.com/authorize VITE_BASE_URL=http://localhost:3000 VITE_API_BASE_URL=http://localhost:3000 vite build",
    "test": "npm run test:ci",
    "lint": "eslint --ext .js,.jsx src/",
    "eject": "vite eject",
    "prettier": "prettier --write .",
    "test:dev": "concurrently -k -s first \"npm:test:dev:*\"",
    "test:dev:app": "npm run start:test",
    "test:dev:run": "wait-on -t 600000 http://127.0.0.1:3000 && cross-env CYPRESS_BASE_URL=http://127.0.0.1:3000 cypress open",
    "test:ci": "concurrently -k -s first \"npm:test:ci:*\"",
    "test:ci:app": "npm run start:test",
    "test:ci:run": "wait-on -t 600000 http://127.0.0.1:3000 && cross-env CYPRESS_BASE_URL=http://127.0.0.1:3000 cypress run --browser firefox"
  },
```

3. Install the following dependencies:

```
"dependencies": {
    "@emotion/react": "^11.9.3",
    "@emotion/styled": "^11.9.3",
    "@testing-library/jest-dom": "^5.16.4",
    "@testing-library/react": "^13.3.0",
    "@testing-library/user-event": "^13.5.0",
    "axios": "^0.27.2",
    "express": "^4.18.2",
    "formik": "^2.2.9",
    "lodash": "^4.17.21",
    "nocache": "^4.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "react-toastify": "^9.1.2",
    "react-use": "^17.4.0",
    "yup": "^1.0.2"
  }
```

4. Further install the ui library of choice (e.g. @mui) and any date libary of choice (e.g. day-js). Note: must be compatible with @mui if thats what you chose.
5. install the following devDependencies:

```
"devDependencies": {
    "@faker-js/faker": "^8.0.1",
    "@testing-library/cypress": "^9.0.0",
    "@vitejs/plugin-react": "^4.0.1",
    "concurrently": "^8.0.1",
    "cross-env": "^7.0.3",
    "cypress": "^12.13.0",
    "eslint": "^8.40.0",
    "eslint-config-react-app": "^7.0.1",
    "eslint-plugin-cypress": "^2.13.3",
    "eslint-plugin-react": "^7.32.2",
    "prettier": "^2.8.7",
    "url": "^0.11.0",
    "vite": "^4.3.9",
    "vite-plugin-eslint": "^1.8.1",
    "vite-plugin-svgr": "^3.2.0",
    "wait-on": "^7.0.1"
  }
```

6. Setup express server:

```
const express = require("express");
const path = require("path");
const nocache = require("nocache");
const app = express();

console.log(`looking for files in ${path.join(__dirname, "build")}`);

app.use(nocache());
app.use(express.static(path.join(__dirname, "build")));

app.get("/health", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "health.html"));
});

app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port);

console.log(`Server running on port ${port}!`);

```

7. Setup cypress config:

```
const { defineConfig } = require("cypress");

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "vite",
      bundler: "rollup",
    },
  },

  e2e: {
    setupNodeEvents(on, config) {},
    experimentalRunAllSpecs: true,
  },

  viewportWidth: 1920,
  viewportHeight: 1080,
  video: false,
  experimentalMemoryManagement: true,
  requestTimeout: 10000,
  retries: {
    // Configure retry attempts for `cypress run`
    // Default is 0
    runMode: 1,
    // Configure retry attempts for `cypress open`
    // Default is 0
    openMode: 0,
  },
});

```

8. prettierignore

```
# Ignore artifacts:
build
coverage
node_modules
public
```

9. .gitignore

```
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules

# testing
/coverage

# production
/build

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json
yarn.lock
.env

cypress/downloads/
cypress/screenshots/
cypress/videos/
```

10. .eslintrc.js

```
module.exports = {
  env: {
    node: true,
    browser: true,
    commonjs: true,
    es2021: true,
    "cypress/globals": true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react/jsx-runtime",
    "react-app",
  ],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "cypress"],
  rules: {
    "react/prop-types": 0,
    "no-irregular-whitespace": 0,
  },
};

```

11. Cypress e2e.js

```
// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')
import chaiUrl from "chai-url";
chai.use(chaiUrl);

// Adds a 1 second delay on ALL fetches
beforeEach(() => {
  cy.intercept(
    {
      url: "localhost:3000/*",
      middleware: true,
    },
    (req) => {
      req.on("response", (res) => {
        // Throttle the response to 1 second delay
        res.setDelay(500);
      });
    }
  );
});

Cypress.Keyboard.defaults({
  keystrokeDelay: 0,
});

// Clear all sessions saved on the backend, including cached global sessions.
Cypress.session.clearAllSavedSessions();

```
