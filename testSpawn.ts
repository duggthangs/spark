
export async function runExperience() {
  const proc = Bun.spawn([
    "bun",
    "cli/index.ts",
    "run",
    "examples/demo.json"
  ], {
    stdout: "pipe",
    stderr: "inherit",
    stdin: "inherit"
  });

  const text = await new Response(proc.stdout).text();
  await proc.exited;

  if (proc.exitCode !== 0) {
    throw new Error(`Experience builder exited with code ${proc.exitCode}`);
  }

  console.log('==recieved==')
  console.log(text)
  console.log('==end==')
}

await runExperience()
