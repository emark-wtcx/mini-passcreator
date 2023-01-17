// we'll store the activity on this variable when we receive it
let activity = null;

// Wait for the document to load before we doing anything
document.addEventListener('DOMContentLoaded', function main() {

    // Setup a test harness so we can interact with our custom activity
    // outside of journey builder using window functions & browser devtools.
    // This isn't required by your activity, its for example purposes only
    setupExampleTestHarness();

    // setup our ui event handlers
    setupEventHandlers();

    // Bind the initActivity event...
    // Journey Builder will respond with "initActivity" after it receives the "ready" signal
    connection.on('initActivity', onInitActivity);


    // We're all set! let's signal Journey Builder
    // that we're ready to receive the activity payload...

    // Tell the parent iFrame that we are ready.
    connection.trigger('ready');

    if (jbApp.getTokens){
        connection.trigger('requestTokens');
        connection.on('requestedTokens', function (data) {
            // save tokens
            console.log('*** Data ***', JSON.stringify(data));
            console.log('*** Tokens ***', JSON.stringify(data['token']));
            jbApp.token = data['token']
        });
        }
    
    if (jbApp.getSchema){
        connection.trigger('requestSchema');
        connection.on('requestedSchema', function (data) {
            // save schema
            console.log('*** Schema ***', JSON.stringify(data['schema']));
            jbApp.schema = data['schema']
            jbApp.parseSchema()
            });
    }
    
    
    if (jbApp.getInteractions){
        connection.trigger('requestInteraction');
        connection.on('requestedInteractions', function (data) {
            console.log('Requested Interaction:')
            console.table(data)
        });
    }
    console.log('connection:')
    console.table(connection)
    jbApp.connection = connection
});

// this function is triggered by Journey Builder via Postmonger.
// Journey Builder will send us a copy of the activity here
function onInitActivity(payload) {

    // set the activity object from this payload. We'll refer to this object as we
    // modify it before saving.
    activity = payload;

    const hasInArguments = Boolean(
        activity.arguments &&
        activity.arguments.execute &&
        activity.arguments.execute.inArguments &&
        activity.arguments.execute.inArguments.length > 0
    );

    const inArguments = hasInArguments ? activity.arguments.execute.inArguments : [];

    const jbMessage = inArguments.find((arg) => arg.message);

    console.log('Message', jbMessage);

    // if a message back argument was set, show the message in the view.
    if (jbMessage) {
        jbApp.transferMessage();
    }

    // if the message back argument doesn't exist the user can pick
    // a message message from the drop down list. the message back arg
    // will be set once the journey executes the activity
    jbApp.load(connection)
    jbApp.payload = activity
    window.jbApp = jbApp
    return jbApp
}
function setupExampleTestHarness() {

    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (!isLocalhost) {
        // don't load the test harness functions when running in Journey Builder
        return;
    }

    const jbSession = new Postmonger.Session();
    const jb = {};
    window.jb = jb;

    jbSession.on('setActivityDirtyState', function(value) {
        console.log('[echo] setActivityDirtyState -> ', value);
    });
    // Cancel Button
    jbSession.on('requestInspectorClose', function() {
        console.log('[echo] requestInspectorClose');        
        var html = jbApp.getHtml('home',1)
        jbApp.setProgress(0)
        $('#home').text('Home')
        $('#main').html(html)
    });

    jbSession.on('updateActivity', function(activity) {
        console.log('[echo] updateActivity -> ', JSON.stringify(activity, null, 4));
    });

    jbSession.on('ready', function() {  
        var jsThis = jbSession;      
        console.log('[echo] ready');
        console.log('\tuse jb.ready() from the console to initialize your activity')
        jbApp.load(jsThis);
    });

    // fire the ready signal with an example activity
    jb.ready = function() {
        jbSession.trigger('initActivity', { 
            name: 'Pass Creator',
            key: 'PassCreator',
            metaData: {},
            configurationArguments: {},
            arguments: {
                executionMode: "{{Context.ExecutionMode}}",
                definitionId: "{{Context.DefinitionId}}",
                activityId: "{{Activity.Id}}",
                contactKey: "{{Context.ContactKey}}",
                execute: {
                    inArguments: [
                        {
                        "emailAddress": "{{InteractionDefaults.Email}}"
                        },
                        {
                        "phoneNumber": "{{Contact.Default.PhoneNumber}}"
                        }
                    ],
                    outArguments: []
                },
                startActivityKey: "{{Context.StartActivityKey}}",
                definitionInstanceId: "{{Context.DefinitionInstanceId}}",
                requestObjectId: "{{Context.RequestObjectId}}",
                wizardSteps: [
                    jbApp.getSteps(1)
                ]
            }
        });
    };
}

function setupEventHandlers() {
    // Listen to events on the form
    $('#done').on('click', onDoneButtonClick);
    $('#cancel').on('click', onCancelButtonClick);
}


function onDoneButtonClick() {    
    let url = jbApp.getPassEndpoint()
    // Construct Body of REST Call    
    jbApp.payload["arguments"].execute.url = url


    let restBody = {
        "endpoint": url,
        "pushNotificationText": jbApp.message,        
    }

    // Add name payload
    if (jbApp.hasOwnProperty('payload')
    && jbApp.payload.hasOwnProperty('name')){
        jbApp.payload.name = 'WPP Passcreator'
    }else{
        console.log('missing payload or name')
    }

    /**
     * Place body in outgoing call
     */ 
    
    if (jbApp.hasOwnProperty('payload')
    && jbApp.payload.hasOwnProperty('arguments')){
        // Documented method
        jbApp.payload["arguments"].execute.inArguments = [restBody]

        // Workaround attempt(s)
        //jbApp.payload.arguments.message = jbApp.message
    }else{
        console.log('missing payload or arguments')
    }

    // Tell JB the activity has changes
    connection.trigger('setActivityDirtyState', true);

    // Tell JB we're ready to go    
    if (jbApp.hasOwnProperty('payload')
    && jbApp.payload.hasOwnProperty('arguments')){
        jbApp.payload["metaData"].isConfigured = true; 
    }else{
        console.log('missing payload or metaData')
    }

    // Log payload to check for message inclusion
    if (jbApp.hasOwnProperty('payload')){
        if (debug) console.log('Activating payload')
        if (debug) console.table(JSON.stringify(jbApp.payload))

        // Tell JB the activity is configured & ready to use
        connection.trigger('updateActivity', jbApp.payload);
    }else{
        console.log('missing payload on activation')
    }
}

function onCancelButtonClick() {
    $('#jbapp__nav_home').html('Cancel').data('action','home')
    // tell Journey Builder that this activity has no changes.
    // we wont be prompted to save changes when the inspector closes
    connection.trigger('setActivityDirtyState', false);

    // now request that Journey Builder closes the inspector/drawer
    connection.trigger('requestInspectorClose');
}