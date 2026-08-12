const testLog = [];
function log(msg) {
  console.log(msg);
  testLog.push(msg);
}

// 1. Direct Deleted Bundle URL
// We assume there's no bundle yet, we'll hit the frontend directly with curl.

// To perform these tests we need the app to be running. We will do this via a bash script or run_command.
