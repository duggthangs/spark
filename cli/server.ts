import { join } from "path";
import { validateExperience } from "../engine/validator";
import { compileSummary } from "../engine/compiler";
import { openBrowser } from "./open-browser";

export async function startServer(filePath: string, port = 3000, open = true) {
  console.log(`Loading experience from: ${filePath}`);
  
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    console.error(`Error: File not found at ${filePath}`);
    process.exit(1);
  }

  let json;
  try {
    json = await file.json();
  } catch (error) {
    console.error(`Error: Failed to parse JSON from ${filePath}`);
    process.exit(1);
  }

  const validation = validateExperience(json);

  if (!validation.success) {
    console.error("\n❌ Validation Failed for Experience JSON:");
    validation.errors.issues.forEach((issue) => {
      const path = issue.path.join(".");
      console.error(`  - [${path}]: ${issue.message}`);
    });
    console.log("");
    process.exit(1);
  }

  const experienceData = validation.data;
  const distDir = join(process.cwd(), "ui", "dist");

  Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url);

      // API Routes
      if (url.pathname === "/api/experience" && req.method === "GET") {
        return Response.json(experienceData);
      }

      if (url.pathname === "/api/submit" && req.method === "POST") {
        try {
          const body = await req.json();

          // Extract results from the submission body
          // Expected format: { result: Record<string, any>, experienceId?: string }
          // Or directly: Record<string, any>
          let results: Record<string, any> = {};

          if (body.answers && typeof body.answers === "object") {
            results = body.answers;
          } else if (body.result && typeof body.result === "object") {
            results = body.result;
          } else if (typeof body === "object") {
            results = body;
          }

          // Compile Markdown summary
          const markdown = compileSummary(experienceData, results);

          // Print Markdown to stdout
          console.log("=".repeat(80));
          console.log(markdown);
          console.log("=".repeat(80));

          // Flush and exit
          setTimeout(() => process.exit(0), 100);
          return new Response("OK");
        } catch (e) {
          console.error("Error processing submit:", e);
          return new Response("Invalid JSON", { status: 400 });
        }
      }

      // Static Files
      let path = url.pathname;
      if (path === "/") path = "/index.html";

      // Serve index.html with injection
      if (path === "/index.html") {
        const indexFile = Bun.file(join(distDir, "index.html"));
        if (await indexFile.exists()) {
          let content = await indexFile.text();
          // Inject the runtime mode flag
          content = content.replace(
            "<head>",
            "<head><script>window.IAEE_MODE = 'runtime';</script>"
          );
          return new Response(content, {
            headers: { "Content-Type": "text/html" },
          });
        }
      }

      // Other static assets
      // Remove leading slash for join to work correctly with CWD path
      const assetPath = join(distDir, path.substring(1)); 
      const assetFile = Bun.file(assetPath);
      
      if (await assetFile.exists()) {
        return new Response(assetFile);
      }

      return new Response("Not Found", { status: 404 });
    },
  });

  console.log(`IAEE CLI running at http://localhost:${port}`);
  console.log("Press Ctrl+C to exit manually");

  if (open) {
    openBrowser(`http://localhost:${port}`);
  }
}
