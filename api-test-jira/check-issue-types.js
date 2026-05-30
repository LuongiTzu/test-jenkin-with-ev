const axios = require("axios");
require("dotenv").config();

const {
  JIRA_BASE_URL,
  JIRA_EMAIL,
  JIRA_API_TOKEN,
  JIRA_PROJECT_KEY
} = process.env;

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

async function main() {
  try {
    const res = await axios.get(
      `${JIRA_BASE_URL}/rest/api/3/issue/createmeta?projectKeys=${JIRA_PROJECT_KEY}&expand=projects.issuetypes`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json"
        }
      }
    );

    const project = res.data.projects[0];

    console.log(`Project: ${project.key} - ${project.name}`);
    console.log("Issue types tạo được:");

    for (const type of project.issuetypes) {
      console.log(`- ${type.name}`);
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

main();