import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { notifyAutomation } from './helpers';

export const handler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  console.log(`Incoming Webhook Request -- EVENT: ${JSON.stringify(event, null, 2)}`);
  if (event.body) {
    const body = JSON.parse(event.body);
    // In this case, we want event.body.message
    console.log(`Gmail Transaction ${JSON.stringify(body, null, 2)}`);

    try {
      // We're not going to await this because if integration core takes too long to ACK the message, Google will keep
      // sending us the same message over and over again. We'll just swallow for now.
      notifyAutomation(body, {
        token: 'Bearer ****', // COPY AND PASTE THE BEARER TOKEN HERE
        tenantId: 'liberate',
        tenantEnvironment: 'qa',
        slug: 'gmail-inbox-item-to-slack-4d20f121-399c-4245-a029-231febf4e397',
      });

      await timeoutPromise(2000);
    } catch (error) {
      // We're just swallowing the error for now because I don't want Google to keep calling us with the back-off
    }

    return buildResponse(200);
  } else {
    console.error(`No body sent with gmail push webhook call`);
    return buildResponse(200);
  }
};

const buildResponse = (statusCode: number): APIGatewayProxyResultV2 => {
  return {
    statusCode: statusCode,
    body: JSON.stringify({}),
  };
};

const timeoutPromise = (ms: number) => {
  return new Promise(async (resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      resolve(1);
    }, ms);
  });
};
