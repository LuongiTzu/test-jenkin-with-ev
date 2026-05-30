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
    const body = {
      fields: {
        project: {
          key: JIRA_PROJECT_KEY
        },
        summary: "Test auto create issue from Node.js",
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Issue này được tạo tự động bằng script Node.js."
                }
              ]
            }
          ]
        },
        issuetype: {
          name: "Task"
        }
      }
    };

    const res = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      body,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Tạo thành công:", res.data.key);
  } catch (err) {
    console.error("Tạo thất bại:");
    console.error(err.response?.data || err.message);
  }
}

main();