import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Card, ThemeProvider } from "@tomny-dev/uzi";
import "@tomny-dev/uzi/styles.css";

type Item = { id: number; title: string };

function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [status, setStatus] = useState("Loading...");

  async function load() {
    try {
      const response = await fetch("/api/items");
      if (!response.ok) throw new Error("API failed");
      const data = (await response.json()) as { items: Item[] };
      setItems(data.items);
      setStatus(data.items.length ? "" : "No items yet");
    } catch {
      setStatus("API unavailable. Apply the local migration first.");
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <ThemeProvider defaultTheme="system" defaultAccent="blue">
      <main style={{ maxWidth: 720, margin: "4rem auto", padding: "1rem" }}>
        <Card padding="md">
          <h1>Uzi + Cloudflare Workers + D1</h1>
          <p>Items from a D1-backed Worker API:</p>
          <ul>{items.map((item) => <li key={item.id}>{item.title}</li>)}</ul>
          <p role="status">{status}</p>
          <Button onClick={() => void load()}>Refresh</Button>
        </Card>
      </main>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
