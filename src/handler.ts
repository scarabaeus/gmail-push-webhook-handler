import {
  APIGatewayProxyHandlerV2,
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "aws-lambda";
import { notifyAutomation, findTransaction } from "./helpers";

export const handler: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
) => {
  console.log(`EVENT: ${JSON.stringify(event, null, 2)}`);
  // if (isDwolla(event)) {
    if (event.body) {
      const body = JSON.parse(event.body);
      // const { id, resourceId, topic } = body;
      console.log(`Gmail Transaction ${JSON.stringify(body, null, 2)}`);
      // if (topic.startsWith("customer_")) {
      //   console.log(`Gmail Transaction ${JSON.stringify(body, null, 2)}`);
      //   console.log(`Waiting for 5sec....`);
      //   await timeoutPromise(5000);
      //   console.log(`Looking for transaction.... ${resourceId}`);
      //   const tx = await findTransaction(resourceId);
      //   if (!tx) {
      //     console.error(`No Transaction Found... for resourceId ${resourceId}`);
      //     return buildResponse(200);
      //   } else {
      //     console.log(`Found Transaction: ${JSON.stringify(tx, null, 2)}`);
      //     try {
      //       const response = await notifyAutomation(tx, topic);
      //       console.log(`Got response from automation`, response);
      //     } catch (err: any) {
      //       console.error(`Error notifying Automation`, err);
      //     }
      //     return buildResponse(200);
      //   }
      // } else {
      //   return buildResponse(200);
      // }
      return buildResponse(200);
    } else {
      console.error(`No body sent with gmail push webhook call`);
      return buildResponse(200);
    }
  // } else {
  //   return buildResponse(400);
  // }
};

const timeoutPromise = (ms: number) => {
  return new Promise(async (resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      resolve(1);
    }, ms);
  });
};

const isDwolla = (event: APIGatewayProxyEventV2) => {
  const { requestContext: { http } = {} } = event;
  return (
    http?.path.includes("/dwolla") && http?.method.toLowerCase() === "post"
  );
};

const buildResponse = (statusCode: number): APIGatewayProxyResultV2 => {
  console.log(`Building response with status code ${statusCode}`);
  return {
    statusCode: statusCode,
    "body": JSON.stringify({ "name": "steve g" }),
  };
};
