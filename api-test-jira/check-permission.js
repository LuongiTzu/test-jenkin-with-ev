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
      `${JIRA_BASE_URL}/rest/api/3/mypermissions?projectKey=${JIRA_PROJECT_KEY}&permissions=CREATE_ISSUES,BROWSE_PROJECTS`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json"
        }
      }
    );

    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

main();