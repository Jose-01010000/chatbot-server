require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dialogflow = require('@google-cloud/dialogflow');

const app = express();
const port = process.env.PORT || 5000;
const projectId = process.env.DIALOGFLOW_PROJECT_ID;

app.use(bodyParser.json());
app.use(cors());

app.post('/train', async (req, res) => {
    try {
      const { userQuery, intent, feedback } = req.body;
  
      const sessionClient = new dialogflow.SessionsClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      });
  
      const sessionPath = sessionClient.projectAgentSessionPath(projectId, 'chatbot-training-session');
      const request = {
        session: sessionPath,
        queryInput: {
          text: {
            text: userQuery,
            languageCode: 'es-ES',
          },
        },
        queryParams: {
          knowledgeBaseNames: [`projects/${projectId}/knowledgeBases/${intent}`],
        },
      };
  
      const [response] = await sessionClient.detectIntent(request);
  
      // Seleccionar la respuesta correspondiente
      let message;
      switch (response.queryResult.intent.displayName) {
        case 'Saludo':
          message = '¡Hola! ¿En qué puedo ayudarte?';
          break;
        case 'Despedida':
          message = '¡Hasta luego!';
          break;
        default:
          message = 'Lo siento, no entiendo lo que estás diciendo';
          break;
      }
  
      const feedbackEvent = {
        name: 'feedback',
        parameters: {
          feedback,
        },
      };
      const feedbackRequest = {
        session: sessionPath,
        queryInput: {
          event: feedbackEvent,
          languageCode: 'es-ES',
        },
      };
  
      await sessionClient.detectIntent(feedbackRequest);
  
      res.status(200).json({ message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  });
  

// app.post('/train', async (req, res) => {
//   try {
//     const { userQuery, intent, feedback } = req.body;

//     const sessionClient = new dialogflow.SessionsClient({
//       keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
//     });

//     const sessionPath = sessionClient.projectAgentSessionPath(projectId, 'chatbot-training-session');
//     const request = {
//       session: sessionPath,
//       queryInput: {
//         text: {
//           text: userQuery,
//           languageCode: 'es-ES',
//         },
//       },
//       queryParams: {
//         knowledgeBaseNames: [`projects/${projectId}/knowledgeBases/${intent}`],
//       },
//     };

//     const [response] = await sessionClient.detectIntent(request);
//     const feedbackEvent = {
//       name: 'feedback',
//       parameters: {
//         feedback,
//       },
//     };
//     const feedbackRequest = {
//       session: sessionPath,
//       queryInput: {
//         event: feedbackEvent,
//         languageCode: 'es-ES',
//       },
//     };

//     await sessionClient.detectIntent(feedbackRequest);

//     res.status(200).json({ message: 'Entrenamiento completado' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error en el servidor' });
//   }
// });

app.listen(port, () => {
  console.log(`🔥 Servidor corriendo en el puerto ${port}`);
});
