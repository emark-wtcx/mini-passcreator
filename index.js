// Import required modules
const express = require('express');
const app = express();
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const path = require('path');
const XML = require('./js/xml.js');
const fetchResponse = response => {
  if (!response.ok) { 
     throw Error(response.statusText);
  } else {
     return (isJson(response) ? response.json() : response.text());
  }
};

// Define variables
var br = "\n"

var configDe = 'passCreator_configuration'
var logDe = 'passcreator_success_log'
var errorDe = 'passcreator_error_log'

var testUrl = 'https://eo2mifqm9yelk7e.m.pipedream.net'
var testUrl = '/execute'
var testUrl = 'https://app.passcreator.com/api/pass/f2235798-6df8-4c85-97b3-a8b0ce26351a/sendpushnotification'

var protocol = 'https://'
var subdomain = 'mc3tb2-hmmbngz-85h36g8xz1b4m'

var HOME_DIR = '/';
var postDebug = true
var dataType = 'application/json'

// Raw properties
var access_token,accessToken,tokenExpiry,isLocalhost,MID = null

// Token Domain
var tokenUrl = '/v2/token'
var authDomain = protocol+subdomain+'.auth.marketingcloudapis.com'+tokenUrl 

// REST domain
var restDomain = protocol+subdomain+'.rest.marketingcloudapis.com'
// SOAP domain
var soapDomain = protocol+subdomain+'.soap.marketingcloudapis.com/Service.asmx'

// Set up middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
var PORT = process.env.port || 8080;

//Front End Routes

// Serve static files from the root directory
app.use('/', express.static(__dirname + HOME_DIR));

// Handle GET request to root URL
app.get('/', function (req, res) {
  res.sendFile(path.resolve('index.html'));
});

// Handle GET request to "/form" URL
app.get('/form', function (req, res) {
  res.sendFile(path.resolve('./html/form.html'));
});

// Handle GET request to "/test" URL
app.get('/test', function (req, res) {
  res.sendFile(path.resolve('./html/test_area.html'));
});

// Back End Routes

// Handle POST request to "/execute" URL
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

// Handle POST request to "/getde" URL
app.post('/getde',async function (req, res, next) { 
  if (req.body.customerKey != null){
    let getde = await getDataExtension(req.body.customerKey).then((getServerResponse) => {
    return res.json(getServerResponse)
    })
    return getde
  }else{
    return {'message':'No data submitted'}
  }
})

// Route to install config table
app.post('/install',async function (req, res, next) { 
  if (postDebug) console.log('/install route called ') 
  if (req != null && typeof req !== 'undefined'){

    if (req == null || req == false){
      console.log('/install route request received')
      console.table(req.toString())
      return false
    }else{
      console.log('/install request was received: ')
      console.table(req.body)
      let inputXml = req.body
      let configXml = await XML.soapBuildDe(inputXml.details,inputXml.fields)  
      
      return soapRequest(configXml)
        .then((installResponse) => {
          if (postDebug) console.log('/install successful') 
          res.send(installResponse)
          return installResponse
        }).catch((error)=>{ 
          let errorResponse = `(/install) Error: ${error}`
          return handleError(errorResponse);
        });    
    }
  }else{
    return {'responseJSON':'No data submitted'}
  }
})

//Route to write config data
app.post('/saveConfig',async function (req, res, next) { 
  if (postDebug) console.log('/install route called ') 
  if (req != null){
    let data = req.body
    if (!data){
      console.log('/install route No SOAP received')
      console.table(req.toString())
      return false
    }

    let response = await writeConfigData(data)
      .then((getResponse) => {
        let jsonResponse = res.send(getResponse)
        return jsonResponse
        })       
    return response;
  }else{
    return {'message':'No data submitted'}
  }
})

//Route to Write data to the log 
app.post('/log',async function (req, res, next) { 
  if (postDebug) console.log('(/log) called') 
  if (req != null){
    return await logData(req.body)
      .then((logResponse) => {
        if (postDebug) console.log('(/log) Response: ')
        if (postDebug) console.table(logResponse)
        return res.send(logResponse)
      }).catch((error) => {
        return handleError(error);
      }); 
  }else{
    return {'message':'No data submitted'}
  }
})

