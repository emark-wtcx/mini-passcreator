const express = require('express');
const app = express();
const path = require('path');
const fetchResponse = response => {
  if (!response.ok) { 
     throw Error(response.statusText);
  } else {
     return response.json();
  }
};

var configDe = 'passCreator_configuration'
var logDe = 'passcreator_success_log'
var errorDe = 'passcreator_error_log'

var testUrl = 'https://eo2mifqm9yelk7e.m.pipedream.net'
var testUrl = '/execute'
var testUrl = 'https://app.passcreator.com/api/pass/f2235798-6df8-4c85-97b3-a8b0ce26351a/sendpushnotification'

var protocol = 'https://'
var subdomain = 'mc3tb2-hmmbngz-85h36g8xz1b4m'

var isLocalhost = null

var HOME_DIR = '/';
var postDebug = true
var dataType = 'application/json'

/* Auth domain for REST */
// Raw properties
var access_token,accessToken,tokenExpiry,MID = null

// Token Domain
var tokenUrl = '/v2/token'
var authDomain = protocol+subdomain+'.auth.marketingcloudapis.com'+tokenUrl 

/* REST domain */
var restDomain = protocol+subdomain+'.rest.marketingcloudapis.com'
/* SOAP domain */
var soapDomain = protocol+subdomain+'.soap.marketingcloudapis.com/Service.asmx'

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
  if (req.body.customerKey != null){
    let getde = await getDataExtension(req.body.customerKey).then((getServerResponse) => {
    return res.json(getServerResponse)
    })
    return getde
  }else{
    return {'message':'No data submitted'}
  }
})

/**
 * Route to install config table
 */
app.post('/install',async function (req, res, next) { 
  if (postDebug) console.log('/install route called ') 
  if (req != null && typeof req !== 'undefined'){
    let soap = null
    if (req.hasOwnProperty('body')){
      soap = req.body
    }else{
      soap = req
    }

    if (soap == null){
      console.log('/install route No SOAP received')
      console.table(req.toString())
      return false
    }else{
      soap = req.body.soap
      console.log('/install route SOAP received: '+soap)
    }
    /*
    return soapResponse = await soapRequest(soap)
      .then((getSoapResponse) => {
        let jsonResponse = res.send(getSoapResponse)
        return jsonResponse
        }).catch((error)=>{ 
          console.log('/install route error')         
          console.table(error)
          return false
        });    
        */   
  }else{
    return {'message':'No data submitted'}
  }
})

/**
 * Route to install config table
 */
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

/**
 * Route to Write data to the log 
 */
