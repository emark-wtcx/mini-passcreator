const express = require('express');
const app = express();
const path = require('path');
var PORT = process.env.port || 8080;

const HOME_DIR = '/';
app.use('/', express.static(__dirname + HOME_DIR));
  
app.get('/', function (req, res) {
  res.sendFile(path.resolve('index.html'));
});
 
app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});