// Handle POST request to "/testauth" URL
app.post('/testauth',async function (req, res, next) { 
  if (postDebug) console.log('/testauth called ') 
  if (req != null){
    await getAccessToken().then((getAuthResponse) => {
      if (postDebug) console.log('/testauth Response: ')
      if (postDebug) console.table(getAuthResponse)
      return res.json(getAuthResponse)
    }).catch((error) => {
      return handleError(error);
    }); 
  }else{
    return {'message':'No data submitted'}
  }
})

// Handle POST request to "/testmessage" URL
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


// Generic Error Handling middleware
app.use(function (err, req, res, next) {
  console.table(err.stack)
  res.status(500).send('Something broke!')
})


// Back End Functions

// Function (helper) to get test if something is JSON
function isJson(input){
  try {
      JSON.stringify(input)
      console.log('(isJson) true')
  } catch (e) {
      console.log('(isJson) false')
      return false;
  }
  return true;
}
// Function to generate a GUID
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

// Function to get the current date and time
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

// Function to set the access token from a Journey Builder Payload
function setToken(payload){
  if (payload.hasOwnProperty('token') && !!payload.token){
    if (postDebug) console.log('(setToken) setting token: '+payload.token)
    access_token = payload.token
    accessToken = 'Bearer '+access_token
    return true;
  }else{
    return false;
  }
}
// Function to set the REST URL from a Journey Builder Payload
function setRestUrl(payload){
  if (payload.hasOwnProperty('restUrl') && !!payload.restUrl){
    if (postDebug) console.log('(setRestUrl) setting restUrl: '+payload.restUrl)
    restDomain = payload.restUrl
    return true;
  }else{
    return false;
  }
}

// Function to send a message to Passcreator
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

  if (postDebug) console.log('(postMessage)checking for: token')
  if (messageData.hasOwnProperty('token')){
    if (postDebug) console.log('prop found: token')
    setToken(messageData)
  }
  if (postDebug) console.log('(postMessage)checking for: restUrl')
  if (messageData.hasOwnProperty('restUrl')){
    if (postDebug) console.log('prop found: restUrl')
    setRestUrl(messageData)
  }
    
  if (postDebug) console.log('(postMessage) messageData: ')
  if (postDebug) console.table(messageData)

  var date = getDateTime();
  /**
   * Restructure call with 
   * PassCreator required fields
   * Include token for authenticating
   * SFMC API calls and URLs in case
   * of custom endpoints
   */
  var bodyContent = {
    "pushNotificationText":messageData.message+ ' | ['+date.Time+']',   
    "endpoint":messageData.endpoint,
    "token":accessToken,
    "authUrl":authDomain,
    "restUrl":restDomain,
    "apiKey":messageData.apiKey
  }
  if (postDebug){
    console.log('(postMessage) bodyContent: ')
    console.table(bodyContent)
    }


  /**
   * Transmit Message via postDataToPassCreator function
   */
  return await postDataToPassCreator(messageData.endpoint, bodyContent)
    .then((passResponse) => {
      //
      //  Build response 
      //
      let responseString = (isJson(passResponse) ? JSON.stringify(passResponse) : (passResponse.hasOwnProperty('body') ? passResponse.body : 'No Content'))        

      var messageResponse = {
        'requestDate':date.DateTime,
        'requestData':bodyContent,
        'messageData':responseString
      }
      //
      // Add call status if available
      //
      if (passResponse && passResponse.hasOwnProperty('status')){
        messageResponse.status = passResponse.status
      }

      if (postDebug){
        console.log('(postMessage)=>(pDTPC) messageResponse:',messageResponse); 
        console.table(messageResponse);
      }
      return messageResponse
    }).catch((error) => {
      return handleError(error);
    }); 
}

