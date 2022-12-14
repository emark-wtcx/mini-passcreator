module.exports = function configJSON(req) {
    return {
    "workflowApiVersion": "1.1",
    "metaData": {
      "icon": "images/sms.png",
      "category": "message"
    },
    "type": "REST",
    "lang": {
      "en-US": {
        "name": "Passcreator",
        "description": "Custom integration for Passcreator"
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
      "save": {
        "url": "URI/for/your/activity/save"
      },
      "publish": {
        "url": "URI/for/your/activity/publish"
      },
      "validate": {
        "url": "URI/for/your/activity/validate"
      },
      "stop": {
        "url": "URI/for/your/activity/stop"
      }
    },
    "wizardSteps": [
      { "label": "Step 1", "key": "step1" },
      { "label": "Step 2", "key": "step2" },
      { "label": "Step 3", "key": "step3" },
      { "label": "Step 4", "key": "step4", "active": false }
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
              "phoneNumber": {
                "dataType": "Phone",
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
          "outArguments": [
            {
              "foundSignupDate": {
                "dataType": "Date",
                "direction": "out",
                "access": "visible"
              }
            }
          ]
        }
      }
    }
  }
}