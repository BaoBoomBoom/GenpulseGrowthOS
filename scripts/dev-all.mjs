import { spawn } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  child.on("exit", (code) => {
    console.log(`[${name}] exited`, code);
    process.exit(code ?? 1);
  });
  return child;
}

run("api", "npm", ["run", "start"], join(root, "server"));
run("web", "npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "5190"], join(root, "web"));