// Function to get data from a DataExtension
async function getDataExtension(customerKey){
  // Request setup
  var data = {}
  let endpoint = 'data/v1/customobjectdata/key/'+customerKey+'/rowset/'
  // Test to see if the domain has and end /
  if(restDomain.substring(restDomain.length - 1) == '/'){
    data.url = restDomain+endpoint
  }else{
    data.url = restDomain+'/'+endpoint
  }

  // Request content
  if (postDebug){
    console.log('(getDataExtension) Table by CustomerKey: ')    
    console.table(customerKey)
  }
  
  // Perform Request
  var accessToken = await getAccessToken();
  if (postDebug){
    console.log('(getDataExtension) accessToken: ')
    console.table(accessToken)
  }

  /* Get DE Headers */
  let restHeaders = {
    "Accept": dataType,
    "Content-Type": dataType,
    "Authorization":accessToken
  }
  data.headers = restHeaders;

  if (postDebug){
    console.log('getDataExtension Headers: ')
    console.table(restHeaders)
    console.log('getDataExtension Endpoint: '+data.url)
  }

  //
  // Request Data via getData function
  //
  return await getData(data.url,data.headers)
    .then((dataResponse) => {
      if (postDebug){
        console.log('(getDataExtension) dataResponse: ')
        console.table(dataResponse)
        }
      return dataResponse        
    }).catch((error) => {
      return handleError(error);
    }); 

}
async function writeConfigData(data={}){
  if (postDebug) console.log('logData called')
  let date = getDateTime();
  let logId = guid();
  let loggingUri = '/data/v1/async/dataextensions/key:'+configDe+'/rows'

  let row = {'items':[
    {
      'Id':logId,
      'DateModified':date.ISODateTime,
      'APIKey':data.apiKey
    }
    ]
  }
  
  if (postDebug) console.log('writeConfigData loggingUrl: '+loggingUri)
  if (postDebug) console.log('writeConfigData items: ')
  if (postDebug) console.table(row.items)

  return await postData(loggingUri,row)   
    .then(async (response) => JSON.stringify(response))
    .then((response) => {
    if (postDebug){
      console.log('writeConfigData response: ')
      console.table(response)
      }
    return response
    });  
}
// Function to log data in SFMC
async function logData(data = {}) {
  if (postDebug) console.log('logData called');
  const date = getDateTime();
  const logId = guid();
  const loggingUri = '/data/v1/async/dataextensions/key:' + logDe + '/rows';

  const row = {
    'items': [
      {
        'Id': logId,
        'DateTime': date.ISODateTime,
        'Message': (data.hasOwnProperty('message') ? data.message : JSON.stringify(data)),
        'MetaData': JSON.stringify(data)
      }
    ]
  };

  if (postDebug) console.log('(logData) loggingUrl: ' + loggingUri);
  if (postDebug) console.log('(logData) items: ');
  if (postDebug) console.table(row.items);

  return await postData(loggingUri, row)
    .then((postDataResponse) => {
      if (postDebug) console.log('(logData) response: ');
      if (postDebug) console.table(postDataResponse);
      console.log('Log data response:', postDataResponse);
      return postDataResponse;
    }).catch((error) => {
      return handleError('(logData) error: ' + error);
    });
}
// Function to log an error
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

  var logResponse = await postData(loggingUri,row)   
    .then(async (logResponse) => JSON.stringify(logResponse))
    .then((logResponse) => {
    if (postDebug){
      console.log('logError logResponse: ')
      console.table(logResponse)
      }
    return logResponse
    });  
  return logResponse;
}

async function writeData(targetDe,data={}){
  if (postDebug) console.log('writeData ('+targetDe+') called')
  let date = getDateTime();
  let logId = guid();
  let loggingUri = '/data/v1/async/dataextensions/key:'+targetDe+'/rows'

  let row = data
  
  if (postDebug) console.log('logData loggingUrl: '+loggingUri)
  if (postDebug) console.log('logData items: ')
  if (postDebug) console.table(row.items)

  var logResponse = await postData(loggingUri,row)   
    .then(async (logResponse) => JSON.stringify(logResponse))
    .then((logResponse) => {
    if (postDebug){
      console.log('logData logResponse: ')
      console.table(logResponse)
      }
    return logResponse
    });  
  return logResponse;
}

/**
 * 
 *  External API call engine
 * 
 * */

// refreshToken(data)
  // Purpose
  // Converts SFMC Rest auth response 
  // to internal properties
  // 
  // Input 
  // data = Response From getAccessToken
  //
  // Output accessToken
  // access_token = Token as provided by SFMC 
  // accessToken = "Bearer "+access_token
