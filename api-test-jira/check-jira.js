const axios = require("axios");
require("dotenv").config();

const {
  JIRA_BASE_URL,
  JIRA_EMAIL,
  JIRA_API_TOKEN
} = process.env;

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

async function main() {
  try {
    const res = await axios.get(
      `${JIRA_BASE_URL}/rest/api/3/project/search`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json"
        }
      }
    );

    console.log("Các project tài khoản/token này truy cập được:");

    for (const project of res.data.values) {
      console.log(`${project.key} - ${project.name}`);
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}

main();