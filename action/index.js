const core = require('@actions/core');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  // Set the output variable `time`, which can be used by other actions
  core.setOutput("time", time);
  // Optionally, you can also set an action's result as a success/failure
  core.setSuccess("Action completed successfully");
} catch (error) {
  core.setFailed(error.message);
}