//
function refreshToken(data){
  // Response time
  let d = new Date();
  let time = d.getTime()

  if (data.hasOwnProperty('access_token')){
    access_token = data.access_token    
    accessToken = 'Bearer '+access_token
  }
  if (data.hasOwnProperty('rest_instance_url')){
    restDomain = data.rest_instance_url

    /* Isoltate domain parts */
    let domainSplit = restDomain.split('//')
    protocol = domainSplit[0]+'//'
    let dotSplit = domainSplit[1].split('.')
    subdomain = dotSplit[0]    
  }
  if (data.hasOwnProperty('auth_instance_url')){
    authDomain = data.auth_instance_url
  }
  if (data.hasOwnProperty('soap_instance_url')){
    soapDomain = data.soap_instance_url
  }
  if (data.hasOwnProperty('expires_in')){    
    // Caluclate new expiry time
    tokenExpiry = parseInt(time)+(parseInt(data.expires_in)*1000)
  }
  return accessToken
}

// tokenValid()
  // Purpose
  // Checks for token in system 
  // If token found, compare expiration date to current time
  // 
  // Input 
  // None
  //
  // Output
  // tokenValid = true/false
//
function tokenValid(){
  if (postDebug) console.log('Checking Token')
  if (accessToken == null){
      if (postDebug) console.log('No token to check')
      return false
  }else{
    let tokenValid = true
    let d = new Date();
    let time = d.getTime()
    console.log('Checking: (tokenExpiry) '+tokenExpiry)
    console.log('Checking: (time) '+time)

    if (tokenExpiry != null){
      tokenValid = (parseInt(tokenExpiry)>parseInt(time)) ? true : false
    }
    
    if (postDebug){
      console.log('Checking: token is valid? '+tokenValid)
    }
    //
    // If the expiry time is lower than 
    // the current time, the token is invalid
    return tokenValid
    }
}

// getAccessToken()
  // Input 
  // None
  // 
  // Output
  // refreshToken(requestResponse)
//
async function getAccessToken(){
  if (!tokenValid()){
    if (postDebug) console.log('Token expired: Requesting remote authentication')
    var authUrl = authDomain
    let authBody = {
      "grant_type": "client_credentials",
      "client_id": "xja05pcunay325cyg6odcyex",
      "client_secret": "b36KqpkMECP8T3h0j2nD81Ve",
      "account_id": "518006076"
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
      })
      .catch((error) => {
        // Broadcast error 
        if (postDebug) console.log('Backend auth error:'+JSON.stringify(error));
        return error;
      })
      .then(response => response.json())
      .then((authenticationResponse) => {  
        if (postDebug) console.log('Refreshing Authentication')
        accessToken = refreshToken(authenticationResponse)
        return accessToken
      });
      
      if (postDebug) console.log('Authentication requested')
      return authResponse;
  }else{
    if (postDebug) console.log('Token valid: Authentication cached: '+accessToken)
    return accessToken
  }
}

// getData(url = '', headers)
  // Input 
  // url = request url
  // headers = [] array of header to overwrite defaults
  //
  // Request Data from SFMC via REST
  //
  // Output 
  // JSON
//
async function getData(url = '', headers) {
  return await fetch(url, {
    method: 'GET', 
    mode: 'no-cors', 
    cache: 'no-cache', 
    credentials: 'omit', 
    headers: headers,
    redirect: 'follow', 
    referrerPolicy: 'no-referrer'
  })
    .then((response)=>{return fetchResponse(response)})
    .then((json)=>parseRestResponse((json)))
    .then((parsedResponse) => {
      // return response
      return parsedResponse; 
    }).catch((error) => {
      // return error
      return handleError(error);
    })  
}

// postData(url = '', postData=null)
  //
  // Specific header setup for
  // POSTing data to SFMC via REST
  //
  // Input 
  // url = Destination endpoint (restDomain prepended if missing)
  // postData = JSON Data to POST (Stringified at time of request)
  //
  // Output
  // success = fetchResponse(response)
  // failure = handleError(error)
  //
