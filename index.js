const express = require('express');
const app = express();
const path = require('path');
//const cors = require('cors');

var HOME_DIR = '/';
var postDebug = true
var dataType = 'application/json'
var finalResponse = {'data':null}
var apiKey = '8cn/SZm168HpBz_dUK&GvEIxwL6xbf8YE8rB3Il9tO_od0XngAeBV9tLe_LykQxPC4A4i0K1zKoOlxQ0'
var access_token = null
var accessToken = null

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
var PORT = process.env.port || 8080;

/**
 *  Front End Routes
* */
app.use('/', express.static(__dirname + HOME_DIR));

app.get('/', function (req, res) {
  res.sendFile(path.resolve('index.html'));
});

/**
 *  Mock form access
 * */
app.get('/form', function (req, res) {
  res.sendFile(path.resolve('./html/form.html'));
});

/**
 *  Tesing area access
 * */
app.get('/test', function (req, res) {
  res.sendFile(path.resolve('./html/test_area.html'));
});

/**
 *  Back End Routes
* */
app.post('/execute',function (req, res, next) { 
  if (postDebug) console.log('/execute called ')
  if (req.body != null){
    let serverResponse = postMessage(req.body)
    if (postDebug) console.log('/execute Response: ')
    if (postDebug) console.table(serverResponse)
    return res.json(serverResponse)
  }else{
    return {'message':'No data submitted'}
  }
})

app.post('/getde',async function (req, res, next) { 
  if (postDebug) console.log('/getde called ') 
  if (postDebug) console.table(req.body)
  if (req.body.customerKey != null){
    let getServerResponse = await getDataExtension(req.body.customerKey)
    if (postDebug) console.log('/getde Response: ')
    if (postDebug) console.table(getServerResponse)
    return res.json(getServerResponse)
  }else{
    return {'message':'No data submitted'}
  }
})

