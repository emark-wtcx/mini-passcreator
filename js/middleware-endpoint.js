import axios from "axios"
export default defineComponent({
  async run({ steps, $ }) {
    const headers = {}

    const bodyContent = {
      "pushNotificationText":steps.trigger.event.inArguments[0].message
    }
    const externalUrl = steps.trigger.event.inArguments[0].endpoint
    
    await $.respond({
      status: 200,
      headers,
      bodyContent
    }).then(async function(){
      const { data } = await axios({
        url: externalUrl,
        headers: headers,
        body: bodyContent
      })
      return data
    })
  },
})