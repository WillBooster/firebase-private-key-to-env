import fs from 'fs';
import path from 'path';

import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';

const argv = yargs(hideBin(process.argv)).argv;

for (const arg of argv._) {
  if (typeof arg === 'number') continue;

  const filePath = path.resolve(arg);
  const jsonText = fs.readFileSync(filePath).toString();
  const json = JSON.parse(jsonText);

  const dirName = path.dirname(filePath);
  const outFilePath = path.join(dirName, `.env.${path.basename(filePath, '.json')}`);
  fs.writeFileSync(
    outFilePath,
    `
FIREBASE_PROJECT_ID=${JSON.stringify(json.project_id)}
FIREBASE_PRIVATE_KEY_ID=${JSON.stringify(json.private_key_id)}
FIREBASE_PRIVATE_KEY=${JSON.stringify(json.private_key)}
FIREBASE_CLIENT_EMAIL=${JSON.stringify(json.client_email)}
FIREBASE_CLIENT_ID=${JSON.stringify(json.client_id)}
FIREBASE_AUTH_URI=${JSON.stringify(json.auth_uri)}
FIREBASE_TOKEN_URI=${JSON.stringify(json.token_uri)}
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=${JSON.stringify(json.auth_provider_x509_cert_url)}
FIREBASE_CLIENT_X509_CERT_URL=${JSON.stringify(json.client_x509_cert_url)}
`.trim()
  );
  console.log(outFilePath);
}
