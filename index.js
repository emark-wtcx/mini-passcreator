const apiKey = '8cn/SZm168HpBz_dUK&GvEIxwL6xbf8YE8rB3Il9tO_od0XngAeBV9tLe_LykQxPC4A4i0K1zKoOlxQ0'
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
var PORT = process.env.port || 8080;
/**
 *  Front End 
* */
const HOME_DIR = '/';
app.use('/', express.static(__dirname + HOME_DIR));
app.use(cors());

app.get('/', function (req, res) {
  res.sendFile(path.resolve('index.html'));
});

app.all('/form', function (req, res) {
  res.sendFile(path.resolve('./html/form.html'));
});
 
app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});


/**
 *  Back End 
* */
app.post('/execute', function (req, res, next) { 
  let passId = 'f2235798-6df8-4c85-97b3-a8b0ce26351a'
  req.body.url = 'https://app.passcreator.com/api/pass/'+passId+'/sendpushnotification'
  let serverResponse = postMessage(req.body)
  res.json(serverResponse)
})

const postMessage = function(data){
  d = new Date();
  var requestDate = d.toLocaleDateString()
  var requestTime = d.toLocaleTimeString()
  var dateTime = requestDate+' - '+requestTime;
  const bodyContent = {
    "pushNotificationText":data.message+ ' | ['+dateTime+']'
  }
  console.log('bodyContent: ')
  console.table(bodyContent)
  let dataType = 'application/json'
  var headers = {
    "Accept": dataType,
    "Content-Type": dataType,
    "Authorization":apiKey
  }
  console.log('URL: '+data.url)
  console.table(headers)

  var callResponse = postData(data.url, bodyContent)
  .then((dataResponse) => {
    //  Build response /
    let messageResponse = {
      'requestDate':dateTime,
      'body':dataResponse
    }
    console.log(messageResponse); // JSON data parsed by `data.json()` call
    return messageResponse
  });
  return callResponse

}

/**
 *  External API call engine 
 * */
async function postData(url = '', postData) {
  // Default options are marked with *
  let dataType = 'application/json'
  var headers = {
    "Accept": dataType,
    "Content-Type": dataType,
    "Authorization":apiKey
  }
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'no-cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'omit', // include, *same-origin, omit
    headers: headers,
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(postData) // body data type must match "Content-Type" header
  }).catch((error) => {
    // Broadcast error 
    console.log('Backend error:'+JSON.stringify(error));
    return error;
  });
  return response; // return response
}