app.post('/log',async function (req, res, next) { 
  if (postDebug) console.log('(/log) called') 
  if (req != null){
    return await logData(req.body)
      .then((logResponse) => {
        if (postDebug) console.log('(/log) Response: ')
        if (postDebug) console.table(logResponse)
        return res.send(logResponse)
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
 * Send a mock payload to the test endpoint 
 */
app.post('/testmessage',async function (req, res, next) { 
  if (postDebug) console.log('/testmessage called ')
  if (req.body != null){
    await postMessage(req.body).then((serverResponse) => {
      if (postDebug) console.log('/testmessage Response: ')
      if (postDebug) console.table(serverResponse)
      return serverResponse
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
/**
 * Set the details from Journey Builder 
 */
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
    "token":messageData.token,
    "authUrl":messageData.authUrl,
    "restUrl":messageData.restUrl,
    "apiKey":messageData.apiKey
  }
  if (postDebug){
    console.log('(postMessage) bodyContent: ')
    console.table(bodyContent)
    }


  /**
   * Transmit Message via postDataToPassCreator function
   */
  let postResponse = await postDataToPassCreator(messageData.endpoint, bodyContent)
    .then((dataResponse) => {
      //
      //  Build response 
      //
      var messageResponse = {
        'requestDate':date.DateTime,
        'requestData':bodyContent,
        'messageData':JSON.stringify(dataResponse)
      }
      //
      // Add call status if available
      //
      if (dataResponse && dataResponse.hasOwnProperty('status')){
        messageResponse.status = dataResponse.status
      }

      if (postDebug){
        console.log('(postMessage)=>(pDTPC) messageResponse:',messageResponse); 
        console.table(messageResponse);
      }
      return messageResponse
    });
  return postResponse
}

async function getDataExtension(customerKey){
  // Request setup
  var data = {}
  data.url = restDomain+'/data/v1/customobjectdata/key/'+customerKey+'/rowset/'

  // Request content
  if (postDebug){
    console.log('getDataExtension Table by CustomerKey: ')    
    console.table(customerKey)
  }
  
  // Perform Request
  var accessToken = await getAccessToken();
  if (postDebug){
    console.log('getDataExtension accessToken: ')
    console.table(accessToken)
  }

  /* Get DE Headers */
  let restHeaders = {
    "Accept": dataType,
    "Content-Type": dataType,
    "Authorization":accessToken
  }
  if (postDebug){
    console.log('getDataExtension Headers: ')
    console.table(restHeaders)
    console.log('getDataExtension Endpoint: '+data.url)
  }

  //
  // Request Data via getData function
  //
  var getDataResponse = await getData(data.url,restHeaders)
    .then((dataResponse) => {
      //
      // Return result
      //
      return dataResponse        
    }).catch((error) => {
      console.log('getDataExtension Error:'+JSON.stringify(error))
      //logError(error)
      return JSON.stringify(error)
    });

  if (postDebug){
    console.log('getDataExtension getDataResponse: ')
    console.table(getDataResponse)
    }

  //
  // Return response  
  //
  return getDataResponse; 
}
async function writeConfigData(data={}){
  if (postDebug) console.log('logData called')
  let date = getDateTime();
  let logId = guid();
  let loggingUri = 'data/v1/async/dataextensions/key:'+configDe+'/rows'

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

  let response = await postData(loggingUri,row)   
    .then(async (response) => JSON.stringify(response))
    .then((response) => {
    if (postDebug){
      console.log('writeConfigData response: ')
      console.table(response)
      }
    return response
    });  
  return response;
}
async function logData(data={}){
  if (postDebug) console.log('logData called')
  let date = getDateTime();
  let logId = guid();
  let loggingUri = 'data/v1/async/dataextensions/key:'+logDe+'/rows'

  let row = {'items':[
    {
      'Id':logId,
      'DateTime':date.ISODateTime,
      'Message':(data.hasOwnProperty('message') ? data.message : JSON.stringify(data)),
      'MetaData':JSON.stringify(data)
    }
    ]
  }
  
  if (postDebug) console.log('logData loggingUrl: '+loggingUri)
  if (postDebug) console.log('logData items: ')
  if (postDebug) console.table(row.items)

  return await postData(loggingUri,row)   
    .then((postDataResponse)=>{
      return postDataResponse
    });
}
async function logError(message,data={}){
  let loggingUri = 'data/v1/async/dataextensions/key:'+errorDe+'/rows'
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
  let loggingUri = 'data/v1/async/dataextensions/key:'+targetDe+'/rows'

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
 *  External API call engines
 * 
 * */

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

function tokenValid(){
  if (postDebug) console.log('Checking Token')
  if (accessToken == null
    || tokenExpiry == null){
      if (postDebug) console.log('No token to check')
      return false
  }else{
    let d = new Date();
    let time = d.getTime()
    console.log('Checking: (tokenExpiry) '+tokenExpiry)
    console.log('Checking: (time) '+time)
    let tokenValid = (accessToken != null && parseInt(tokenExpiry)>parseInt(time)) ? true : false
    if (postDebug){
      console.log('Checking: token is valid? '+tokenValid)
    }
    //
    // If the expiry time is lower than 
    // the current time, the token is invalid
    return tokenValid
    }
}

/**
 * SFMC Communication
 */
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
      }).catch((error) => {
        // Broadcast error 
        if (postDebug) console.log('Backend auth error:'+JSON.stringify(error));
        return error;
      }).then(response => response.json())
      .then((authenticationResponse) => {  
        if (postDebug) console.log('Refreshing Authentication')
        accessToken = refreshToken(authenticationResponse)
        return accessToken
      })
    if (postDebug) console.log('Authentication requested')
    return authResponse
  }else{
    if (postDebug) console.log('Token valid: Authentication cached: '+accessToken)
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
  }).then(response => response.json())
    .then((jsonResponse)=>parseHttpResponse((jsonResponse)))
    .then((httpResponse) => {
      // return response
      return httpResponse; 
    }).catch((error) => {
      // return error
      return handleError(error);
    })
  return getResponse;
}
/**
 * Specific header setup for
 * POSTing data to SFMC via REST
 */
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
          console.log('(postData) url: '+url)
          console.log('(postData) headers: ')
          console.table(headers)
          console.log('(postData) data: ')
          console.log(JSON.stringify(postData))
        }

        return await fetch(url, {
            method: 'POST', 
            headers: headers,
            body: JSON.stringify(postData)
            })
          .then((response)=>{return fetchResponse(response)})
          .then((finalResponse)=>{return finalResponse})
          .catch((error) => {
              return handleError(error);
            });  
      }
    );    
    return postResponse; // collect & return response
  }
}

/**
 * Specific header setup for
 * POSTing data to SFMC via SOAP
 */
