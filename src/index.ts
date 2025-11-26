import fs from 'node:fs';
import path from 'node:path';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

const argv = yargs(hideBin(process.argv)).parseSync();

for (const arg of argv._) {
  if (typeof arg !== 'string') continue;

  const filePath = path.resolve(arg);
  const jsonText = fs.readFileSync(filePath).toString();
  const json = JSON.parse(jsonText) as unknown;
  const serviceAccount = toServiceAccount(json, filePath);

  const dirName = path.dirname(filePath);
  const outFilePath = path.join(dirName, `.env.${path.basename(filePath, '.json')}`);
  fs.writeFileSync(
    outFilePath,
    `
FIREBASE_PROJECT_ID=${JSON.stringify(serviceAccount.project_id)}
FIREBASE_PRIVATE_KEY_ID=${JSON.stringify(serviceAccount.private_key_id)}
FIREBASE_PRIVATE_KEY=${JSON.stringify(serviceAccount.private_key)}
FIREBASE_CLIENT_EMAIL=${JSON.stringify(serviceAccount.client_email)}
FIREBASE_CLIENT_ID=${JSON.stringify(serviceAccount.client_id)}
FIREBASE_AUTH_URI=${JSON.stringify(serviceAccount.auth_uri)}
FIREBASE_TOKEN_URI=${JSON.stringify(serviceAccount.token_uri)}
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=${JSON.stringify(serviceAccount.auth_provider_x509_cert_url)}
FIREBASE_CLIENT_X509_CERT_URL=${JSON.stringify(serviceAccount.client_x509_cert_url)}
`.trim()
  );
  console.log(outFilePath);
}

interface ServiceAccount {
  auth_provider_x509_cert_url: string;
  auth_uri: string;
  client_email: string;
  client_id: string;
  client_x509_cert_url: string;
  private_key: string;
  private_key_id: string;
  project_id: string;
  token_uri: string;
}

const serviceAccountKeys: (keyof ServiceAccount)[] = [
  'auth_provider_x509_cert_url',
  'auth_uri',
  'client_email',
  'client_id',
  'client_x509_cert_url',
  'private_key',
  'private_key_id',
  'project_id',
  'token_uri',
];

function toServiceAccount(json: unknown, filePath: string): ServiceAccount {
  if (typeof json !== 'object' || json === null) {
    throw new Error(`Service account in ${filePath} is not a JSON object`);
  }

  const record = json as Record<string, unknown>;
  const serviceAccount = {} as ServiceAccount;
  for (const key of serviceAccountKeys) {
    const value = record[key];
    if (typeof value !== 'string') {
      throw new TypeError(`Expected ${key} in ${filePath} to be a string`);
    }
    serviceAccount[key] = value;
  }

  return serviceAccount;
}
