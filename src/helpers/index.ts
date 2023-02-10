import axios from 'axios';

const AUTOMATION_ENDPOINT = process.env.AUTOMATION_ENDPOINT || 'https://integration-core-dev-api.liberateinc.io/';

interface PushMessage {
  txId: string;
  instanceId: string;
  tenantId: string;
  tenantEnvironment: string;
}

interface InvokeOptions {
  token: string;
  tenantId: string;
  tenantEnvironment: string;
  slug: string;
}

export const notifyAutomation = async (body: PushMessage, options: InvokeOptions) => {
  return new Promise(async (resolve, reject) => {
    try {
      axios
        .put(
          AUTOMATION_ENDPOINT,
          {
            slug: options.slug,
            context: { ...body },
          },
          {
            headers: {
              Authorization: options.token,
              'Content-Type': 'application/json',
              // 'x-liberate-tenant-id': `${options.tenantId}`,
              // 'x-liberate-tenant-environment': `${options.tenantEnvironment}`,
              Accept: 'application/json',
            },
          },
        )
        .then((response) => {
          console.log(`Success invoking automation:`, response.data);
          resolve(response.data);
        })
        .catch((err: any) => {
          console.error(`Error invoking automation:`, err);
          reject(err);
        });
    } catch (err: any) {
      reject(err);
    }
  });
};
