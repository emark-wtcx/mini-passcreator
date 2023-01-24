const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');

var finalResponse = {'data':null}
const apiKey = '8cn/SZm168HpBz_dUK&GvEIxwL6xbf8YE8rB3Il9tO_od0XngAeBV9tLe_LykQxPC4A4i0K1zKoOlxQ0'
const postDebug = true
const HOME_DIR = '/';

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
var PORT = process.env.port || 8080;

/**
 *  Front End Routes
* */
app.use('/', express.static(__dirname + HOME_DIR));
app.use(cors());

app.get('/', function (req, res) {
  res.sendFile(path.resolve('index.html'));
});

/**
 *  Uncomment for development form access
 * */
app.get('/form', function (req, res) {
  res.sendFile(path.resolve(__dirname +'/html/form.html'));
});

/**
 *  Back End Routes
* */
app.post('/execute',function (req, res, next) { 
  if (req.body != null){
    let serverResponse = postMessage(req.body)
    if (postDebug) console.log('serverResponse: ')
    if (postDebug) console.table(serverResponse)
    return res.json(serverResponse)
  }else{
    return {'message':'No data submitted'}
  }
})

/**
 * Generic Error Handling
 */
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

/**
 *  Back End Functions
* */
postMessage = function(data){
  if (data.hasOwnProperty('inArguments')){
    var messageData = data.inArguments[0]
  }else{
    var messageData = data
    messageData.url = 'https://eo2mifqm9yelk7e.m.pipedream.net'
    }
    
  if (postDebug) console.log('messageData: ')
  if (postDebug) console.table(messageData)

  var date = getDateTime();

  var bodyContent = {
    "pushNotificationText":messageData.message+ ' | ['+date.Time+']'
  }
  if (postDebug) console.log('bodyContent: ')
  if (postDebug) console.table(bodyContent)

  let dataType = 'application/json'
  var headers = {
    "Accept": dataType,
    "Content-Type": dataType,
    "Authorization":apiKey
  }
  if (postDebug) console.log('Headers: ')
  if (postDebug) console.table(headers)
  if (postDebug) console.log('URL: '+messageData.url)

  /**
   * Transmit Message via postData function
   */
  postData(messageData.url, bodyContent)
    .then((dataResponse) => {
      //  Build response /
      var messageResponse = {
        'requestDate':date.DateTime,
        'status':dataResponse.status
      }
      if (postDebug) console.log('messageResponse:'); 
      if (postDebug) console.table(messageResponse);
      finalResponse = messageResponse
    });
  if (postDebug) console.log('Final Response Called:'); 
  if (postDebug) console.table(finalResponse)
  return finalResponse
}

function getDateTime(){
  let d = new Date();
  var requestDate = d.toLocaleDateString()
  var requestTime = d.toLocaleTimeString()
  var dateTime = requestDate+' - '+requestTime;
  return {
    'Date':requestDate,
    'Time':requestTime,
    'DateTime':dateTime
  }
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