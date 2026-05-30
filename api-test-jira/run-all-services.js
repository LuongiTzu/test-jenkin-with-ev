const { execSync } = require("child_process");

const services = [
  {
    serviceName: "transaction-service",
    flowName: "Transaction Flow",
    reportFile: "transaction-report.json"
  },
  {
    serviceName: "station-service",
    flowName: "Station Flow",
    reportFile: "station-report.json"
  },
  {
    serviceName: "users-service",
    flowName: "Users Flow",
    reportFile: "users-report.json"
  },
  {
    serviceName: "battery-service",
    flowName: "Battery Flow",
    reportFile: "battery-report.json"
  }
];

function runCommand(command) {
  console.log("\n==================================================");
  console.log(command);
  console.log("==================================================\n");

  execSync(command, {
    stdio: "inherit",
    shell: true
  });
}

function main() {
  for (const service of services) {
    const { serviceName, flowName, reportFile } = service;

    console.log(`\nRunning service: ${serviceName}`);

    runCommand(
      `npx newman run kcpm.postman_collection.json --folder "${serviceName}" -r "cli,json" --reporter-json-export ${reportFile}`
    );

    runCommand(
      `node create-jira-bugs.js ${reportFile} ${serviceName} "${flowName}"`
    );
  }

  runCommand("node export-weekly-report.js");

  console.log("\nAll services completed.");
}

main();