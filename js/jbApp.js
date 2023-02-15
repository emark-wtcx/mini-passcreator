const connection = new Postmonger.Session();
/**
 * Create a new connection for this session.
 */
/**
 * Show Console Output?
 */
const debug = true;

const jbApp = { 
    isTest:false, 
    isLocalhost:(location.hostname === 'localhost' || location.hostname === '127.0.0.1'),
    getSchema:true,
    getTokens:true,
    getEndpoints:true,
    getInteractions:false,
    token:null,
    passId:null,
    currentStep:0,
    pageHtml:'',
    deStructure:{},
    message:'',
    action:null,
    credentials:{
        'url': 'https://app.passcreator.com/api/pass/{passId}/sendpushnotification',
        'auth': '8cn/SZm168HpBz_dUK&GvEIxwL6xbf8YE8rB3Il9tO_od0XngAeBV9tLe_LykQxPC4A4i0K1zKoOlxQ0'        
    },
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
    soap:{
        getDataExtension:`<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
    <s:Header>
        <a:Action s:mustUnderstand="1">Retrieve</a:Action>
        <a:To s:mustUnderstand="1">https://{{jbApp.subdomain}}.soap.marketingcloudapis.com/Service.asmx</a:To>
        <fueloauth xmlns="http://exacttarget.com">{{jbApp.etAccessToken}}</fueloauth>
    </s:Header>
    <s:Body xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
        <RetrieveRequestMsg xmlns="http://exacttarget.com/wsdl/partnerAPI">
            <RetrieveRequest>
                <ObjectType>DataExtension</ObjectType>
                <Properties>ObjectID</Properties>
                <Properties>CustomerKey</Properties>
                <Properties>Name</Properties>
                <Properties>IsSendable</Properties>
                <Properties>SendableSubscriberField.Name</Properties>
                <Filter xsi:type="SimpleFilterPart">
                    <Property>CustomerKey</Property>
                    <SimpleOperator>equals</SimpleOperator>
                    <Value>postman_demographics</Value>
                </Filter>
            </RetrieveRequest>
        </RetrieveRequestMsg>
    </s:Body>
</s:Envelope>
        `
    },
    getPassEndpoint:function(){
        if (debug) console.log('getPassEndpoint triggered')
        // Get starter URL based on isTest setting of app
        var endpoint = jbApp.credentials.url;
        
        if (jbApp.passId != null){
            endpoint = endpoint.replace('{passId}',jbApp.passId)
        }
        return endpoint;
    },
    parseEndpoints:function(data){
        if (data.hasOwnProperty('fuelapiRestHost')){
            jbApp.restUrl = data.fuelapiRestHost
            jbApp.authUrl = jbApp.restUrl.replace('rest','auth')
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
                    && schemaItem.length == null)
                    {
                    jbApp.deStructure[fieldName] = '{{'+fieldTag+'}}'
                    }else{
                        if (schemaItem.name == 'passId'){                            
                            jbApp.passId = '{{'+fieldTag+'}}'
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
            }   
    
        }); 
    },
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
                    $(elem).on('click',function(){
                        jbApp.action = action
                        let customerKey = 'testing_dale'
                        var testResults = 'Test successful'
                        var testResults = jbApp.getDataExtensionRest(customerKey)
                        jbApp.pageHtml = testResults

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:readSendable | '+jbApp.action)

                    });                
                    console.log('Bound '+action) 
                break;  

                case 'authenticate':
                    $(elem).on('click',function(){
                        jbApp.action = null
                        jbApp.action = action
                        var testResults = jbApp.testAuth()
                        jbApp.pageHtml = testResults

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:authenticate | '+jbApp.action)

                    });                
                    console.log('Bound '+action) 
                break;     

                case 'testLog':
                    $(elem).on('click',function(){
                        jbApp.action = null
                        jbApp.action = action
                        var testResults = jbApp.testLog({'message':'help'})
                        jbApp.pageHtml = testResults

                        // Execute Action
                        jbApp.processPageChange(refreshPage)
                        
                        // Accounce Click
                        console.log('clicked:testLog | '+jbApp.action)

                    });                
                    console.log('Bound '+action) 
                break;        

                case 'testMessage':
                    $(elem).on('click',function(){
                        jbApp.action = null
                        jbApp.action = action
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

                default:
                    $(elem).on('click',function(){
                        jbApp.action = null
                        var testResults = 'Unconfigured test option'
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
    processPageChange(refreshPage){
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
    getHtml:function(page,refreshPage){
        if (refreshPage == null){
            refreshPage = true
        }
        if (debug) console.log('(getHtml): '+page)
        if (page==null 
            || page===undefined 
            || page=='' 
            || page.toString().length<1
            ){
            page = 'error'
        }
        let html={
            home:'home',
            error:'error',
            inputMessage:'input_message',
            selectMessage:'select_message',
            ribbon:'ribbon'   
        }
        let pageHtmlLocation = './html/'+html[page]+'.html'        
        if (debug) console.log('(getHtml) Location: '+pageHtmlLocation)
        //
        // Retrieve page
        //
        $.ajax({
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
                    return jbApp.pageHtml;
                }
             }
         });
    },
    translatePage:function(html){
    },    
    load:function(connection){
        if (debug) console.log('Loading jbApp')
        // If JourneyBuilder available
        if (connection){            
            if (debug) console.log('App input:')
            if (debug) console.table(connection)
            // Inherit properties from JourneyBuilder
            if (connection.hasOwnProperty('version')){
                jbApp.Version = connection.version 
            }
            if (jbApp.getTokens && jbApp.token== '') connection.trigger('requestTokens');
            
            if (debug) console.log('App version:'+1.5)
            if (debug) console.log('App token:'+jbApp.token)
        }        

        /**
         *  Setup 
         * */
        jbApp.bindMenu(connection)


        // Announce ready
        if (debug) console.log('App Loading Complete')
        window.jbApp = jbApp

        jbApp.pageHtml = jbApp.getHtml('home')
        jbApp.processPageChange(1)
    },

    getDataExtensionRest:function(customerKey){
        if (debug) console.log('getDataExtension:'+customerKey)
        $.ajax({
            type: "POST",
            url: '/getde',
            contentType: "application/json",
            dataType: "json",
            data: '{"customerKey":"'+customerKey+'"}',
            success: function(result){
                jbApp.getDeSuccess(result)
            },
            error: function(error){
                jbApp.restError(error)
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
                jbApp.authSuccess(authResult)
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

    getDeSuccess:function (result) {
        if (debug) console.log('getDeSuccess Success')
        switch(result.status){
            case 200:
                if (debug) console.log('Call Status: '+result.status)
                if (debug) console.log('Success data: ')
                console.table(result.body)
                $('#main').html(result.body)
            break;

        }
    },

    authSuccess:function (result) {
        if (debug) console.log('Auth Success')
        if (debug) console.log('Success data: ')
        console.table(result)
        $('#main').html(result)
    },

    restSuccess:function (result) {
        if (debug) console.log('Rest Success')
        if (debug) console.log('Success data: ')
        console.table(result)
        $('#main').html(result)
    },

    restError:function(data) {
        if (debug) console.log('Auth Error')
        if (data.hasOwnProperty('responseText')){
            console.log(data.responseText + " " + data.status);
        }else if (data.hasOwnProperty('statusText')){
            console.log(data.responseText + " " + data.statusText);
        }else{
            console.table(data)
        }
    },

    /**
     * Deprecated
     */
    getDataExtensionSoap:function(){
        if (debug) console.log('getDataExtension')
        $.ajax({
            type: "POST",
            url: jbApp.webserviceUrl,
            contentType: "text/xml",
            dataType: "xml",
            data: jbApp.soap.getDataExtension,
            success: jbApp.soapSuccess(),
            error: jbApp.soapError(),
            done:parseSoapResponse( response, request, settings )
        });
    },

    parseSoapResponse:function( response, request, settings ){
        if (debug) console.table(response)
        return JSON.stringify(response)
    },

    soapSuccess:function (data, status, req) {
        if (debug) console.log('SuccessOccur')
        if (data && data.hasOwnProperty('responseText') && status == "success")
            alert(data.responseText);
    },

    soapError:function(data, status, req) {
        if (debug) console.log('ErrorOccur')
        if (data && data.hasOwnProperty('responseText')){
        alert(data.responseText + " " + status);
        }else{
            console.table(data)
        }
    },
}
jbApp.load(connection)