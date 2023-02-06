import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import axios from "axios";

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const FILE_NAME = process.env.FILE_NAME || "dwolla/tx.json";
const TOKEN_MAP_FILE =
  process.env.TOKEN_MAP_FILE || "dwolla/dwolla-token-map.json";
const BUCKET = process.env.BUCKET || "webhooks-transactions";
const AUTOMATION_ENDPOINT =
  process.env.AUTOMATION_ENDPOINT ||
  "https://integration-core-dev-api.liberateinc.io/";

export const findTransaction = async (txId: string): Promise<Transaction> => {
  const data = await loadFile();
  console.log(
    `Loaded Tx File [looking for txId ${txId}]: ${JSON.stringify(
      data,
      null,
      2
    )}`
  );
  return data[txId];
};

export const notifyAutomation = async (tx: Transaction, topic: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const bearerToken: any = await findBearerToken(
        tx.tenantId,
        tx.tenantEnvironment
      );
      console.log(`Found bearer token ${JSON.stringify(bearerToken)}`);
      axios
        .post(
          AUTOMATION_ENDPOINT,
          {
            instanceId: `${tx.instanceId}`,
            event: `${topic}`,
            context: {},
          },
          {
            headers: {
              "Content-Type": "application/json",
              "x-liberate-tenant-id": `${tx.tenantId}`,
              "x-liberate-tenant-environment": `${tx.tenantEnvironment}`,
              // Authorization: `Bearer ${bearerToken.token}`,
            },
          }
        )
        .then((response) => {
          console.log(`Success sending update to automation: ${tx.instanceId}`, response.data);
          resolve(response.data);
        })
        .catch((err: any) => {
          console.error(`Error sending update to automation: ${tx.instanceId}`, err);
          reject(err);
        });
    } catch (err: any) {
      reject(err);
    }
  });
};

const loadFile = async () => {
  try {
    const getObjectCommandInput: GetObjectCommandInput = {
      Bucket: BUCKET,
      Key: FILE_NAME,
    };
    const response = await s3Client.send(
      new GetObjectCommand(getObjectCommandInput)
    );
    return JSON.parse(await streamToString(response.Body));
  } catch (err) {
    console.log(`Error loading file`);
    return {};
  }
};

export const saveTransaction = async (
  txId: string,
  instanceId: string,
  tenantId: string,
  tenantEnvironment: string
) => {
  const data = await loadFile();
  data[txId] = {
    instanceId: instanceId,
    tenantId: tenantId,
    tenantEnvironment: tenantEnvironment,
  };
  const objectRequest: PutObjectCommandInput = {
    Bucket: BUCKET,
    Key: FILE_NAME,
    Body: JSON.stringify(data),
  };
  return await s3Client.send(new PutObjectCommand(objectRequest));
};

const streamToString = (stream: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const chunks: any = [];
    stream.on("data", (chunk: unknown) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
  });
};

const loadTokenMap = async () => {
  try {
    const getObjectCommandInput: GetObjectCommandInput = {
      Bucket: BUCKET,
      Key: TOKEN_MAP_FILE,
    };
    const response = await s3Client.send(
      new GetObjectCommand(getObjectCommandInput)
    );
    return JSON.parse(await streamToString(response.Body));
  } catch (err) {
    console.error(`Unable to load token map file`, err);
    return {};
  }
};

const findBearerToken = async (
  tenantId: string,
  tenantEnvironment: string
): Promise<any> => {
  const data = await loadTokenMap();
  const key = `${tenantId}:${tenantEnvironment}`;
  console.log(`Searching for bearer token by ${key}`);
  return data[key];
};

export interface Transaction {
  txId: string;
  instanceId: string;
  tenantId: string;
  tenantEnvironment: string;
}
