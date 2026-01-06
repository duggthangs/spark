import index from "./index.html";

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
