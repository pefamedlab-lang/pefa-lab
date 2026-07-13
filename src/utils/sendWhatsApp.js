import axios from "axios";

export async function sendResultMessage({

  phone,

  patientName,

  labNumber,

}){

  try{

    await axios.post(

      `https://graph.facebook.com/v19.0/PHONE_NUMBER_ID/messages`,

      {

        messaging_product:
          "whatsapp",

        to: phone,

        type: "template",

        template:{

          name:
            "result_ready",

          language:{
            code:"en"
          },

          components:[

            {
              type:"body",

              parameters:[

                {
                  type:"text",
                  text:patientName
                },

                {
                  type:"text",
                  text:labNumber
                }
              ]
            }
          ]
        }

      },

      {

        headers:{

          Authorization:
            `Bearer ${TOKEN}`,

          "Content-Type":
            "application/json",
        }
      }
    );

  }catch(error){

    console.log(error);
  }
}