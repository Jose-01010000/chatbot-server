const dialogflow = require("dialogflow");
const dialogflowConfig = require("./config");

const projectId = dialogflowConfig.project_id;
const configuration = {
  credentials: {
    private_key: dialogflowConfig.private_key,
    client_email: dialogflowConfig.client_email,
  },
};

const sessionId = "997753";
const languageCode = "es-ES";
const sessionClient = new dialogflow.SessionsClient(configuration);

const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const talkToChatbot = async (message) => {
  console.log("message " + message);
  const botRequest = {
    session: sessionPath,
    queryParams: {
      sentimentAnalysisRequestConfig: {
        analyzeQueryTextSentiment: true,
      },
    },
    queryInput: {
      text: {
        text: message,
        languageCode: languageCode,
      },
    },
  };

  let response = await sessionClient
    .detectIntent(botRequest)
    .then((responses) => {
      const requiredResponse = responses[0].queryResult;
      return requiredResponse;
    })
    .catch((error) => {
      console.log("ERROR: " + error);
    });

  return response;
};

module.exports = talkToChatbot;
