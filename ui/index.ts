import index from "./index.html";
import { openBrowser } from "../cli/open-browser";

const server = Bun.serve({
  routes: {
    "/": index,
    // Add other routes or API mocks here if needed
  },
  development: {
    hmr: true,
  },
  port: 3001,
});

console.log(`Listening on http://localhost:${server.port}`);
openBrowser(`http://localhost:${server.port}`);
