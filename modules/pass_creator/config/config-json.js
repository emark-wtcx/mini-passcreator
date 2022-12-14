return {
  "workflowApiVersion": "1.1",
  "metaData": {
    "icon": `images/pass_creator.png`,
    "category": 'messages',
    "isConfigured":false,
    "configOnDrop":true
  },
  "type": "REST",
  "lang": {
    "en-US": {
      "name": 'Pass Creator',
      "description": 'WPP Integration for Pass Creator',
      "selectType":'Select Input Type',
      "configureMessage":'Configure Your Message',
      "confirm":'Confirm',
    }
  },
  "arguments": {
    "execute": {
      "inArguments": [
          {"contactIdentifier": "{{Contact.Key}}"},
          {"emailAddress": "{{InteractionDefaults.Email}}"},
          {"message":""}
        ],
      "outArguments": [
        {
          "foundSignupDate": ""
        }
      ],
      "url": `https://eol3vy07fc9qzyh.m.pipedream.net`,
      "verb": "POST",
      "method": "POST",
      "format": "json",
      "useJwt": false
    }
  },
  "configurationArguments": {
    "publish": {
      "url": `https://eon2nxjzthbdt2w.m.pipedream.net`
    },
    "validate": {
      "url": `https://eoxsr92hcso0n3h.m.pipedream.net`
    },
    "stop": {
      "url": `https://eoot1xooh8qwfa8.m.pipedream.net`
    }
  },
  wizardSteps: [
    {
      "label": "Select Type",
      "key": "selectType"
    },
    {
      "label": "Configure Message",
      "key": "configureMessage"
    },
    {
      "label": "Confirm",
      "key": "confim"
    },
  ], 
  "userInterfaces": {
    "configModal": {
      "height": 200,
      "width": 300,
      "fullscreen": true
    }
  },
  "schema": {
    "arguments": {
      "execute": {
        "inArguments": [
          {
            "message":{
              "dataType": "text",
              "isNullable": false,
              "direction": "in"
              }
          },
          {
            "emailAddress": {
              "dataType": "Email",
              "isNullable": false,
              "direction": "in"
            }
          }
        ],
        "outArguments": []
      }
    }
  }
}