async function postData(url = '', postData=null) {
  console.log('(postData) starts')
  if (url != '' && postData != null){
    let accessToken = await getAccessToken()
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
      console.log('(postData) url: '+url)
      console.log('(postData) headers: ')
      console.table(headers)
      console.log('(postData) data: ')
      console.log(JSON.stringify(postData))
    }

    var fetchResult = await fetch(url, {
      method: 'POST', 
      headers: headers,
      body: JSON.stringify(postData)
      })
    .then((response)=>{
      if (postDebug) console.log('(postData) response: ')
      if (postDebug) console.table(response)
      return response.json()
    })
    .then((finalResponse)=>{
      if (postDebug) console.log('(postData) finalResponse: ')
      if (postDebug) console.log(JSON.stringify(finalResponse))
      return finalResponse
    })
    .catch((error) => {
      if (postDebug) console.log('(postData) error: ')
      if (postDebug) console.table(error)
      handleError(error);
      throw error;
    }); 

    console.log('(postData) Fetch Result: ')
    console.table(fetchResult)

    return fetchResult;
}else{
  console.log('(postData) missing input')
}
}

// soapRequest(soapEnv='')
  // Specific header setup for
  // POSTing data to SFMC via SOAP
  //
  // Input 
  // soapEnv = SOAP Envelope Describing Request
  //
  // Output
  // success = soapResponse(response)
  // failure = handleError(error)
  //
//
async function soapRequest(soapEnv=''){
  if (soapEnv==''){
    console.log('(soapRequest) No SOAP provided')
    return false;
  }else{
    if (postDebug==true) console.log('(soapRequest)')
  }

  // Setup headers
  let url = soapDomain
  let headers = {
    "Accept": "*/*",
    "Content-Type": 'application/soap+xml',
    "Authorization":access_token
  }

  // Setup call
  await getAccessToken().then(async ()=>{
    soapEnv = soapEnv.replace('{{access_token}}',access_token)
    soapEnv = soapEnv.replace('{{url}}',url)

    if (postDebug==true){
      console.log('(soapRequest) Url: '+url)
      console.log('(soapRequest) Token: '+access_token)
      console.log('(soapRequest) SOAP: '+soapEnv)
    }
    
    // Perform Call
    return await fetch(url, {method: 'POST', headers: headers, body: soapEnv})  
      //.then((response)=>{return fetchResponse(response)})   
      .then((response)=>{
        return parseSoapResponse(response)
    }).catch((error) => {
        let errorResponse = `(soapRequest) ${error}`
        return handleError(errorResponse);
    });   
  }); 
}

// postDataToPassCreator(url = '', postData=null)
  //
  // Input 
  // url = Destination endpoint
  // postData = JSON Data to POST (Stringified at time of request)
  //
  // Output
  // success = fetchResponse(response)
  // failure = outputhandleError(error)
  //
  //
  // Specific header setup for
  // POSTing data to PassCreator via postData() above
//
async function postDataToPassCreator(url = '', postData=null) {
  if (url != '' && postData != null){
    var headers = {
      "Accept": dataType,
      "Content-Type": dataType,
      "Authorization": postData.apiKey
    };

    console.log('(pDTPC) Input headers:');
    console.table(headers);

    console.log('(pDTPC) Input Data:');
    console.table(postData);

    try {
      const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'omit',
        headers: headers,
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(postData)
      });

      const finalResponse = await parseRestResponse(response);

      if (finalResponse.status === 200) {
        await logData({ 'message': 'Pass Update sent successfully: ' + postData.pushNotificationText });
      }

      return finalResponse;
    } catch (error) {
      let errorResponse = `(pDTPC) ${error}`;
      return handleError(errorResponse);
    }
  }
}


// handleError(error)
  // Purpose
  // Parse error from request
  //
  // Input 
  // error = error of fetch()
  //
  // Output JSON
  // errorResponse = {
  // 'requestDate':date.DateTime,
  // 'type':null,
  // 'body':explainError(error)
  // } 
