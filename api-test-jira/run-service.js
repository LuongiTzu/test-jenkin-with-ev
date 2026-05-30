const fs = require("fs");
const axios = require("axios");
const { execSync } = require("child_process");
require("dotenv").config();

const {
  POSTMAN_API_KEY,
  POSTMAN_COLLECTION_ID
} = process.env;

const serviceName = process.argv[2];
const flowName = process.argv[3] || `${serviceName} Flow`;

if (!POSTMAN_API_KEY || !POSTMAN_COLLECTION_ID) {
  console.error("Missing POSTMAN_API_KEY or POSTMAN_COLLECTION_ID in .env");
  process.exit(1);
}

if (!serviceName) {
  console.error('Usage: node run-service.js transaction-service "Transaction Flow"');
  process.exit(1);
}

const collectionFile = "kcpm.latest.postman_collection.json";
const reportFile = `${serviceName.replace(/[^a-zA-Z0-9-_]/g, "-")}-report.json`;

async function downloadPostmanCollection() {
  console.log("Downloading latest collection from Postman...");

  const res = await axios.get(
    `https://api.getpostman.com/collections/${POSTMAN_COLLECTION_ID}`,
    {
      headers: {
        "X-Api-Key": POSTMAN_API_KEY
      }
    }
  );

  if (!res.data.collection) {
    throw new Error("Postman response does not contain collection data.");
  }

  fs.writeFileSync(
    collectionFile,
    JSON.stringify(res.data.collection, null, 2),
    "utf8"
  );

  console.log(`Collection saved: ${collectionFile}`);
}

function runNewman() {
  console.log(`Running Newman for service: ${serviceName}`);

  const command =
    `npx newman run ${collectionFile} ` +
    `--folder "${serviceName}" ` +
    `-r "cli,json" ` +
    `--reporter-json-export ${reportFile}`;

  console.log(command);
  execSync(command, { stdio: "inherit" });

  console.log(`Newman report exported: ${reportFile}`);
}

function pushToJira() {
  console.log("Pushing failed tests to Jira...");

  const command =
    `node create-jira-bugs.js ${reportFile} ${serviceName} "${flowName}"`;

  console.log(command);
  execSync(command, { stdio: "inherit" });
}

async function main() {
  await downloadPostmanCollection();
  runNewman();
  pushToJira();

  console.log("Done.");
}

main().catch(err => {
  console.error("Automation failed.");
  console.error(err.response?.data || err.message);
  process.exit(1);
});