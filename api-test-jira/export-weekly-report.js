const axios = require("axios");
const ExcelJS = require("exceljs");
require("dotenv").config();

const {
  JIRA_BASE_URL,
  JIRA_EMAIL,
  JIRA_API_TOKEN,
  JIRA_PROJECT_KEY
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

function getServiceName(labels = []) {
  const serviceLabel = labels.find(label => label.endsWith("-service"));
  return serviceLabel || "unknown-service";
}

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false
  });
}

async function fetchWeeklySubbugs() {
  const issues = [];
  let nextPageToken = undefined;

  const jql =
    `project = ${JIRA_PROJECT_KEY} ` +
    `AND issuetype = Subbug ` +
    `AND labels = api-test ` +
    `AND updated >= startOfWeek() ` +
    `ORDER BY labels ASC, status ASC, updated DESC`;

  while (true) {
    const params = {
      jql,
      maxResults: 100,
      fields: "summary,status,parent,priority,assignee,reporter,created,updated,labels"
    };

    if (nextPageToken) {
      params.nextPageToken = nextPageToken;
    }

    const res = await jira.get("/rest/api/3/search/jql", { params });

    issues.push(...(res.data.issues || []));

    if (!res.data.nextPageToken) {
      break;
    }

    nextPageToken = res.data.nextPageToken;
  }

  return issues;
}

function addHeaderStyle(worksheet) {
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center"
  };

  worksheet.columns.forEach(column => {
    column.width = 24;
  });
}

function addSummarySheet(workbook, groupedIssues) {
  const worksheet = workbook.addWorksheet("Summary");

  worksheet.columns = [
    { header: "Service", key: "service" },
    { header: "Total bugs", key: "total" },
    { header: "Fixed", key: "fixed" },
    { header: "Not fixed", key: "notFixed" },
    { header: "In progress", key: "inProgress" },
    { header: "Completion rate", key: "rate" }
  ];

  for (const [serviceName, issues] of Object.entries(groupedIssues)) {
    const total = issues.length;

    const fixed = issues.filter(issue => {
      return issue.fields.status?.statusCategory?.name === "Done";
    }).length;

    const inProgress = issues.filter(issue => {
      return issue.fields.status?.statusCategory?.name === "In Progress";
    }).length;

    const notFixed = total - fixed;

    const rate = total === 0
      ? "0%"
      : `${Math.round((fixed / total) * 100)}%`;

    worksheet.addRow({
      service: serviceName,
      total,
      fixed,
      notFixed,
      inProgress,
      rate
    });
  }

  addHeaderStyle(worksheet);
}

function addBugSheet(workbook, serviceName, issues) {
  const sheetName = serviceName.substring(0, 31);
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = [
    { header: "Key", key: "key" },
    { header: "Summary", key: "summary" },
    { header: "Status", key: "status" },
    { header: "Fix status", key: "fixStatus" },
    { header: "Parent", key: "parent" },
    { header: "Priority", key: "priority" },
    { header: "Assignee", key: "assignee" },
    { header: "Reporter", key: "reporter" },
    { header: "Created", key: "created" },
    { header: "Updated", key: "updated" },
    { header: "Labels", key: "labels" }
  ];

  for (const issue of issues) {
    const status = issue.fields.status?.name || "";
    const statusCategory = issue.fields.status?.statusCategory?.name || "";

    let fixStatus = "Not fixed";

    if (statusCategory === "Done") {
      fixStatus = "Fixed";
    } else if (statusCategory === "In Progress") {
      fixStatus = "In progress";
    }

    worksheet.addRow({
      key: issue.key,
      summary: issue.fields.summary || "",
      status,
      fixStatus,
      parent: issue.fields.parent?.key || "",
      priority: issue.fields.priority?.name || "",
      assignee: issue.fields.assignee?.displayName || "Unassigned",
      reporter: issue.fields.reporter?.displayName || "",
      created: formatDate(issue.fields.created),
      updated: formatDate(issue.fields.updated),
      labels: (issue.fields.labels || []).join(", ")
    });
  }

  addHeaderStyle(worksheet);
}

async function main() {
  console.log("Fetching weekly Subbugs from Jira...");

  const issues = await fetchWeeklySubbugs();

  console.log(`Total weekly Subbugs found: ${issues.length}`);

  const groupedIssues = {};

  for (const issue of issues) {
    const serviceName = getServiceName(issue.fields.labels || []);

    if (!groupedIssues[serviceName]) {
      groupedIssues[serviceName] = [];
    }

    groupedIssues[serviceName].push(issue);
  }

  const workbook = new ExcelJS.Workbook();

  addSummarySheet(workbook, groupedIssues);

  for (const [serviceName, serviceIssues] of Object.entries(groupedIssues)) {
    addBugSheet(workbook, serviceName, serviceIssues);
  }

  const fileName = `weekly-api-test-report-${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;

  await workbook.xlsx.writeFile(fileName);

  console.log(`Weekly report exported: ${fileName}`);
}

main().catch(err => {
  console.error("Failed to export weekly report.");
  console.error(err.response?.data || err.message);
});