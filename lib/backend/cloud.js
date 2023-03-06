import { Session, serviceClients, cloudApi } from "@yandex-cloud/nodejs-sdk";

const { SecretServiceClient, PayloadServiceClient } = serviceClients;
const {
  lockbox: {
    secret_service: { GetSecretRequest, AddVersionRequest },
    payload_service: { GetPayloadRequest },
  },
} = cloudApi;

const session = new Session({ oauthToken: process.env.YC_OAUTH_TOKEN });
const secretService = session.client(SecretServiceClient);
const payloadService = session.client(PayloadServiceClient);

async function getLatestSecretVersion(secretId) {
  const {
    currentVersion: { id },
  } = await secretService.get(GetSecretRequest.fromPartial({ secretId }));

  const { entries } = await payloadService.get(
    GetPayloadRequest.fromPartial({ secretId, versionId: id })
  );

  return entries;
}

const getLatestSecretVersionCached = (function () {
  const secrets = {};

  return async function getLatestSecretVersionCached(secretId, key) {
    if (key in secrets) {
      if (secrets[key].fetched) {
        return secrets[key].result;
      } else {
        return new Promise((resolve) => {
          secrets[key].resolves.push(resolve);
        });
      }
    }

    secrets[key] = { fetched: false, resolves: [], result: null };

    const entries = await getLatestSecretVersion(secretId);

    const result = entries.reduce(
      (result, { key, textValue }) => ({ ...result, [key]: textValue }),
      {}
    );

    const { resolves } = secrets[key];

    secrets[key].resolves = [];
    secrets[key].fetched = true;
    secrets[key].result = result;

    setTimeout(() => {
      delete secrets[key];
    }, 2 * 60 * 1000); // cache for 2 minutes

    resolves.forEach((resolve) => resolve(result));

    return result;
  };
})();

export async function getEmails(email, key) {
  return Object.keys(
    await getLatestSecretVersionCached(
      process.env.LOCKBOX_EMAILS_SECRET_ID,
      key
    )
  ).filter((key) => key.includes(email));
}

export async function getEmailPassword(email) {
  return (
    await getLatestSecretVersion(process.env.LOCKBOX_EMAILS_SECRET_ID)
  ).reduce(
    (result, { key, textValue }) => ({ ...result, [key]: textValue }),
    {}
  )[email];
}

export async function addEmailPassword(email, password) {
  const entries = (
    await getLatestSecretVersion(process.env.LOCKBOX_EMAILS_SECRET_ID)
  ).reduce(
    (entries, { key, textValue }) => ({ ...entries, [key]: textValue }),
    {}
  );

  const payloadEntries = Object.entries({ ...entries, [email]: password }).map(
    ([key, textValue]) => ({ key, textValue })
  );

  await secretService.addVersion(
    AddVersionRequest.fromPartial({
      payloadEntries,
      description: `Set ${email}`,
      secretId: process.env.LOCKBOX_EMAILS_SECRET_ID,
    })
  );
}

export async function getSitePassword(site) {
  return (
    await getLatestSecretVersion(process.env.LOCKBOX_SITES_SECRET_ID)
  ).reduce(
    (result, { key, textValue }) => ({ ...result, [key]: textValue }),
    {}
  )[site];
}
