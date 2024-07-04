const core = require('@actions/core');

try {
  // `who-to-greet` input defined in action metadata file
  const nameToGreet = core.getInput('who-to-greet');
  console.log(`Hello ${nameToGreet}!`);
  const time = (new Date()).toTimeString();
  // Set the output variable `time`, which can be used by other actions
  core.setOutput("time", time);
} catch (error) {
  core.setFailed(error.message);
}