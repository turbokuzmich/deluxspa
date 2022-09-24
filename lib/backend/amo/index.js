const fs = require("fs");
const path = require("path");
const { Client } = require("amocrm-js");

const client = new Client({
  domain: process.env.AMO_DOMAIN,
  auth: {
    client_id: process.env.AMO_CLIENT_ID,
    client_secret: process.env.AMO_CLIENT_SECRET,
    redirect_uri: process.env.AMO_REDIRECT,
    code: process.env.AMO_CODE,
  },
});

const tokenPath = path.resolve("./token.json");

client.token.on("change", () => {
  const token = client.token.getValue();
  fs.writeFileSync(tokenPath, JSON.stringify(token));
});

try {
  client.token.setValue(JSON.parse(fs.readFileSync(tokenPath).toString()));
} catch (e) {}

export default client;
