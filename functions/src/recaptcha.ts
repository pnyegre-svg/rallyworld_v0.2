
import * as functions from 'firebase-functions';
import { RecaptchaEnterpriseServiceClient } from '@google-cloud/recaptcha-enterprise';

const projectID = process.env.RECAPTCHA_PROJECT_ID;
const recaptchaKey = process.env.RECAPTCHA_KEY;

let client: RecaptchaEnterpriseServiceClient | null = null;
const getClient = () => {
    if (!client) {
        client = new RecaptchaEnterpriseServiceClient();
    }
    return client;
}

/**
  * Create an assessment to analyse the risk of a UI action.
  * @param {object} assessmentParams
  * @param {string} assessmentParams.token The generated token obtained from the client.
  * @param {string} assessmentParams.recaptchaAction Action name corresponding to the token.
  * @returns {Promise<number | null>} The risk score.
  */
export async function createAssessment({
  token,
  recaptchaAction,
}: {token: string, recaptchaAction: string }): Promise<number | null> {
  if (!projectID || !recaptchaKey) {
    throw new functions.https.HttpsError('failed-precondition', 'reCAPTCHA environment variables not set.');
  }

  const recaptchaClient = getClient();
  const projectPath = recaptchaClient.projectPath(projectID);

  const request = ({
    assessment: {
      event: {
        token: token,
        siteKey: recaptchaKey,
      },
    },
    parent: projectPath,
  });

  try {
    const [ response ] = await recaptchaClient.createAssessment(request);
  
    if (!response.tokenProperties?.valid) {
      functions.logger.warn(`The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`);
      return null;
    }
  
    if (response.tokenProperties.action === recaptchaAction) {
      const score = response.riskAnalysis?.score;
      functions.logger.info(`The reCAPTCHA score is: ${score}`);
      response.riskAnalysis?.reasons?.forEach((reason) => {
        functions.logger.info(reason);
      });
  
      return score ?? null;
    } else {
      functions.logger.warn("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
      return null;
    }
  } catch (error) {
      functions.logger.error("Error creating assessment:", error);
      return null;
  }
}
