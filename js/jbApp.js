const connection = new Postmonger.Session();
/**
 * Create a new connection for this session.
 */
/**
 * Show Console Output?
 */
const debug = true;
const br = "\n"
const jbApp = { 
    version:2.0,
    configurationTable:'passCreator_configuration',
    configTable:null,
    configExists:null,
    configReady:false,
    apiKey:null,
    isTest:false, 
    isLocalhost:(location.hostname === 'localhost' || location.hostname === '127.0.0.1'),
    getSchema:true,
    getTokens:true,
    getEndpoints:true,
    getInteractions:false,
    token:null,
    passId:null,
    passUrl:'https://app.passcreator.com/api/pass/{passId}/sendpushnotification',
    currentStep:0,
    pageHtml:'',
    deStructure:{},
    message:'',
    action:null,
    dataExtension:null,
    system:{
        subscriber:{
            'firstname':'{{Contact.Attribute."Email Demographics".Firstname}}',
            'lastname':'{{Contact.Attribute."Email Demographics".Lastname}}',
            'email':'{{Contact.Attribute."Email Demographics".Email}}'
        },
        messages:{
            'firstname':'This is message 1: {firstname}',
            'lastname':'This is message 2: {lastname}',
            'email':'This is message 3: {email}'
        }
    },
    endpoints:{        
        "jbMiddleware":"https://eoya8wjvw5vh5ff.m.pipedream.net",
        "jbTest":"https://eo2mifqm9yelk7e.m.pipedream.net",
        "execute":"https://real-puce-raven-yoke.cyclic.app/execute",
        "publish": "https://eon2nxjzthbdt2w.m.pipedream.net",
        "validate": "https://eoxsr92hcso0n3h.m.pipedream.net",
        "stop": "https://eoot1xooh8qwfa8.m.pipedream.net"
    },
    steps:[
        {
          "label": "Select Type",
          "key": 'select'
        },
        {
          "label": "Configure Message",
          "key": 'configure'
        },
        {
          "label": "Confirm",
          "key": 'confirm'
        },
      ], 

/**
 * Core & Front End Functionality
 */
    guid:function() { 
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
    },
    getPassEndpoint:function(){
        if (debug) console.log('getPassEndpoint triggered')
        // Get starter URL based on isTest setting of app
        var endpoint = jbApp.passUrl;
        
        if (jbApp.passId != null){
            endpoint = endpoint.replace('{passId}',jbApp.passId)
        }
        return endpoint;
    },
    setPassId:function(id){
        jbApp.passId = '{{'+id+'}}';
    },
    getCurrentStep:function(){
        return jbApp.currentStep
    },
    getSteps:function(activeStep){   
        let returnSteps = []     
        if (jbApp.hasOwnProperty('steps') && jbApp.steps.length > 0){
            for (let i in jbApp.steps){
                let stepObject = jbApp.steps[i]
                if (activeStep-1 == i){
                    stepObject.active=true
                }
                returnSteps.push(stepObject)
            }
        }
        return returnSteps
    },
    bindMenu:function(connection){
        if (debug) console.log('Binding menu')

        // Bind menu actions        
        $('.pass_action').each(function() {
            let elem = $( this )
            
            /**
             * Presume we'll be changing the page
             */
            let refreshPage=true;

            /**
             * Isolate the required action
             */
            let action = $(this).data('action');
            jbApp.action = action

            /**
             * Bind the requested action
             */
            switch(jbApp.action){

                case 'showStep':
                    $(elem).on('click',function(){
                        // No page refresh required
                        refreshPage=false   
                        
                        // Prepare action changes
                        jbApp.getCurrentStep()

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked showStep:'+jbApp.currentStep)
                    });                
                    if (debug) console.log('Bound '+action) 
                break
    
                case 'inputMessage':
                    $(elem).on('click',function(){  
                        // Accounce Click
                        if (debug) console.log('clicked inputMessage')

                        // Prepare action changes
                        jbApp.inputMessageButtonAction()
                        })
                    if (debug) console.log('Bound '+action)
                break;
    
                case 'selectMessage':
                    $(elem).on('click',function(){
                        // Prepare action changes
                        jbApp.selectMessageButtonAction()

                        // Execute Action
                        //jbApp.processPageChange(refreshPage)
                        jbApp.buildMessageOptions()
                        
                        // Accounce Click
                        if (debug) console.log('clicked selectMessage')
                        /**
                         * Bind dynamic elements
                         */
                        })
                    if (debug) console.log('Bound '+action)
                break;
    
                case 'previewMessage':
                    $(elem).on('click',function(){
                        // Prepare action changes                        
                        jbApp.previewMessageButtonAction()
                    });
                    if (debug) console.log('Bound '+action)
                break;
    
                case 'previewSelectMessage':
                    $(elem).on('click',function(){                        
                        // Prepare action changes
                        jbApp.previewSelectMessageButtonAction()
                    });
                    if (debug) console.log('Bound '+action)
                break;
    
                case 'showMessages':
                    $(elem).on('click',function(){                        
                        // Prepare action changes
                        jbApp.showMessages()
                    });
                    if (debug) console.log('Bound '+action)
                break;
                
                case 'home':
                    $(elem).on('click',function(){
                        // Prepare action changes
                        jbApp.homeButtonAction()
                        
                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        })
                    if (debug) console.log('Bound '+action)
                break;
                
                case 'settings':
                    $(elem).on('click',function(){
                        // Prepare action changes
                        jbApp.settingsButtonAction()
                        
                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        })
                    if (debug) console.log('Bound '+action)
                break;
            }   
    
        }); 
    },
    async processPageChange(refreshPage){
        /** 
         * Process any page changes
         */
        if (refreshPage==true
        && jbApp.hasOwnProperty('pageHtml')
        && jbApp.pageHtml != undefined
        && jbApp.pageHtml.length
        ){
            if(debug) console.log('processPageChange|main:'+jbApp.pageHtml) 
            $('#main').html(jbApp.pageHtml);    
            if(debug) console.log('processPageChange: refresh done')

            /**
             * After updating, enhance html if needed
             */
            if (jbApp.action == 'selectMessage'){
                jbApp.buildMessageOptions()
            }   
            if ($('#apiKeyDisplay')){
                await jbApp.getApiKey().then((apiKey)=>{                
                    if (apiKey != null){
                        $('#apiKeyDisplay').html(apiKey)
                    }else{
                        $('#apiKeyDisplay').html('apiKey not found')
                    }
                });
            }
        }else{            
            if(debug) console.log('processPageChange: refresh false')
        }   
    },
    showMessages:function(){
        if (debug) console.log('showMessages() called')
        $.when(jbApp.getMessageOptions()).then(function(messages){

            // Format any message display
            if (messages.toString().length > 0){
                if (debug) console.log('showMessages() got messages')
                var messageOutput = '<Br /><p><span class="slds-text-heading_small">Available Messages</span><ul>'

                for (key in messages){
                    var message = messages[key]
                    var output = '<li><strong>'+key+'</strong>: '+message+'</li>'
                    messageOutput += output
                }

                messageOutput += '</ul></p>'

            }else{
                if (debug) console.log('showMessages() No messages found ('+messages.length+') : '+JSON.stringify(messages))
                var messageOutput = 'No messages loaded'
            }

            // Ensure we have somewhere to place the messages
            if ($('#available_messages').length == 0){
                $('#main').append('<div id="available_messages"></div>')
            }

            // Place the messages
            $('#available_messages').html(messageOutput)

            $('#showMessages')
                .attr('onClick',"jbApp.closeMessages()")
                .attr('data-action',"closeMessages")
                .text('Close messages')
        });        
    },
    closeMessages:function(){
        $('#available_messages').html('')
        $('#showMessages')
                .attr('onClick',"jbApp.showMessages()")
                .attr('data-action',"showMessages")
                .text('Show messages')
    },
    saveConfigButtonAction:async function(){
        let apiKey = $('#apiKey').val();
        if (apiKey.length == 80){
            jbApp.apiKey = apiKey
            //
            // Build configuration
            //
            var configTableXml = null
            if (!jbApp.configExists){
                var configTableXml = await jbApp.buildConfigXml()
            }

            //
            // Save config
            //
            var saveData = {'apiKey':jbApp.apiKey}
            let saveConfig = null
            saveConfig = await jbApp.callBackend('/saveConfig',saveData)
            if (!saveConfig){
                console.log('APIKey install failed:'+JSON.stringify(saveConfig))
            }else{    
                console.log('APIKey install success:'+JSON.stringify(saveConfig))
                if (saveConfig.hasOwnProperty('status')){
                    if (saveConfig.status == 200){
                        return true;
                    }else{
                        return false
                    }            
                }else{
                    console.log('APIKey install unrecognised response')
                    return false
                }
            }
            //
            // Redirect to home 
            // 
            jbApp.homeButtonAction()
            return configTableXml.toString();
        }else{
            alert('The API key should be 80 characters')
            $('#apiKey').addClass('slds-has-error')
        }
    },
    homeButtonAction:function(){
        jbApp.pageHtml = jbApp.getHtml('home')
        $('#jbapp__nav_home').text('Home').data('action','home')        
        jbApp.setProgress(0)
        jbApp.currentStep = 0
        if (jbApp.isLocalhost != true) {
            //connection.trigger('updateSteps', jbApp.getSteps(1));            
            connection.trigger('prevStep')
            if (debug) console.log('Step: 1')
        }else{            
            if (debug) console.log('Local Step: 1')
        }
    },
    settingsButtonAction:function(){
        jbApp.pageHtml = jbApp.getHtml('config')
        $('#jbapp__nav_home').text('Back').data('action','home')        
        jbApp.setProgress(0)
        jbApp.currentStep = 0
    },
    inputMessageButtonAction:function(){
        // Setup the required HTML
        jbApp.getHtml('inputMessage',1)

        // Update visual/internal steps
        jbApp.currentStep = 1
        jbApp.setProgress(33)   

        // Update UI Buttons                      
        $('#jbapp__nav_home').html('Cancel').data('action','home') 

        /**
         * Only process action if we 
         * are on the correct starting step
         */
        if(jbApp.currentStep < 1) {   
 
            // Running in JB
            if (jbApp.isLocalhost != true) {
                // Update JB Steps
                connection.trigger('nextStep')
            }
  

        }else{            
            if (debug) console.log('Local Step: '+jbApp.currentStep)
        }
    },
    selectMessageButtonAction:function(){        
        jbApp.html = jbApp.getHtml('selectMessage',1)
    
        $('#jbapp__nav_home').html('Cancel').data('action','home')
        jbApp.currentStep = 1
        jbApp.setProgress(33)

        // Only update the JB steps if we 
        // are on the correct starting step
        if(jbApp.currentStep < 1) {            
            if (jbApp.isLocalhost != true) {
                // Update JB Steps
                connection.trigger('nextStep')
            }          
        }else{            
            if (debug) console.log('Local Step: 2')
        }
    },
    previewMessageButtonAction:function(){
        if (debug) console.log('previewMessageButtonAction start')
        
        let ribbonVisible = false

        if ($('#notification_ribbon').length>0){
            ribbonVisible = true
        }    

        if (debug) console.log('ribbonVisible: '+ribbonVisible)

        if (ribbonVisible == false){  
            // Show ribbon            
            $.when(jbApp.getHtml('ribbon',false)).then(function(ribbon){
                if (debug) console.log('Appending ribbon: '+jbApp.pageHtml)
                // Place ribbon
                $('#main').append(jbApp.pageHtml);
                
                // Transfer Message
                jbApp.transferMessage()
        
                // Make sure we can close the ribbon after presenting it
                jbApp.bindRibbonClose()
        
                // Update UI on progress
                jbApp.setProgress(66)
   
            });        
        }else{
            jbApp.transferMessage()
        }   
        
        // Only update the JB steps if we 
        // are on the correct starting step
        if(jbApp.currentStep == 1) {            
            if (jbApp.isLocalhost != true) {
                // Update JB Steps
                connection.trigger('nextStep')
            }          
        }else{            
            if (debug) console.log('Local Step: 2')
        }
    },
    previewSelectMessageButtonAction:function(){
        if (debug) console.log('!previewSelectMessageButtonAction!')

        let blockVisible = false
        if ($('#notification_ribbon').length>0){
            let blockVisible = true
        }    
        if (debug) console.log('blockVisible: '+blockVisible)

        if (blockVisible == false){  
            $.when(jbApp.getHtml('ribbon',false)).then(function(ribbon){
                if (debug) console.log('Appending ribbon: '+jbApp.pageHtml)
                // Place ribbon
                $('#main').append(jbApp.pageHtml);
            
                // Transfer Message
                jbApp.selectMessage()
        
                // Make sure we can close the ribbon after presenting it
                jbApp.bindRibbonClose()
        
                // Update UI on progress
                jbApp.setProgress(66)
            });
        }else{
            // Transfer Message
            jbApp.selectMessage()
            jbApp.transferMessage()
        }

        // Only update the JB steps if we 
        // are on the correct starting step
        if(jbApp.currentStep == 1) {        
            if (jbApp.isLocalhost != true) {
                // Update JB Steps
                connection.trigger('nextStep')
            }          
        }else{            
            if (debug) console.log('Local Step: 2')
        }
        jbApp.currentStep = 2    
    },
    confirmMessage:function(){
        jbApp.setUiControls()
        if(jbApp.currentStep < 3) {
            jbApp.currentStep = 3          
            if (jbApp.isLocalhost != true) {
                // Update JB Steps
                connection.trigger('nextStep')
            } 
            // Update UI on progress
            jbApp.setProgress(99)      
        }
        jbApp.closeRibbon()
    },
    setUiControls:function(){          
        if ($('#modal_message').html() != ''){    
            // Configured  
            if (jbApp.isLocalhost == false){     
                // Production         
                connection.trigger('updateButton', { button: 'done', text: 'done', visible: true, enabled:true }); 
                if (debug) console.log('Enabled production button')
                $('#done').text('Done').prop('disabled',false)                
            }else{   
                // Development        
                $('#done').text('Done').prop('disabled',false)   
                if (debug) console.log('Enabled development button') 
            }
        }else{ 
            // Not Configured, Cancel
            if (jbApp.isLocalhost == false){
                // Production        
                connection.trigger('updateButton', { button: 'done', text: 'done', visible: true, enabled:false });
                if (debug) console.log('Disabled production button')  
                $('#done').text('Done').prop('disabled',true)                
            }else{   
                // Development      
                $('#done').text('Done').prop('disabled',true)   
                if (debug) console.log('Disabled development button')   
            }
        }
    },
    transferMessage:function(){            
        /**
         * Get the message
         */
        let previewMessage = $('#pass_message').val()
    
        /**
         * Check we have the data to parse 
         */
        if (jbApp.hasOwnProperty('system') 
        && jbApp.system.hasOwnProperty('subscriber')
        && previewMessage != undefined){
            if (debug) console.log('Checking data: '+JSON.stringify(jbApp.system.subscriber))
            
            /**
             * Loop through the attributes
             */
            for (let key in jbApp.system.subscriber){
                if (debug) console.log('Checking key ('+key+')')
                let value = jbApp.system.subscriber[key]
                let keyTag = '{'+key+'}'
                if (debug) console.log('Value: '+value)
                previewMessage = previewMessage.replaceAll(keyTag, value)
            }
        }

        /**
         * Place Message 
         */
        if (debug) console.log('Placing message: '+previewMessage)
        $('#modal_message').html(previewMessage)
        jbApp.message = previewMessage
    },
    selectMessage:function(){
        /**
         * Check we have the jbApp 
         */
        if (debug) console.log('jbApp:')
        if (debug) console.table(jbApp)
            
        /**
         * Get the message choice
         */
        let selectedMessage = $('#messageSelector option:selected').val()    
        if (debug) console.log('selectedMessage:' + selectedMessage)
    
        /**
         * Check we have the data to parse 
         */
        let messages = jbApp.getMessageOptions()
        if (selectedMessage.length > -1 && messages.toString().length > 0){
            var previewMessage = messages[selectedMessage]
            if (debug) console.log('Selected Message: '+previewMessage)
            
            /**
             * Loop through the attributes
             */
            for (let key in jbApp.system.subscriber){
                if (debug) console.log('Checking key ('+key+')')
                let value = jbApp.system.subscriber[key]
                let keyTag = '{'+key+'}'
                if (debug) console.log('Value: '+value)
                previewMessage = previewMessage.replaceAll(keyTag, value)
            }
        }

        /**
         * Place Message 
         */
        if (debug) console.log('Placing selected message: '+previewMessage)
        $('#modal_message').html(previewMessage)
        jbApp.message = previewMessage
    },
    getMessageOptions:function(){
        if (!jbApp.isLocalhost){
            return jbApp.deStructure
        }else{
            return jbApp.system.messages
        }
    },
    buildMessageOptions:function(){
        let messages = jbApp.getMessageOptions()
        if (debug) console.log('Messages:')
        if (debug) console.table(messages)
        
        if (messages.toString().length>0){
            $('#messageSelector').empty()
            let count = 0
            if (debug) console.log('We have Messages:')
            for (let i in messages){
                if (debug) console.log('Message#:'+i)
                count++
                let message = messages[i]
                if (debug) console.log('Message:'+message)
                if (message != '' && message.length>0){
                    let option = '<option value="'+i+'">'+count+': '+i+'</option>'
                    $('#messageSelector').append(option)
                }
            }
        }else{
            if (debug) console.log('We have no Messages')
        }
    },
    closeRibbon:function(){    
        if (debug) console.log('remove ribbon') 
        $('.slds-notify_container').remove()
    },
    bindRibbonClose:function(){
        if (debug) console.log('bind modal close')
        $('.slds-notify__close button').on('click',function(){
            jbApp.closeRibbon()
        });
    },
    setProgress:function(amount){
        if (debug) console.log('Setting progress: '+amount)
        let html = '<div class="slds-progress-bar" id="progress-bar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+(100-amount)+'" aria-label="{{Placeholder for description of progress bar}}" role="progressbar">'
        html += '    <span class="slds-progress-bar__value" id="progress-val" style="width:'+amount+'%">'
        html += '        <span class="slds-assistive-text" id="progress-text">Progress: '+amount+'%</span>'
        html += '    </span>'
        html += '</div>'
        $( '#progress-holder' ).html(html)
    },    
    getHtml:async function(page,refreshPage = true){
        //
        // Announce request 
        //
        if (debug) console.log('(getHtml) Looking for: '+page)
        
        //
        // Map page names to file names
        //
        let html={
            home:'home',
            error:'error',
            inputMessage:'input_message',
            selectMessage:'select_message',
            ribbon:'ribbon',
            config:'config',
            nav:'nav'
        }
        
        //
        // Require API Key
        //
        if (!jbApp.configReady && html[page] != 'nav'){
            page = 'config'
            refreshPage = true
        }else{
            //
            // Serve Error if mapping not defined
            //
            if (page==null 
                || page===undefined 
                || page=='' 
                || page.toString().length<1
                || html[page]===undefined 
                ){
                page = 'error'
            }
        }   
        jbApp.page = page;     
        //
        // Build and announce filename 
        //
        let pageHtmlLocation = './html/'+html[page]+'.html'        
        if (debug) console.log('(getHtml) Loading '+page+': '+pageHtmlLocation)

        //
        // Retrieve page
        //
        let htmlResult = await $.ajax({
            type: "GET",
            url: pageHtmlLocation,
            async: false,
            success: function(response) {                 
                jbApp.pageHtml = response;
                if (refreshPage == true){
                    //
                    // Refreshing page
                    //
                    if (debug)console.log('(getHtml) Refreshing Page:')
                    jbApp.processPageChange(refreshPage)
                }else{
                    //
                    // Returning page
                    //
                    if (debug)console.log('(getHtml) Returning HTML')
                    return response;
                }
             }
         })
         .then((htmlResult)=>{
            return htmlResult
        });
        return htmlResult
    },
    isJson:function(input){
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },
    load:async function(connection){
        if (debug) console.log('Loading jbApp')
        // If JourneyBuilder available
        if (connection){            
            if (debug) console.log('App input:')
            if (debug) console.table(connection)
            // Inherit properties from JourneyBuilder
            if (connection.hasOwnProperty('version')){
                jbApp.journeyVersion = connection.version 
            }
            if (jbApp.getTokens && jbApp.token== '') connection.trigger('requestTokens');
            
            if (debug) console.log('App version:'+jbApp.version)
            if (debug) console.log('App token:'+jbApp.token)
        }        

        /**
         *  Setup 
         * */
        // Perform install test
        await jbApp.testInstall()

        // Announce ready
        if (debug) console.log('App Loading Complete')
        window.jbApp = jbApp
                
        await jbApp.getHtml('nav',false).then((nav)=>{
            $('#nav').html(nav)
        });        

        jbApp.bindMenu(connection) /* Order of operations issue */
        
        jbApp.pageHtml = jbApp.getHtml('home',false)
        jbApp.processPageChange(1)
    },

/**
 * Journey Builder
 */

    parseEndpoints:function(data){
        let protocol = 'https://'
        if (data.hasOwnProperty('fuelapiRestHost')){
            jbApp.restUrl = data.fuelapiRestHost
        }
        if (data.hasOwnProperty('restHost')){
            jbApp.restHost = protocol+data.restHost
            jbApp.authUrl = jbApp.restHost.replace('rest','auth')+'/v2/token'
        }
        if (data.hasOwnProperty('soapHost')){
            jbApp.soapHost = protocol+data.soapHost
            jbApp.soapUrl = jbApp.soapHost+'/Service.asmx'
        }
    },
    parseSchema:function(){
        if (debug) console.log('parseSchema')
        if (
            jbApp.hasOwnProperty('schema')
            && jbApp.schema.length>0
            ){
                if (debug) console.log('schema: '+JSON.stringify(jbApp.schema))
                for (let i in jbApp.schema){
                    let schemaItem = jbApp.schema[i]
                    let fieldName = schemaItem.name
                    let fieldTag = schemaItem.key

                    if (schemaItem.type == 'Text'
                    && schemaItem.name != 'passId'
                    && schemaItem.length == null){
                        jbApp.deStructure[fieldName] = '{{'+fieldTag+'}}'
                    }else{
                        if (schemaItem.name == 'passId'){                            
                            jbApp.setPassId(fieldTag)
                        }
                    }
                    if (debug) console.log('['+fieldName+']:'+fieldTag)
                }
            }
        if (debug) console.log('jbApp.deStructure: ')
        if (debug) console.table(jbApp.deStructure)
        if (debug) console.log('jbApp.deStructure.length: '+jbApp.deStructure.toString().length)

        if (!jbApp.isLocalhost && typeof connection !== 'undefined'){
            if (debug) console.table(connection)
        }else{
            if (debug) console.table('Localhost or Connection not availble')
        }         
    },
    /* Transmit between front and back ends */
    callBackend:async function(url=null,body=null,type={dataType:'json',contentType:'application/json'}){        
        /* DataType Setup */
        let dataType = ''
        let contentType = ''
        if (type.hasOwnProperty('contentType') && type.hasOwnProperty('dataType')){
            contentType = type.contentType
            dataType = type.dataType
        }else{
            if (debug){
                console.log('Call backend, Type error')
                return false;
            }
        }

        let payload = body  
        
        if (debug){
            console.log('types: Data: '+dataType+' | Content-Type: '+contentType)        
            console.log('callBackend: typeof body | '+typeof payload)
            console.table(payload)
            }
        let ajaxResponse = await $.ajax({
            type: "POST",
            url: url,
            contentType: contentType,
            dataType: dataType,
            async:false,
            data: JSON.stringify(payload),            
            success: function(result){           
                return jbApp.restResponse(result)
            },
            fail:function(result){           
                Alert(JSON.stringify(result))
            }
        });
        return ajaxResponse;
    },
    
/**
 * REST functionality 
 */
    /* Loads config into into jbApp.configTable */
    getConfiguration:async function(){
        if (jbApp.configTable == null){
            let table = await jbApp.getDataExtensionRest(jbApp.configurationTable)
                .then((config)=>{
                let configuration = config.body
                jbApp.configTable = configuration
                if (configuration.hasOwnProperty('items')
                    && configuration.items[0].hasOwnProperty('values')            
                    ){
                        jbApp.configTable = configuration.items[0].values
                }else{
                    if (jbApp.configTable.hasOwnProperty('count') && jbApp.configTable.count>0){
                        return jbApp.configTable
                    }else{
                        return false
                    }
                }                
                return configuration
            });
            return table;
        }else{
            return jbApp.configTable
        }
    },

    getApiKey: async function(){
        let functionName = '(getApiKey) '
        
        if (jbApp.hasOwnProperty('configTable')){
                console.log(functionName+'looking for apiKey in: ')
                console.table(jbApp.configTable)
                let apiKey = jbApp.configTable.apikey
                console.log(functionName+'apiKey in: '+apiKey)
                return apiKey;
        }else{
            console.log(functionName+'App has no config table: ')
            return false;
        }
    },

    getDataExtensionRest:function(customerKey){
        if (debug) console.log('getDataExtension:'+customerKey)
        let requestResponse = $.ajax({
            type: "POST",
            url: '/getde',
            contentType: "application/json",
            dataType: "json",
            async:false,
            data: '{"customerKey":"'+customerKey+'"}',            
            success: function(result){           
                return jbApp.restResponse(result)
            },
            fail:function(result){           
                Alert(JSON.stringify(result))
                return false;
            }
        })
        .then((ajaxResponse)=>{
            return ajaxResponse;
        });
        return requestResponse
    },

    restResponse:function (result) {
        if (debug) console.log('Server response parsing starts')

        if (result.hasOwnProperty('status')){
            let status = result.status;
            if (debug) console.log('Server response has status: '+status)
        }

        if (result.hasOwnProperty('responseJSON')){
            return result.responseJSON;
        }else{
            return result;
        }
    },

    restError:function(data) {
        if (debug) console.log('Rest Error')
        if (data.hasOwnProperty('responseText')){
            console.log(data.responseText + " " + data.status);
        }else if (data.hasOwnProperty('statusText')){
            console.log(data.responseText + " " + data.statusText);
        }else{
            console.table(data)
        }
    },

    checkDeExists:async function(customerKey=''){        
        let table = await jbApp.getDataExtensionRest(customerKey)        
        return (table.status == 200) ? true : false  
    },
    
/**
 * SOAP functionality 
 */
    soapBuildTag:function(field='',value=null){
        let xml = null
        console.log('Formatting: '+field+' is '+(typeof value))
        if (
            typeof value === 'boolean'
            || field == 'FieldType'
            || field == 'Length'
        ){
            xml = br+'<'+field+'>'+value+'</'+field+'>';
        }else{
            xml = br+'<'+field+'><![CDATA['+value+']]></'+field+'>';
        }
        return xml
    },

    soapBuildDe:function(details={},fields = [],sendableFields=[]){
        /**
         * Envelope Wrapper
         */
        let soapOpening = `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
    <s:Header>
        <a:Action s:mustUnderstand="1">Create</a:Action>
        <a:To s:mustUnderstand="1">{{url}}Service.asmx</a:To>
        <fueloauth xmlns="http://exacttarget.com">{{access_token}}</fueloauth>
    </s:Header>
    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
    <CreateRequest xmlns="http://exacttarget.com/wsdl/partnerAPI">
        <Options></Options>
        <Objects xsi:type="DataExtension">` 
        let soapClosing = `
            </Objects>
        </CreateRequest>
    </s:Body>
</s:Envelope>`

        /**
         * SOAP Envelope
         */     
        let SOAP = soapOpening;

        /**
         * SOAP Details
         */        
        let soapDetails = ''
        for (var d in details){
            let detail = details[d]
            soapDetails += jbApp.soapBuildTag(d,detail)
        }

        /**
         * Sendable fields
         */
        let sendFields = ''
        if (sendableFields.length > 0){
            for (var s in sendableFields){
                let field = sendableFields[s];
                let sendField=br+'<SendableDataExtensionField>'+br
                for(var x in field){
                    let prop = field[x]
                    sendField += jbApp.soapBuildTag(x,prop)
                }
                sendField+='</SendableDataExtensionField>'+br
                sendFields += sendField
            }
        }
        if (sendFields != '' ){
            SOAP += br+sendFields+br
        }

        /**
         * Standard Fields
         */
        let mainFields = ''
        if (fields.length > 0){
            mainFields += br+'<Fields>'+br
            for (var f in fields){
                let field = fields[f]                
                let soapField='<Field>'
                for(var x in field){
                    let prop = field[x]
                    soapField += jbApp.soapBuildTag(x,prop)
                }
                // End PK & Nullable application

                soapField+=br+'</Field>'
                mainFields += soapField+br
            }
            mainFields += '</Fields>'+br
        }

        /**
         * Build Envelope 
         */
        if (soapDetails!=''){
            SOAP += soapDetails
        }
        if (sendableFields.length && sendFields!=''){
            SOAP += sendFields
        }
        if (fields.length && mainFields != ''){
            SOAP += mainFields
        }
        return SOAP+soapClosing;
    },

    saveConfig:async function(apiKey){
        let config = {
            'Id':jbApp.guid(),
            'APIKey':apiKey,
            'DateModified':jbApp.getDateTime()
        }
        saveResult = await jbApp.callBackend('/saveConfig',config)
        return saveResult;
    },

    buildConfigXml:function(){
        let details = {
            CustomerKey:jbApp.configurationTable,
            Name:jbApp.configurationTable,
            isSendable:false
        }
        let fields = [
        {
            CustomerKey:'Id',
            Name:'Id',
            FieldType:'Text',
            Length:36,
            isRequired:true,
            isPrimaryKey:true
        },{
            CustomerKey:'APIKey',
            Name:'APIKey',
            FieldType:'Text',
            Length:80,
            isRequired:false,
            isPrimaryKey:false
        },{
            CustomerKey:'DateModified',
            Name:'DateModified',
            FieldType:'Date',
            isRequired:false,
            isPrimaryKey:false
        },
        ]
        return this.soapBuildDe(details,fields)
    },

    buildLogXml:function(logName){
        let details = {
            CustomerKey:logName,
            Name:logName,
            isSendable:false
        }
        let fields = [
        {
            CustomerKey:'Id',
            Name:'Id',
            FieldType:'Text',
            Length:36,
            isRequired:true,
            isPrimaryKey:true
        },{
            CustomerKey:'DateModified',
            Name:'DateModified',
            FieldType:'Date',
            isRequired:false,
            isPrimaryKey:false
        },
        {
            CustomerKey:'Message',
            Name:'Message',
            FieldType:'Text',
            Length:4000,
            isRequired:false,
            isPrimaryKey:false
        },
        {
            CustomerKey:'MetaData',
            Name:'MetaData',
            FieldType:'Text',
            isRequired:false,
            isPrimaryKey:false
        }
        ]
        return this.soapBuildDe(details,fields)
    },

/**
 * Testing functionality 
 */
    bindTestMenu:function(){
        if (debug) console.log('Binding test menu')
        $('.test_action').each(function() {
            let elem = $( this )
            
            /**
             * Presume we'll be changing the page
             */
            var refreshPage=true;

            /**
             * Isolate the required action
             */
            let action = elem.data('action');
            jbApp.action = null
            jbApp.action = action

            /**
             * Bind the requested action
             */
            switch(action){

                case 'readSendable':
                    $(elem).on('click',async function(){
                        // Nominate table
                        let customerKey = 'testing_dale'

                        // Request Table
                        let table = await jbApp.getDataExtensionRest(customerKey)

                        // Execute Action                        
                        jbApp.pageHtml = JSON.stringify(table.body)
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:readSendable | '+jbApp.action)

                    });                
                    console.log('Bound '+action) 
                break;  

                case 'getLogTable':
                    $(elem).on('click',async function(){
                        // Nominate table
                        let customerKey = 'passcreator_success_log'

                        // Request Table
                        let table = await jbApp.checkDeExists(customerKey)
                        
                        // Execute Action                        
                        jbApp.pageHtml = JSON.stringify(table.body)
                        jbApp.processPageChange(refreshPage)

                    });                
                    console.log('Bound '+action) 
                break; 

                case 'getConfiguration':
                    $(elem).on('click',async function(){
                        let customerKey = 'passCreator_configuration'                        
                        let table = await jbApp.getDataExtensionRest(customerKey)
                        jbApp.pageHtml = JSON.stringify(table.body)

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:getConfiguration | '+jbApp.action+' ('+typeof table+')')

                    });                
                    console.log('Bound '+action) 
                break; 

                case 'buildTable':
                    let configXml = getConfigXml()
                    console.log('clicked:buildTable | got: '+configXml)
                    console.log('Bound '+action) 
                break;

                case 'authenticate':
                    $(elem).on('click',function(){
                        var testResults = jbApp.testAuth()
                        jbApp.pageHtml = JSON.stringify(testResults)

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:authenticate | '+jbApp.action)

                    });                
                    console.log('Bound '+action) 
                break;     

                case 'testLog':
                    $(elem).on('click',function(){
                        var testResults = jbApp.testLog({'message':'Test of the logging system performed at '})
                        jbApp.pageHtml = JSON.stringify(testResults)

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:testLog | '+jbApp.action)

                    });                
                    console.log('Bound '+action) 
                break;        

                case 'testMessage':
                    $(elem).on('click',function(){
                        var testResults = jbApp.testMessage({
                            'message':'help me'
                        })
                        jbApp.pageHtml = testResults

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:testLog | '+jbApp.action)

                    });                
                    console.log('Bound '+action) 
                break;  

                case 'getXml':
                    $(elem).on('click',function(){
                        var testResults = jbApp.buildConfigXml()
                        testResults = testResults.replaceAll('<','&lt;').replaceAll('>','&gt;')
                        jbApp.pageHtml = '<pre>'+testResults+'</pre>'

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:getXml | '+jbApp.action)

                    });                
                    console.log('Bound '+action) 
                break; 

                case 'getLogXml':
                    $(elem).on('click',function(){
                        var testResults = jbApp.buildLogXml('passcreator_success_log')
                        testResults = testResults.replaceAll('<','&lt;').replaceAll('>','&gt;')
                        jbApp.pageHtml = '<pre>'+testResults+'</pre>'

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:getLogXml | '+jbApp.action)

                    });                
                    console.log('Bound '+action) 
                break; 

                case 'testInstall':                    
                    $(elem).on('click',function(){
                        jbApp.testInstall()
                    });
                    console.log('Bound '+action) 
                    break;

                case 'getApiKey':
                    $(elem).on('click',async function(){
                        await jbApp.getApiKey().then((apiKey)=>{
                            console.log('Action Get APIKey: '+apiKey)
                            jbApp.pageHtml = '<pre>'+apiKey+'</pre>'

                            // Execute Action
                            jbApp.processPageChange(refreshPage)
                            });
                        });
                    break;
                default:
                    $(elem).on('click',function(){
                        jbApp.action = null
                        var testResults = '<h1>Error</h1><h2>Unconfigured test option</h2>'
                        jbApp.pageHtml = testResults

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked unconfigured test option:'+jbApp.action)   
                    });    
                break;


            }   

        }); 
    },

    testAuth:function(){
        $.ajax({
            beforeSend:function(){$('#main').html('Loading')},
            type: "POST",
            url: '/testauth',
            contentType: "application/json",
            dataType: "json",
            success: function(authResult){                        
                jbApp.testAuthSuccess(authResult)
            },
            error: function(xhr){
                jbApp.restError(xhr)
              }
        });        
    },    

    testLog:function(data){
        if (debug) console.log('testLog:')
        if (debug) console.table(data)
        $.ajax({
            type: "POST",
            url: '/testlog',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data),
            success: function(result){
                jbApp.restSuccess(result)
            },
            error: function(error){
                jbApp.restError(error)
            }
        });
    },   

    testMessage:function(data){
        if (debug) console.log('testmessage:')
        if (debug) console.table(data)
        $.ajax({
            type: "POST",
            url: '/testmessage',
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data),
            success: function(result){
                jbApp.restSuccess(result)
            },
            error: function(error){
                jbApp.restError(error)
            }
        });
    },

    testConfigXml:function(){
        let xml = jbApp.getConfigXml()
        return xml;
    },
    /**
     * Test to ensure the config table exists
     * Defines the Boolean jbApp.configExists
     */
    testConfigurationExists:async function(){
        console.log('testConfigurationExists')
        let config = null
        if (jbApp.configTable == null){
            config = await jbApp.getConfiguration().then((result) =>{
                return result
            });
        }else{
            config = jbApp.configTable
        }
        jbApp.configExists = (config.hasOwnProperty('count') && config.count > 0) ? true:false
        
        if (jbApp.configExists===true
            && config.hasOwnProperty('apikey')
            && config.apikey.length == 80){
            // Assign API to property
            jbApp.apiKey = config.apikey

            // Report success
            console.log('testConfigurationExists assigning apiKey'+config.toString())

        }else{            
            // Report failure
            console.log('testConfigurationExists could not find apiKey'+config.toString())
        }
        // Return test result
        return jbApp.configExists

    },
    
    testInstall:async function(){     
        return await jbApp.testConfigurationExists().then((installStatus)=>{
        console.log('Install status: '+installStatus)
        jbApp.configReady = installStatus
        return installStatus
        });
    },

    

}
jbApp.load(connection)