//
function handleError(error) {
  var date = getDateTime();

  if (postDebug) {
    console.log('(handleError) Error:');
    console.table(error);
  }

  var errorResponse = {
    'requestDate': date.DateTime,
    'type': typeof error,
    'body': (typeof error !== 'string') ? JSON.stringify(error) : error
  };

  if (error.hasOwnProperty('status')) {
    errorResponse.status = error.status;
  }

  if (error.hasOwnProperty('cause') && error.cause.hasOwnProperty('code')) {
    var errorDetails = explainError(error);
    errorResponse.body = errorDetails.body;
    errorResponse.status = errorDetails.status;
  }

  return errorResponse;
}



// explainError(error)
  // Purpose
  // Parse response from SFMC via SOAP
  //
  // Input 
  // result = result of soapRequest()
  //
  // Output JSON
  // errorResponse = {
  // 'requestDate':date.DateTime,
  // 'type':null,
  // 'body':explainError(error)
  // } 
//
function explainError(error){
  let errorCause = null
  if (error.hasOwnProperty('cause')){
    errorCause = error.cause
  }else{
    errorCause = error
  }  

  let errorStatus = null
  if (errorCause.hasOwnProperty('errno')){ 
      errorStatus = error.errno
  }else{    
      errorStatus = '0'    
  }
  
  let errorReason = 'Unrecognised Error'
  if (errorCause != null){
    switch(errorCause.code){
      case 'ENOTFOUND':
        errorReason = 'The requested item could not be found'
        break;      
    }
  }
  return {body:errorReason,status:errorStatus};
}

// parseRestResponse(result)
  // Purpose
  // Parse response from SFMC via Rest
  //
  // Input 
  // result = result of fetch()
  //
  // Output 
  // messageResponse = {
  // 'requestDate':date.DateTime,
  // 'status':null,
  // 'body':null
  // } 
//
function parseRestResponse(result) {
  var date = getDateTime();

  var messageResponse = {
    'requestDate': date.DateTime,
    'body': null
  };

  if (result.hasOwnProperty('status')) {
    messageResponse.status = result.status;
  } else {
    messageResponse.status = 200;
  }

  if (result.hasOwnProperty('errorcode')) {
    if (result.hasOwnProperty('message')) {
      messageResponse.body = result.message;
    }
    if (result.hasOwnProperty('errorcode')) {
      messageResponse.status = result.errorcode;
    }

    var response = isJson(messageResponse) ? JSON.stringify(messageResponse) : messageResponse;

    console.log('(parseRestResponse) Response: ' + JSON.stringify(response));
    return response;
  } else {
    messageResponse.body = result;
    console.log('(parseRestResponse) Response: ' + JSON.stringify(messageResponse));
    return messageResponse;
  }
}


// parseSoapResponse(result)
  // Purpose
  // Parse response from SFMC via SOAP
  //
  // Input 
  // result = result of soapRequest()
  //
  // Output 
  // messageResponse = {
  // 'requestDate':date.DateTime,
  // 'status':null,
  // 'body':null
  // } 
//
function parseSoapResponse(result) {  
  // Announce 
  if (postDebug){    
    console.log('(parseSoapResponse) input:')
    console.table(result)
    }  

  let xml = new jsdom.JSDOM(result)
  console.log('(parseSoapResponse) Response  => JSON: ')
  console.table(xml)
  
  let soapResult = {}
  if (soapResult.hasOwnProperty('StatusMessage')){
      soapResult = xml.CreateResponse.Results
  }

  // Response time
  var date = getDateTime();
  
  //
  // Construct Standardised Response
  //
  var messageResponse = {
    'requestDate':date.DateTime,
    'status':null,
    'body':null
  }    
  
  
  /* StatusMessage Handling */
  if (soapResult.hasOwnProperty('StatusMessage')){
    console.log('parseSoapResponse StatusMessage')
    messageResponse.body = soapResult.StatusMessage
  }
    
    /* Standard Response Handling */
  if (soapResult.hasOwnProperty('StatusCode')){
    console.log('parseSoapResponse StatusCode')
    messageResponse.status = soapResult.StatusCode
  }else{
    messageResponse.status = 'Unknown'
  }
  
  // Announce 
  if (postDebug){    
    console.log('(parseSoapResponse) output:')
    console.table(messageResponse)
    }  

  //  Return standardised messageResponse
  return messageResponse
  
}

//
// Listen for Connections on configured Port
//
app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
  console.log('localhost: '+isLocalhost)
});