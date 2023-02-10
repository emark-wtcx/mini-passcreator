const express = require('express');
const app = express();
const path = require('path');
const logDe = 'passcreator_success_log'
const errorDe = 'passcreator_error_log'
const testUrl = 'https://eo2mifqm9yelk7e.m.pipedream.net'
const tokenUrl = 'https://mc3tb2-hmmbngz-85h36g8xz1b4m.auth.marketingcloudapis.com/v2/token'
const apiKey = '8cn/SZm168HpBz_dUK&GvEIxwL6xbf8YE8rB3Il9tO_od0XngAeBV9tLe_LykQxPC4A4i0K1zKoOlxQ0'

var HOME_DIR = '/';
var postDebug = true
var dataType = 'application/json'
var finalResponse = {'data':null}
var access_token = null /* Raw token */
var accessToken = null /* Parsed token */
var restDomain = null /* REST domain for logging */

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
var PORT = process.env.port || 8080;

/**
 *
 * Front End Routes 
 * 
**/
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
 **/
app.get('/test', function (req, res) {
  res.sendFile(path.resolve('./html/test_area.html'));
});

/**
 *  
 * Back End Routes
 * 
**/

/**
 * Send payload to Passcreator 
 */
app.post('/execute',async function (req, res, next) { 
  if (postDebug) console.log('/execute called ')
  if (req.body != null){
    await postMessage(req.body).then((serverResponse) => {
    if (postDebug) console.log('/execute Response: ')
    if (postDebug) console.table(serverResponse)
    return res.json(serverResponse)
    })
  }else{
    return {'message':'No data submitted'}
  }
})

/**
 * Test reading data from a DataExtension identified by CustomerKey 
 */
app.post('/getde',async function (req, res, next) { 
  if (postDebug) console.log('/getde called ') 
  if (postDebug) console.table(req.body)
  if (req.body.customerKey != null){
    await getDataExtension(req.body.customerKey).then((getServerResponse) => {
    if (postDebug) console.log('/getde Response: ')
    if (postDebug) console.table(getServerResponse)
    return res.json(getServerResponse)
    })
  }else{
    return {'message':'No data submitted'}
  }
})

/**
 * Test requesting an authentication token
 */
app.post('/testauth',async function (req, res, next) { 
  if (postDebug) console.log('/testauth called ') 
  if (req != null){
    await getAccessToken().then((getAuthResponse) => {
      if (postDebug) console.log('/testauth Response: ')
      if (postDebug) console.table(getAuthResponse)
      return res.json(getAuthResponse)
    })
  }else{
    return {'message':'No data submitted'}
  }
})

/**
 * Test writing data to the log 
 */
app.post('/testlog',async function (req, res, next) { 
  if (postDebug) console.log('/testlog called') 
  if (req != null){
    await logData('Log test',req.body).then((logResponse) => {
      if (postDebug) console.log('/testlog Response: ')
      if (postDebug) console.table(logResponse)
      return res.send(logResponse)
    })
  }else{
    return {'message':'No data submitted'}
  }
})

/**
 * Send a mock payload to the test endpoint 
 */
app.post('/testmessage',async function (req, res, next) { 
  if (postDebug) console.log('/testmessage called ')
  if (req.body != null){
    await postMessage(req.body).then((serverResponse) => {
    if (postDebug) console.log('/testmessage Response: ')
    if (postDebug) console.table(serverResponse)
    return res.json(serverResponse)
    })
  }else{
    return {'message':'No data submitted'}
  }
})


/**
 * Generic Error Handling
 */
app.use(function (err, req, res, next) {
  console.table(err.stack)
  res.status(500).send('Something broke!')
})


/**
 *  Back End Functions
* */

