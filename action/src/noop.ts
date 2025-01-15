import { execSync } from "child_process";

console.log(">>> start");

execSync("pwd", { stdio: "inherit" });
execSync("ls -la", { stdio: "inherit" });
execSync("git branch", { stdio: "inherit" });
execSync("git status", { stdio: "inherit" });
execSync("git remote -v", { stdio: "inherit" });

console.log(">>> end");
