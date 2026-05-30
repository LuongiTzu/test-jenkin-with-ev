const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const reportFile = process.argv[2];
const serviceName = process.argv[3] || "unknown-service";

if (!reportFile) {
  console.error("Missing report file.");
  console.error("Example: node create-jira-bugs.js transaction-report.json transaction-service");
  process.exit(1);
}

if (!fs.existsSync(reportFile)) {
  console.error(`Report file not found: ${reportFile}`);
  process.exit(1);
}

const {
  JIRA_BASE_URL,
  JIRA_EMAIL,
  JIRA_API_TOKEN,
  JIRA_PROJECT_KEY,
  JIRA_SERVICE_ISSUE_TYPE,
  JIRA_AUTOMATION_ISSUE_TYPE,
  JIRA_BUG_ISSUE_TYPE
} = process.env;

if (!JIRA_BASE_URL || !JIRA_EMAIL || !JIRA_API_TOKEN || !JIRA_PROJECT_KEY) {
  console.error("Missing Jira configuration in .env file.");
  process.exit(1);
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");

const jira = axios.create({
  baseURL: JIRA_BASE_URL,
  headers: {
    Authorization: `Basic ${auth}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  }
});

const report = JSON.parse(fs.readFileSync(reportFile, "utf8"));

function toADF(text) {
  return {
    type: "doc",
    version: 1,
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text
          }
        ]
      }
    ]
  };
}

function safeLabel(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 40);
}

function buildRequestPathMap(collection) {
  const map = {};

  function walk(items = [], path = []) {
    for (const item of items) {
      if (item.item) {
        walk(item.item, [...path, item.name]);
      } else {
        if (item.id) {
          map[item.id] = [...path, item.name];
        }

        if (item.name) {
          map[item.name] = [...path, item.name];
        }
      }
    }
  }

  walk(collection?.item || []);
  return map;
}

const requestPathMap = buildRequestPathMap(report.collection);

function getPathFromExecution(execution) {
  const itemId = execution.item?.id;
  const itemName = execution.item?.name;

  if (itemId && requestPathMap[itemId]) {
    return requestPathMap[itemId];
  }

  if (itemName && requestPathMap[itemName]) {
    return requestPathMap[itemName];
  }

  return [serviceName, "Unknown Flow", itemName || "Unknown Request"];
}

function getFlowNameFromPath(path) {
  const serviceIndex = path.findIndex(part => part === serviceName);

  if (serviceIndex >= 0) {
    const foldersAfterService = path.slice(serviceIndex + 1, -1);

    if (foldersAfterService.length > 0) {
      return foldersAfterService[foldersAfterService.length - 1];
    }
  }

  if (path.length >= 2) {
    return path[path.length - 2];
  }

  return `${serviceName} Flow`;
}

function createFingerprint(failure) {
  const raw = `${serviceName}|${failure.flowName}|${failure.requestName}|${failure.method}|${failure.testName}`;
  const hash = crypto.createHash("md5").update(raw).digest("hex").substring(0, 12);

  return {
    raw,
    label: `fp-${hash}`
  };
}

function getFailures(report) {
  const failures = [];
  const executions = report.run?.executions || [];

  for (const execution of executions) {
    const path = getPathFromExecution(execution);
    const flowName = getFlowNameFromPath(path);

    const requestName = execution.item?.name || path[path.length - 1] || "Unknown request";
    const method = execution.request?.method || "UNKNOWN";
    const url = execution.request?.url?.raw || "Unknown URL";
    const statusCode = execution.response?.code || "No response";
    const responseTime = execution.response?.responseTime || "N/A";
    const assertions = execution.assertions || [];

    for (const assertion of assertions) {
      if (assertion.error) {
        failures.push({
          flowName,
          requestName,
          method,
          url,
          statusCode,
          responseTime,
          testName: assertion.assertion || "Unknown test",
          errorMessage: assertion.error.message || "Unknown error"
        });
      }
    }

    if (execution.requestError) {
      failures.push({
        flowName,
        requestName,
        method,
        url,
        statusCode: "Request Error",
        responseTime,
        testName: "Request failed before assertion",
        errorMessage: execution.requestError.message || "Unknown request error"
      });
    }
  }

  return failures;
}

async function searchIssueBySummary(summary, labels = []) {
  const labelJql = labels.map(label => `AND labels = ${label}`).join(" ");
  const escapedSummary = summary.replace(/"/g, '\\"');

  const jql = `project = ${JIRA_PROJECT_KEY} AND summary ~ "${escapedSummary}" ${labelJql} AND statusCategory != Done`;

  const res = await jira.get("/rest/api/3/search/jql", {
    params: {
      jql,
      maxResults: 1,
      fields: "summary,status,parent"
    }
  });

  return res.data.issues?.[0] || null;
}

async function searchIssueByFingerprint(fingerprintLabel, automationIssueKey) {
  const jql =
    `project = ${JIRA_PROJECT_KEY} ` +
    `AND parent = ${automationIssueKey} ` +
    `AND labels = api-test ` +
    `AND labels = ${fingerprintLabel} ` +
    `AND statusCategory != Done`;

  const res = await jira.get("/rest/api/3/search/jql", {
    params: {
      jql,
      maxResults: 1,
      fields: "summary,status,parent"
    }
  });

  return res.data.issues?.[0] || null;
}

async function createIssue({ summary, description, issueType, labels, parentKey }) {
  const fields = {
    project: {
      key: JIRA_PROJECT_KEY
    },
    summary,
    description: toADF(description),
    issuetype: {
      name: issueType
    },
    labels
  };

  if (parentKey) {
    fields.parent = {
      key: parentKey
    };
  }

  const res = await jira.post("/rest/api/3/issue", { fields });
  return res.data;
}

async function addComment(issueKey, text) {
  await jira.post(`/rest/api/3/issue/${issueKey}/comment`, {
    body: toADF(text)
  });
}

async function getOrCreateServiceIssue() {
  const serviceLabel = safeLabel(serviceName);
  const summary = serviceName;

  const existing = await searchIssueBySummary(summary, [
    "api-test-service",
    serviceLabel
  ]);

  if (existing) {
    console.log(`Existing service issue found: ${existing.key}`);
    return existing.key;
  }

  const issue = await createIssue({
    summary,
    description: `Parent service issue for automation testing: ${serviceName}.`,
    issueType: JIRA_SERVICE_ISSUE_TYPE || "Epic",
    labels: ["api-test-service", serviceLabel]
  });

  console.log(`Created service issue: ${issue.key}`);
  return issue.key;
}

async function getOrCreateAutomationIssue(serviceIssueKey, flowName) {
  const serviceLabel = safeLabel(serviceName);
  const flowLabel = safeLabel(flowName);
  const summary = `[Automation Test] Flow: ${flowName}`;

  const existing = await searchIssueBySummary(summary, [
    "api-test-run",
    serviceLabel,
    flowLabel
  ]);

  if (existing) {
    console.log(`Existing automation task found for "${flowName}": ${existing.key}`);
    return existing.key;
  }

  const issue = await createIssue({
    summary,
    description:
`Automation test task for service: ${serviceName}

Test flow:
${flowName}

Report file:
${reportFile}`,
    issueType: JIRA_AUTOMATION_ISSUE_TYPE || "Task",
    labels: ["api-test-run", serviceLabel, flowLabel],
    parentKey: serviceIssueKey
  });

  console.log(`Created automation task for "${flowName}": ${issue.key}`);
  return issue.key;
}

async function createBugIssue(failure, fingerprint, automationIssueKey) {
  const serviceLabel = safeLabel(serviceName);
  const flowLabel = safeLabel(failure.flowName);

  const summary = `[Bug] Failed Request: ${failure.requestName} - ${failure.testName}`.substring(0, 200);

  const description =
`Service: ${serviceName}
Test flow: ${failure.flowName}

Request: ${failure.requestName}
Method: ${failure.method}
URL: ${failure.url}
Status code: ${failure.statusCode}
Response time: ${failure.responseTime}

Failed test:
${failure.testName}

Error:
${failure.errorMessage}

Fingerprint:
${fingerprint.raw}

Source report:
${reportFile}`;

  const issue = await createIssue({
    summary,
    description,
    issueType: JIRA_BUG_ISSUE_TYPE || "Subbug",
    labels: [
      "api-test",
      "newman",
      serviceLabel,
      flowLabel,
      fingerprint.label
    ],
    parentKey: automationIssueKey
  });

  return issue;
}

async function main() {
  const failures = getFailures(report);

  console.log(`Service: ${serviceName}`);
  console.log(`Total failed assertions found: ${failures.length}`);

  if (failures.length === 0) {
    console.log("No failed assertions found. No Jira issue will be created.");
    return;
  }

  const groupedByFlow = {};

  for (const failure of failures) {
    if (!groupedByFlow[failure.flowName]) {
      groupedByFlow[failure.flowName] = [];
    }

    groupedByFlow[failure.flowName].push(failure);
  }

  console.log("Failed flows:");
  for (const [flowName, flowFailures] of Object.entries(groupedByFlow)) {
    console.log(`- ${flowName}: ${flowFailures.length} failure(s)`);
  }

  let serviceIssueKey;

  try {
    serviceIssueKey = await getOrCreateServiceIssue();
  } catch (err) {
    console.error("Failed to create or find service issue.");
    console.error(err.response?.data || err.message);
    process.exit(1);
  }

  for (const [flowName, flowFailures] of Object.entries(groupedByFlow)) {
    let automationIssueKey;

    try {
      automationIssueKey = await getOrCreateAutomationIssue(serviceIssueKey, flowName);
    } catch (err) {
      console.error(`Failed to create or find automation task for flow: ${flowName}`);
      console.error(err.response?.data || err.message);
      continue;
    }

    for (const failure of flowFailures) {
      const fingerprint = createFingerprint(failure);

      try {
        const existingIssue = await searchIssueByFingerprint(
          fingerprint.label,
          automationIssueKey
        );

        if (existingIssue) {
          console.log(`Existing bug found: ${existingIssue.key}. Duplicate issue will not be created.`);

          const now = new Date();
          const retestTime = now.toLocaleString("vi-VN", {
            timeZone: "Asia/Ho_Chi_Minh",
            hour12: false,
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          await addComment(
            existingIssue.key,
            `Retest: still failed - ${retestTime}`
          );

          console.log(`Added retest comment to ${existingIssue.key}`);
          continue;
        }

        const issue = await createBugIssue(failure, fingerprint, automationIssueKey);
        console.log(`Created bug issue: ${issue.key}`);
      } catch (err) {
        console.error("Failed to process Jira bug issue.");
        console.error(err.response?.data || err.message);
      }
    }
  }
}

main();