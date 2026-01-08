import { parseArgs } from "node:util";
import { startServer } from "./server";

const args = Bun.argv.slice(2);

const { values, positionals } = parseArgs({
  args,
  options: {
    port: {
      type: "string",
      short: "p",
    },
    open: {
      type: "boolean",
      default: true,
    },
    local: {
      type: "boolean",
      default: false,
    },
  },
  allowPositionals: true,
  allowNegative: true,
});

const command = positionals[0];
const file = positionals[1];

async function main() {
  if (command === 'run') {
    if (!file) {
      console.error("Usage: iaee run <file>");
      process.exit(1);
    }
    const port = values.port ? parseInt(values.port) : 3000;
    const explicitPort = !!values.port;
    const open = values.open ?? true;
    const local = values.local ?? false;
    await startServer(file, port, open, explicitPort, local);
  } else {
    console.log("IAEE CLI");
    console.log("Usage: iaee run <file> [--port 3000] [--no-open] [--local]");
    process.exit(1);
  }
}

main();
