import { getStore } from "@netlify/blobs";

const MAX_VISITS_RETURNED = 300;

const handler = async (req) => {
  const url = new URL(req.url);
  const providedKey = req.headers.get("x-dashboard-key") || url.searchParams.get("key");

  if (!process.env.DASHBOARD_SECRET || providedKey !== process.env.DASHBOARD_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const store = getStore("visitor-log");
    const { blobs } = await store.list({ prefix: "visit:" });

    const sortedKeys = blobs.map((b) => b.key).sort().reverse();

    const allVisits = await Promise.all(
      sortedKeys.map(async (key) => ({
        key,
        ...(await store.get(key, { type: "json" })),
      }))
    );

    const isMe = (v) => (v.tag || "").trim().toLowerCase() === "me";
    const totalVisits = allVisits.filter((v) => !isMe(v)).length;

    return new Response(
      JSON.stringify({
        totalVisits,
        taggedAsMe: allVisits.length - totalVisits,
        visits: allVisits.slice(0, MAX_VISITS_RETURNED),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export default handler;
