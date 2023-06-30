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
12. Add typescript setup:
```
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */

    /* Projects */
    // "incremental": true,                              /* Save .tsbuildinfo files to allow for incremental compilation of projects. */
    // "composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./.tsbuildinfo",              /* Specify the path to .tsbuildinfo incremental compilation file. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects. */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */

    /* Language and Environment */
    "target": "es2016",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    "lib": ["ESNext", "DOM"],                                        /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    "jsx": "react-jsx",                                /* Specify what JSX code is generated. */
    // "experimentalDecorators": true,                   /* Enable experimental support for TC39 stage 2 draft decorators. */
    // "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h'. */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using 'jsx: react-jsx*'. */
    // "reactNamespace": "",                             /* Specify the object invoked for 'createElement'. This only applies when targeting 'react' JSX emit. */
    // "noLib": true,                                    /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */
    // "moduleDetection": "auto",                        /* Control what method is used to detect module-format JS files. */

    /* Modules */
    "module": "commonjs",                                /* Specify what module code is generated. */
    // "rootDir": "./",                                  /* Specify the root folder within your source files. */
    "moduleResolution": "node",                       /* Specify how TypeScript looks up a file from a given module specifier. */
    "baseUrl": "./src",                               /* Specify the base directory to resolve non-relative module names. */
    "paths": {
      "*": [
        "*",
        "./types/*",
      ],
    },                                      /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": ["src/types"],                                  /* Specify multiple folders that act like './node_modules/@types'. */
    "types": ["cypress", "@testing-library/cypress", "node"],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "moduleSuffixes": [],                             /* List of file name suffixes to search when resolving a module. */
    "resolveJsonModule": true,                        /* Enable importing .json files. */
    // "noResolve": true,                                /* Disallow 'import's, 'require's or '<reference>'s from expanding the number of files TypeScript should add to a project. */

    /* JavaScript Support */
    "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the 'checkJS' option to get errors from these files. */
    // "checkJs": true,                                  /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from 'node_modules'. Only applicable with 'allowJs'. */

    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If 'declaration' is true, also designates a file that bundles all .d.ts output. */
    //"outDir": "./",                                   /* Specify an output folder for all emitted files. */
    // "removeComments": true,                           /* Disable emitting comments. */
    "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "importsNotUsedAsValues": "remove",               /* Specify emit/checking behavior for imports that are only used for types. */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSourceMap": true,                          /* Include sourcemap files inside the emitted JavaScript. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have '@internal' in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like '__extends' in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing 'const enum' declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */
    // "preserveValueImports": true,                     /* Preserve unused imported values in the JavaScript output that would otherwise be removed. */

    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    // "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* Enable all strict type-checking options. */
    // "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied 'any' type. */
    // "strictNullChecks": true,                         /* When type checking, take into account 'null' and 'undefined'. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for 'bind', 'call', and 'apply' methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "noImplicitThis": true,                           /* Enable error reporting when 'this' is given the type 'any'. */
    // "useUnknownInCatchVariables": true,               /* Default catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    // "noUnusedLocals": true,                           /* Enable error reporting when local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read. */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Add 'undefined' to a type when accessed using an index. */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type. */
    // "allowUnusedLabels": true,                        /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */

    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": false                                 /* Skip type checking all .d.ts files. */
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
  ]
}
ˇ
```
