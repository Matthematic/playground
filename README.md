These are typescript field components built with MUI 5 that hook into an existing formik context

CYPRESS:

# dependencies:

"concurrently": "^7.6.0",
"cross-env": "^7.0.3",
"wait-on": "^7.0.1"

# scripts:

"e2e:dev": "concurrently -k -s first \"npm:e2e:dev:_\"",
"e2e:dev:app": "npm run start:e2e",
"e2e:dev:run": "wait-on -t 60000 http://127.0.0.1:4321 && cross-env CYPRESS_BASE_URL=http://127.0.0.1:4321 cypress open",
"e2e:ci": "concurrently -k -s first \"npm:e2e:ci:_\"",
"e2e:ci:app": "npm run start:e2e",
"e2e:ci:run": "wait-on -t 600000 http://127.0.0.1:4321 && cross-env CYPRESS_BASE_URL=http://127.0.0.1:4321 cypress run",
