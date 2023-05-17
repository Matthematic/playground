These are typescript field components built with MUI 5 that hook into an existing formik context

CYPRESS:

# dependencies:

"concurrently": "^7.6.0",
"cross-env": "^7.0.3",
"wait-on": "^7.0.1"

# scripts:

"start:e2e": "cross-env BROWSER=none PORT=4321 REACT*APP_API_BASE_URL_30=http://127.0.0.1:4321/api/v3.2/ REACT_APP_API_BASE_URL_32=http://127.0.0.1:4321/api/v3.2/ npm start",
"e2e:dev": "concurrently -k -s first \"npm:e2e:dev:*\"",
"e2e:dev:app": "npm run start:e2e",
"e2e:dev:run": "wait-on -t 60000 http://127.0.0.1:4321 && cross-env CYPRESS*BASE_URL=http://127.0.0.1:4321 cypress open",
"e2e:ci": "concurrently -k -s first \"npm:e2e:ci:*\"",
"e2e:ci:app": "npm run start:e2e",
"e2e:ci:run": "wait-on -t 600000 http://127.0.0.1:4321 && cross-env CYPRESS_BASE_URL=http://127.0.0.1:4321 cypress run",