app.post('/testauth',async function (req, res, next) { 
  if (postDebug) console.log('/testauth called ') 
  if (req != null){
    var AuthResponse = await getAccessToken()
    .then((getAuthResponse) => {
      if (postDebug) console.log('/testauth Response: ')
      if (postDebug) console.table(getAuthResponse)
      return res.json(getAuthResponse)
    })
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
function postMessage(data){
  if (data.hasOwnProperty('inArguments')){
    var messageData = data.inArguments[0]
  }else{
    var messageData = data
    messageData.endpoint = 'https://eoya8wjvw5vh5ff.m.pipedream.net'
    }
    
  if (postDebug) console.log('POST messageData: ')
  if (postDebug) console.table(messageData)

  var date = getDateTime();

  var bodyContent = {
    "pushNotificationText":messageData.message+ ' | ['+date.Time+']',   
    "url":messageData.endpoint
  }
  if (postDebug) console.log('POST bodyContent: ')
  if (postDebug) console.table(bodyContent)

  var headers = {
    "Accept": dataType,
    "Content-Type": dataType,
    "Authorization":apiKey
  }
  if (postDebug) console.log('POST Headers: ')
  if (postDebug) console.table(headers)
  if (postDebug) console.log('POST Endpoint: '+messageData.endpoint)

  /**
   * Transmit Message via postData function
   */
  postData(messageData.endpoint, bodyContent)
    .then((dataResponse) => {
      //  Build response /
      var messageResponse = {
        'requestDate':date.DateTime
      }
      if (dataResponse && dataResponse.hasOwnProperty('status')){
        messageResponse.status = dataResponse.status
      }

      if (postDebug) console.log('POST messageResponse:'); 
      if (postDebug) console.table(messageResponse);
      finalResponse = messageResponse
    });
  if (postDebug) console.log('POST Final Response Called:'); 
  if (postDebug) console.table(finalResponse)
  return finalResponse
}

async function getDataExtension(customerKey){
  // Request setup
  var data = {}
  //data.customerKey = 'testing_dale'
  let dePath = 'https://www.exacttargetapis.com/data/v1/customobjectdata/key/{{dataextension}}/rowset/'
  data.url = dePath.replace('{{dataextension}}',customerKey)

  // Request time
  var date = getDateTime();

  // Request content
  if (postDebug) console.log('GetDE Table by CustomerKey: ')
  if (postDebug) console.table(customerKey)
  
  
  let accessToken = await getAccessToken()
  var headers = {
    "Accept": dataType,
    "Content-Type": dataType,
    "Authorization":accessToken
  }

  if (postDebug) console.log('GetDE Headers: ')
  if (postDebug) console.table(headers)
  if (postDebug) console.log('GetDE Endpoint: '+data.url)

  //
  // Request Data via getData function
  //
  var getDataResponse = await getData(data.url,headers)
    .then((dataResponse) => {
      if (postDebug) console.log('getDataExtension dataResponse: ')
      if (postDebug) console.table(dataResponse)
      //  Build response /
      var messageResponse = {
        'requestDate':date.DateTime,
        'status':200,
        'body':dataResponse
      }
      if (postDebug) console.log('getDataExtension Returning:'); 
      if (postDebug) console.log(JSON.stringify(messageResponse));
      return messageResponse
    });
    if (postDebug) console.log('getDataExtension getDataResponse: ')
    if (postDebug) console.table(getDataResponse)
    return getDataResponse; // return response
}

/**
 *  External API call engine 
 * */
async function getAccessToken(){
  console.log('Requesting Authentication')
  let authUrl = 'https://mc3tb2-hmmbngz-85h36g8xz1b4m.auth.marketingcloudapis.com/v2/token'
  let authBody = {
    "grant_type": "client_credentials",
    "client_id": "xja05pcunay325cyg6odcyex",
    "client_secret": "b36KqpkMECP8T3h0j2nD81Ve",
    "account_id": "7207193"
    }
    
  var authHeaders = {
    "Accept": dataType,
    "Content-Type": dataType
  }

  if (postDebug) console.log('Auth Headers: ')
  if (postDebug) console.table(authHeaders)
  if (postDebug) console.log('Auth URL: ')
  if (postDebug) console.table(authUrl)
  if (postDebug) console.log('Auth Body: ')
  if (postDebug) console.table(authBody)

  var authResponse = await fetch(authUrl, {
      method: 'POST', 
      mode: 'no-cors', 
      cache: 'no-cache', 
      credentials: 'omit', 
      headers: authHeaders,
      redirect: 'follow', 
      referrerPolicy: 'no-referrer', 
      body: JSON.stringify(authBody) 
    }).catch((error) => {
      // Broadcast error 
      if (postDebug) console.log('Backend auth error:'+JSON.stringify(error));
      return error;
    }).then(response => response.json())
    .then((authenticationResponse) => {  
      console.log('Requested Authentication')
      if (authenticationResponse.hasOwnProperty('access_token')){
        access_token = authenticationResponse.access_token
        console.log('Got Authentication: '+access_token)
        accessToken = 'Bearer '+access_token
        return accessToken
      }else{
        console.log('Authentication failed: '+JSON.stringify(authResponse))
        }
    })
    return authResponse
}
async function getData(url = '', headers) {
  var getResponse = await fetch(url, {
    method: 'GET', 
    mode: 'no-cors', 
    cache: 'no-cache', 
    credentials: 'omit', 
    headers: headers,
    redirect: 'follow', 
    referrerPolicy: 'no-referrer'
  }).catch((error) => {
    // Broadcast error 
    if (postDebug) console.log('Backend error:'+JSON.stringify(error));
    return error;
  }).then(response => response.json())
  .then((getResponse) => {
    return getResponse; // return response
  })
  return getResponse;
}

async function postData(url = '', postData=null) {
  if (url != '' && postData != null){
    // Default options are marked with *
    var headers = {
      "Accept": dataType,
      "Content-Type": dataType,
      "Authorization":apiKey
    }
    const postResponse = await fetch(url, {
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
    return postResponse; // return response
  }
}

app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});