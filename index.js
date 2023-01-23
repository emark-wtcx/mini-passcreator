const apiKey = '8cn/SZm168HpBz_dUK&GvEIxwL6xbf8YE8rB3Il9tO_od0XngAeBV9tLe_LykQxPC4A4i0K1zKoOlxQ0'
const postDebug = false
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
var finalResponse = {'data':null}

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
/**
 *  Uncomment for development form
app.all('/form', function (req, res) {
  res.sendFile(path.resolve('./html/form.html'));
});
 */


/**
 *  Back End 
* */
app.post('/execute', function (req, res, next) { 
  //let passId = 'f2235798-6df8-4c85-97b3-a8b0ce26351a'
  //req.body.url = 'https://app.passcreator.com/api/pass/'+passId+'/sendpushnotification'
  let serverResponse = postMessage(req.body)
  if (postDebug) console.log('serverResponse: ')
  if (postDebug) console.table(serverResponse)
  return res.json(serverResponse)
})

postMessage = function(data){
  d = new Date();
  var requestDate = d.toLocaleDateString()
  var requestTime = d.toLocaleTimeString()
  var dateTime = requestDate+' - '+requestTime;
  const bodyContent = {
    "pushNotificationText":data.message+ ' | ['+dateTime+']'
  }
  if (postDebug) console.log('bodyContent: ')
  if (postDebug) console.table(bodyContent)
  let dataType = 'application/json'
  var headers = {
    "Accept": dataType,
    "Content-Type": dataType,
    "Authorization":apiKey
  }
  if (postDebug) console.log('URL: '+data.url)
  if (postDebug) console.log('Headers: ')
  if (postDebug) console.table(headers)

  postData(data.url, bodyContent)
    .then((dataResponse) => {
      //  Build response /
      var messageResponse = {
        'requestDate':dateTime,
        'status':dataResponse.status
      }
      if (postDebug) console.log('messageResponse:'); 
      if (postDebug) console.table(messageResponse);
      finalResponse = messageResponse
    });
  if (postDebug) console.log('Final Response Called:'); 
  return finalResponse

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
    method: 'POST', 
    mode: 'no-cors', 
    cache: 'no-cache', 
    credentials: 'omit', 
    headers: headers,
    redirect: 'follow', 
    referrerPolicy: 'no-referrer', 
    body: JSON.stringify(postData) 
  }).catch((error) => {
    // Broadcast error 
    if (postDebug) console.log('Backend error:'+JSON.stringify(error));
    return error;
  });
  return response; // return response
}


app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});