async function soapRequest(soapEnv=''){
  if (postDebug==false) console.log('(soapRequest)')
  if (soapEnv==null || soapEnv=='' || soapEnv=={}){
    console.log('(soapRequest) No SOAP provided')
    return false;
  }else{
    console.log('(soapRequest) SOAP provided')
  }
  // Setup call
  let accessToken = await getAccessToken();
  soapEnv = soapEnv.replace('{{access_token}}',access_token)
  soapEnv = soapEnv.replace('{{url}}',soapDomain)

  let url = soapDomain
  let headers = {
    "Accept": "*/*",
    "Content-Type": 'application/soap+xml',
    "Authorization":accessToken
  }
  if (postDebug){
    console.log('(soapRequest) url:'+url)
    console.log('(soapRequest) headers: '+JSON.stringify(headers))
    console.log('(soapRequest) soapEnv: '+soapEnv)
  }
  
  /**
   *  Testing 
   **/
  // Perform Call
  let soapRequest = await fetch(url, {
    method: 'POST', 
    headers: headers,
    body: soapEnv
    })  
    .then((xmlResponse)=> {
      let parser = new DOMParser();
      let xml = parser.parseFromString(xmlResponse, "application/xml");
      return xml
    })  
    .then((soapResponse)=>parseSoapResponse(soapResponse))
    .then((parsedResponse) => {
      if (postDebug) {
        console.log('(soapRequest) Backend parsedResponse:'+parsedResponse);   
        if (parsedResponse.hasOwnProperty('soap')){
        console.log('(soapRequest) Backend parsedResponse.soap:'+parsedResponse.soap);   
        }
        
        let responseString = parsedResponse
        console.log('(soapRequest) Backend responseString:'+responseString);           
      }
      return parsedResponse; // return response
    }).catch((error) => {
      let errorResponse = `Error: ${error}`
      return handleError(errorResponse);
  });  
return soapRequest;
    
}

/**
 * Specific header setup for
 * POSTing data to PassCreator
 */
async function postDataToPassCreator(url = '', postData=null) {
  if (url != '' && postData != null){
    //
    // Set Custom Headers 
    //
    var headers = {
      "Accept": dataType,
      "Content-Type": dataType,
      "Authorization":postData.apiKey
    }

    console.log('(pDTPC) Input headers:')
    console.table(headers)
    
    console.log('(pDTPC) Input Data:')
    console.table(postData)
    //
    // Perform API Call
    //
    var postResponse = await fetch(url, {
      method: 'POST', 
      mode: 'no-cors', 
      cache: 'no-cache', 
      credentials: 'omit', 
      headers: headers,
      redirect: 'follow', 
      referrerPolicy: 'no-referrer', 
      body: JSON.stringify(postData) 
    })// Parse Response
    .then(fetchResponse)
    .then((finalResponse)=>{return finalResponse})
    // Announce and log response
    .catch((error) => {
      // Broadcast error 
      if (postDebug) console.log('Backend error:'+JSON.stringify(error));
      return error;
    });
    return postResponse; // return response
  }
}


function handleError(error){  
  // Response time
  var date = getDateTime();

  if (postDebug) console.log('(handleError) Error:');
  console.table(error)
  //
  // Construct Standardised Response
  //
  var errorResponse = {
    'requestDate':date.DateTime,
    'type':typeof error,
    'body':(typeof error !== 'string') ? JSON.stringify(error) : error
  }  
  // Append Error Status (if defined)
  errorResponse.status = (error.hasOwnProperty('status') ? error.status:null)
  
  return errorResponse
}
function parseHttpResponse(result) {  
  // Announce and log result
  if (postDebug){    
    console.log('(parseHttpResponse) Input result:'+JSON.stringify(result))
    }    

  // Response time
  var date = getDateTime();
  
  //
  // Construct Standardised Response
  //
  var messageResponse = {
    'requestDate':date.DateTime,
    'body':null
  }      
  
  if (result.hasOwnProperty('status')){
    messageResponse.status = result.status
  }else{
    if (result.hasOwnProperty('ok')){
      messageResponse.status = 200
    }else{
      messageResponse.status = 202
    }
  }
  if (result.hasOwnProperty('errorcode')){
    if (result.hasOwnProperty('message')){
        messageResponse.body = result.message
      }
    if (result.hasOwnProperty('errorcode')){
        messageResponse.status = result.errorcode
        }
    return messageResponse
  }else{
    messageResponse.body = result
    return messageResponse
  }  
}
function parseSoapResponse(result) {  
  // Announce and log result
  if (postDebug){    
    console.log('parseSoapResponse result:'+JSON.stringify(result))
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
  
  /* Error Response Handling */
  if (result.hasOwnProperty('body')
    && result.body.hasOwnProperty('resultMessages')
    && result.body.resultMessages.hasOwnProperty('resultClass')
    && result.body.resultMessages.resultClass == 'Error'){
    console.log('parseSoapResponse Error Response')
    let messageResponse = {
      'requestDate':date.DateTime,
      'status':result.body.resultCode,
      'body':result.body.resultMessages.message
    }  
    return messageResponse
  }else{
    console.log('parseSoapResponse Standard Response')
    /* Standard Response Handling */
    if (result.hasOwnProperty('status')){
      messageResponse.status = result.status
    }else{
      messageResponse.status = 200
    }
    if (result.hasOwnProperty('errorcode')){
      if (result.hasOwnProperty('message')){
          messageResponse.body = result.message
        }
      if (result.hasOwnProperty('errorcode')){
          messageResponse.status = result.errorcode
          }
      return messageResponse
    }else{
      messageResponse.body = result
      return messageResponse
    }  
  }
}
app.listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
  console.log('localhost: '+isLocalhost)
});