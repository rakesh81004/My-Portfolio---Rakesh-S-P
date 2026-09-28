import { getStore } from "@netlify/blobs";

const handler = async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const providedKey = req.headers.get("x-dashboard-key");
  if (!process.env.DASHBOARD_SECRET || providedKey !== process.env.DASHBOARD_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { visitKey, tag } = await req.json();
    if (!visitKey || !visitKey.startsWith("visit:")) {
      return new Response(JSON.stringify({ error: "Invalid visitKey" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const store = getStore("visitor-log");
    const existing = await store.get(visitKey, { type: "json" });
    if (!existing) {
      return new Response(JSON.stringify({ error: "Visit not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await store.setJSON(visitKey, { ...existing, tag: tag?.trim() || null });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export default handler;
