import { validateExperience } from "../engine/validator";
import { compileSummary } from "../engine/compiler";
import { openBrowser } from "./open-browser";

// Embed assets at compile time - these become part of the binary
// @ts-ignore - Bun's type definitions don't match runtime behavior
import indexHtmlPath from "../ui/dist/index.html" with { type: "file" };
// @ts-ignore - Bun's type definitions don't match runtime behavior
import indexJsPath from "../ui/dist/index.js" with { type: "file" };

const MAX_PORT_ATTEMPTS = 20;

async function getLocalIP(): Promise<string | null> {
  try {
    // Try en0 first (usually WiFi on macOS)
    const proc = Bun.spawn(["ipconfig", "getifaddr", "en0"]);
    const text = await new Response(proc.stdout).text();
    const ip = text.trim();
    if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
      return ip;
    }
  } catch (e) {
    // Ignore error, try next interface
  }

  try {
    // Try en1 as fallback (might be Ethernet or WiFi)
    const proc = Bun.spawn(["ipconfig", "getifaddr", "en1"]);
    const text = await new Response(proc.stdout).text();
    const ip = text.trim();
    if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
      return ip;
    }
  } catch (e) {
    // Ignore error
  }

  return null;
}

export async function startServer(
  filePath: string,
  port = 3000,
  open = true,
  explicitPort = false,
  local = false
) {
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

  // Try to start server, auto-incrementing port if needed
  let actualPort = port;
  let server: ReturnType<typeof Bun.serve> | null = null;
  const hostname = local ? "0.0.0.0" : "localhost";

  for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt++) {
    try {
      server = Bun.serve({
        port: actualPort,
        hostname,
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
              // Expected format: { answers: Record<string, any>, comments?: Record<string, string>, experienceId?: string }
              let results: Record<string, any> = {};
              let comments: Record<string, string> | undefined;

              if (body.answers && typeof body.answers === "object") {
                results = body.answers;
              } else if (body.result && typeof body.result === "object") {
                results = body.result;
              } else if (typeof body === "object") {
                results = body;
              }

              // Extract comments if present
              if (body.comments && typeof body.comments === "object") {
                comments = body.comments;
              }

              // Compile Markdown summary
              const markdown = compileSummary(experienceData, results, comments);

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

          // Serve index.html with runtime mode injection
          if (url.pathname === "/" || url.pathname === "/index.html") {
            // @ts-ignore - Bun's type definitions are incorrect; indexHtmlPath is a string at runtime
            let content = await Bun.file(indexHtmlPath).text();
            content = content.replace(
              "<head>",
              "<head><script>window.IAEE_MODE = 'runtime';</script>"
            );
            return new Response(content, {
              headers: { "Content-Type": "text/html" },
            });
          }

          // Serve embedded JS bundle
          if (url.pathname === "/index.js") {
            // @ts-ignore - Bun's type definitions are incorrect; indexJsPath is a string at runtime
            return new Response(Bun.file(indexJsPath), {
              headers: { "Content-Type": "application/javascript" },
            });
          }

          return new Response("Not Found", { status: 404 });
        },
      });
      
      // Success - break out of retry loop
      break;
    } catch (err: any) {
      if (err?.code === "EADDRINUSE") {
        if (explicitPort) {
          // User explicitly specified this port, don't auto-increment
          console.error(`Error: Port ${actualPort} is already in use.`);
          process.exit(1);
        }
        // Auto-increment mode - try next port
        console.log(`Port ${actualPort} in use, trying ${actualPort + 1}...`);
        actualPort++;
        continue;
      }
      // Other error - rethrow
      throw err;
    }
  }

  if (!server) {
    console.error(
      `Error: Could not find available port after ${MAX_PORT_ATTEMPTS} attempts (${port}-${port + MAX_PORT_ATTEMPTS - 1})`
    );
    process.exit(1);
  }

  // Display server URLs
  if (local) {
    const localIP = await getLocalIP();
    if (localIP) {
      console.log(`IAEE CLI running at http://${localIP}:${actualPort}`);
    } else {
      console.warn("Could not detect local IP address");
      console.log(`IAEE CLI running at http://0.0.0.0:${actualPort}`);
    }
  } else {
    console.log(`IAEE CLI running at http://localhost:${actualPort}`);
  }
  console.log("Press Ctrl+C to exit manually");

  if (open) {
    openBrowser(`http://localhost:${actualPort}`);
  }
}
