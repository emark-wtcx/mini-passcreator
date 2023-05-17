const XML = {
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

  soapBuildDe:async function(details={},fields = [],sendableFields=[]){
      /**
       * Envelope Wrapper
       */
      let soapOpening = `<?xml version="1.0" encoding="UTF-8"?>
  <s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope" xmlns:a="http://schemas.xmlsoap.org/ws/2004/08/addressing" xmlns:u="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd">
  <s:Header>
      <a:Action s:mustUnderstand="1">Create</a:Action>
      <a:To s:mustUnderstand="1">{{url}}</a:To>
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
          soapDetails += XML.soapBuildTag(d,detail)
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
                  sendField += XML.soapBuildTag(x,prop)
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
                  soapField += XML.soapBuildTag(x,prop)
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

  buildConfigXml:async function(){
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
          CustomerKey:'logo_url',
          Name:'logo_url',
          FieldType:'Text',
          Length:500,
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

  buildLogXml:async function(logName){
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
}