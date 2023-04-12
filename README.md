# Overview
This SFMC Journey Builder Custom Activity is developed using HTML5, ES6 & jQuery for the frontend and Node.js & expressJS server for the backend.
## Getting Started
Use "NPM start" to launch a local server for development.

### Files
**index.js** Main backend server, handles comminication between SFMC & Passcreator and logging data back to SFMC. The file is broken into three sections: Configuration, Routes and Functions

**jbActions.js** Entry point for the Activity, fires events, listens for responses, passes values to **jbApp**

**customActivity.js** Journey Builder UI Functions

**jbApp.js** Main frontend application, text input, ajax calls to the backend, etc

**package.json** NPM Configuration & Scripts

**config.json** Journey Bulder Activity Configuration file