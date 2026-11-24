import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const localUrl = "http://127.0.0.1:5173";
const children = [];
const useProcessGroups = process.platform !== "win32";
let connectedByScript = false;
let stopping = false;

function tailscale(...args) {
  return execFileSync("tailscale", args, { encoding: "utf8" });
}

function signalChild(child, signal) {
  try {
    // Include subprocesses started by CLI wrappers, such as Tailscale on macOS.
    if (useProcessGroups) process.kill(-child.pid, signal);
    else child.kill(signal);
  } catch (error) {
    if (error.code !== "ESRCH") throw error;
  }
}

async function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;

  await Promise.all(
    children.map(async (child) => {
      if (!child.pid || child.exitCode !== null || child.signalCode !== null) return;
      await new Promise((resolve) => {
        const timeout = setTimeout(() => signalChild(child, "SIGKILL"), 5000);
        child.once("exit", () => {
          clearTimeout(timeout);
          resolve();
        });
        signalChild(child, "SIGINT");
      });
    }),
  );

  if (connectedByScript) {
    try {
      tailscale("down");
    } catch (error) {
      console.error("Could not disconnect Tailscale:", error.message);
      exitCode = 1;
    }
  }

  process.exit(exitCode);
}

function start(command, args, options = {}) {
  const child = spawn(command, args, {
    detached: useProcessGroups,
    stdio: ["pipe", "inherit", "inherit"],
    ...options,
  });
  children.push(child);
  child.once("error", (error) => {
    console.error(error.message);
    void stop(1);
  });
  child.once("exit", (code, signal) => {
    if (!stopping) {
      if (code !== 0) console.error(`${command} stopped: ${signal ?? code}`);
      void stop(code ?? 1);
    }
  });
  return child;
}

process.on("SIGINT", () => void stop());
process.on("SIGTERM", () => void stop());

try {
  let status = JSON.parse(tailscale("status", "--json"));
  if (status.BackendState === "Stopped") {
    connectedByScript = true;
    execFileSync("tailscale", ["up"], { stdio: "inherit" });
    status = JSON.parse(tailscale("status", "--json"));
  }
  if (status.BackendState !== "Running") {
    throw new Error("Open Tailscale and sign in before running npm run dev:tailscale.");
  }

  const hostname = status.Self?.DNSName?.replace(/\.$/, "");
  if (!hostname) throw new Error("Enable MagicDNS in Tailscale before starting TodoByAI.");

  const serveConfig = JSON.parse(tailscale("serve", "status", "--json"));
  if (Object.keys(serveConfig ?? {}).length > 0) {
    throw new Error(
      "Tailscale Serve is already configured. Stop that service before starting this one.",
    );
  }

  const vite = start(
    process.execPath,
    [
      fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url)),
      "--host",
      "127.0.0.1",
      "--port",
      "5173",
      "--strictPort",
    ],
    {
      env: { ...process.env, __VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS: hostname },
      stdio: ["pipe", "pipe", "inherit"],
    },
  );

  // Wait for Vite to announce its listening address before exposing the app.
  await new Promise((resolve) => {
    let output = "";
    vite.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      output = (output + chunk.toString()).slice(-4096);
      if (output.includes(`${localUrl}/`)) resolve();
    });
  });

  if (!stopping) {
    console.log(`\nTodoByAI: https://${hostname}/\nPress Ctrl+C to stop.\n`);
    // Foreground Serve removes its temporary proxy when the process stops.
    start("tailscale", ["serve", "--https=443", localUrl]);
  }
} catch (error) {
  console.error("Could not start TodoByAI:", error.message);
  await stop(1);
}
