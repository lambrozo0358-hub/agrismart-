head -n -25 server.ts > server_fixed.ts
cat << 'INNEREOF' >> server_fixed.ts
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  if (!process.env.NETLIFY) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Agrisma Server] Full-Stack listening at http://0.0.0.0:${PORT}`);
    });
  }
}
setupVite();
export default app;
INNEREOF
mv server_fixed.ts server.ts
