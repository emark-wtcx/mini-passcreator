const express = require('express');
const app = express();
const path = require('path');
var PORT = process.env.port || 8080;
 
const SLDS_DIR = '/node_modules/@salesforce-ux/design-system/assets'; 
const ASSET_DIR = '/assets';
const SCRIPT_DIR = '/js';
const HOME_DIR = '/';

app.use('/slds', express.static(__dirname + SLDS_DIR));
app.use('/assets', express.static(__dirname + ASSET_DIR));
app.use('/scripts', express.static(__dirname + SCRIPT_DIR));
app.use('/', express.static(__dirname + HOME_DIR));
  
app.get('/', function (req, res) {
  //res.send('Hello World!');
  res.sendFile(path.resolve('index.html'));
});
 
app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
  console.log('Express is a: '+typeof express);
});
// Comment for deployment 