function guid() { 
  var d = new Date().getTime();//Timestamp
  var d2 = (performance && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16;//random number between 0 and 16
      if(d > 0){//Use timestamp until depleted
          r = (d + r)%16 | 0;
          d = Math.floor(d/16);
      } else {//Use microseconds since page-load if supported
          r = (d2 + r)%16 | 0;
          d2 = Math.floor(d2/16);
      }
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function getDateTime(){
  let d = new Date();
  var requestDate = d.toLocaleDateString()
  var requestTime = d.toLocaleTimeString()
  var dateTime = requestDate+'-'+requestTime;
  return {
    'Date':requestDate,
    'Time':requestTime,
    'DateTime':dateTime,
    'ISODateTime':d.toISOString()
  }
}

function setToken(payload){
  if (postDebug) console.log('(setToken) setting token: '+payload.token)
  access_token = payload.token
  accessToken = 'Bearer '+access_token
}
function setRestUrl(payload){
  if (postDebug) console.log('(setRestUrl) setting restUrl: '+payload.restUrl)
  restDomain = payload.restUrl
}

async function postMessage(data){
  /**
   *  The inArguments property originates in JourneyBuilder
   *  if the property is missing, the request is a test
   */
  if (data.hasOwnProperty('inArguments')
    && data.inArguments[0].hasOwnProperty('endpoint')
    ){
    var messageData = data.inArguments[0]
  }else{
    var messageData = data
    messageData.endpoint = testUrl
    }

  if (postDebug) console.log('checking for: token')
  if (messageData.hasOwnProperty('token')){
    if (postDebug) console.log('prop found: token')
    setToken(messageData)
  }
  if (postDebug) console.log('checking for: restUrl')
  if (messageData.hasOwnProperty('restUrl')){
    if (postDebug) console.log('prop found: restUrl')
    setRestUrl(messageData)
  }
    
  if (postDebug) console.log('POST messageData: ')
  if (postDebug) console.table(messageData)

  var date = getDateTime();
  /**
   * Restructure call with 
   * PassCreator required fields
   */
  var bodyContent = {
    "pushNotificationText":messageData.message+ ' | ['+date.Time+']',   
    "url":messageData.endpoint,
    "token":messageData.token,
    "restUrl":messageData.restUrl
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
  let postResponse = postDataToPassCreator(messageData.endpoint, bodyContent)
    .then((dataResponse) => {
      //  Build response /
      var messageResponse = {
        'requestDate':date.DateTime,
        'messageData':JSON.stringify(dataResponse)
      }
      if (dataResponse && dataResponse.hasOwnProperty('status')){
        messageResponse.status = dataResponse.status
      }

      if (postDebug) console.log('pDTPC messageResponse:',messageResponse); 
      if (postDebug) console.table(messageResponse);
      return messageResponse
    });
  return postResponse
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
  if (postDebug) console.log('getDataExtension Table by CustomerKey: ')
  if (postDebug) console.table(customerKey)
  
  // Perform Request
  await getAccessToken().then(async (accessToken) => {
    if (postDebug) console.log('getDataExtension accessToken: ')
    if (postDebug) console.table(accessToken)

    /* Get DE Headers */
    var headers = {
      "Accept": dataType,
      "Content-Type": dataType,
      "Authorization":accessToken
    }

    if (postDebug) console.log('getDataExtension Headers: ')
    if (postDebug) console.table(headers)
    if (postDebug) console.log('getDataExtension Endpoint: '+data.url)

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
        logData('Got data extension:',customerKey)
        return messageResponse
      }).catch((error) => {
        logError(error)
      });
      if (postDebug) console.log('getDataExtension getDataResponse: ')
      if (postDebug) console.table(getDataResponse)
      return getDataResponse; // return response
    })
}

async function logData(message,data={}){
  if (postDebug) console.log('logData called')
  let date = getDateTime();
  let logId = guid();
  let loggingUri = 'data/v1/async/dataextensions/key:'+logDe+'/rows'

  let row = {'items':[
    {
      'Id':logId,
      'DateTime':date.ISODateTime,
      'Message':message,
      'MetaData':JSON.stringify(data)
    }
    ]
  }
  
  if (postDebug) console.log('logData loggingUrl: '+loggingUri)
  if (postDebug) console.log('logData items: ')
  if (postDebug) console.table(row.items)

  await postData(loggingUri,row)   
    .then(async logResponse => JSON.stringify(logResponse))
    .then((logResponse) => {
    if (postDebug) console.log('logData logResponse: ')
    if (postDebug) console.table(logResponse)
    return logResponse
    });  
}


async function logError(message,data={}){
  let loggingUri = '/data/v1/async/dataextensions/key:'+errorDe+'/rows'
  let date = getDateTime();
  let logId = guid();

  let row = {'items':[
    {
      'Id':logId,
      'DateTime':date.ISODateTime,
      'Message':message,
      'MetaData':JSON.stringify(data)
    }
    ]
  }

  await postData(loggingUri,row)
    .then((errorResponse) => {
      if (postDebug) console.log('logError logResponse: ')
      if (postDebug) console.table(errorResponse)
      return errorResponse  
      });
}

/**
 *  External API call engine 
 * */
async function getAccessToken(){
  if (accessToken == ''){
    if (postDebug) console.log('Requesting remote authentication')
    let authUrl = tokenUrl
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

    if (postDebug){
      console.log('Auth Headers: ')
      console.table(authHeaders)
      console.log('Auth URL: ')
      console.table(authUrl)
      console.log('Auth Body: ')
      console.table(authBody)
      }

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
        if (postDebug) console.log('Requested Authentication')
        if (authenticationResponse.hasOwnProperty('access_token')){
          access_token = authenticationResponse.access_token
          if (postDebug) console.log('Got Authentication: '+access_token)
          accessToken = 'Bearer '+access_token
          if (authenticationResponse.hasOwnProperty('rest_instance_url')){
            restDomain = authenticationResponse.rest_instance_url
          }
          if (authenticationResponse.hasOwnProperty('auth_instance_url')){
            authDomain = authenticationResponse.auth_instance_url
          }
          return accessToken
        }else{
          if (postDebug) console.log('Authentication failed: '+JSON.stringify(authResponse))
          }
      })
    if (postDebug) console.log('Authentication requested')
    return authResponse
  }else{
    if (postDebug) console.log('Authentication cached')
    return accessToken
  }
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
    let postResponse = await getAccessToken()
      .then(async accessToken => {
        var headers = {
          "Accept": "*/*",
          "Content-Type": dataType,
          "Authorization":accessToken
        }
        // Prepend Rest Domain to URL 
        // (if missing)
        if (url.indexOf(restDomain)==-1){
          url = restDomain+url
        }

        if (postDebug) {
          console.log('postData postDataUrl: '+url)
          console.log('postData headers: ')
          console.table(headers)
          console.log('postData data: ')
          console.log(JSON.stringify(postData))
        }

        let requestResponse = fetch(url, {
            method: 'POST', 
            headers: headers,
            body: JSON.stringify(postData)
          }).catch(errorObject => {
            let errorString = JSON.stringify(errorObject)
            // Broadcast error 
            if (postDebug) console.log('(postData) Backend error:'+errorString);
            return errorObject;
          }).then((fetchResult) => {
            if (postDebug) {
              let responseString = JSON.stringify(fetchResult)
              console.log('(postData) Backend responseString:'+responseString);
            }
            return fetchResult; // return response
          }).finally((fetchResult)=>{
            let responseString = JSON.stringify(fetchResult)
            console.log('(postData) Backend end fetchResult:'+responseString);
            return fetchResult
          });
        let responseString = JSON.stringify(requestResponse)
        console.log('(postData) Backend end requestResponse:'+responseString);
        return requestResponse;
        
      }
    );    
    return postResponse;
  }
}

async function postDataToPassCreator(url = '', postData=null) {
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
    }).then((response)=>{
      console.log('pDTPC raw response:')
      console.table(response)
      logData('Message sent',postData)
    })
    .catch((error) => {
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