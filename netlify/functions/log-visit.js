import { getStore } from "@netlify/blobs";

const NOTIFY_THROTTLE_MS = 60 * 60 * 1000; // don't email more than once/hour per IP

async function lookupLocation(ip) {
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city`
    );
    const data = await res.json();
    if (data.status !== "success") return "Unknown location";
    return [data.city, data.regionName, data.country].filter(Boolean).join(", ");
  } catch {
    return "Unknown location";
  }
}

function parseDevice(ua) {
  if (!ua) return "Unknown device";

  let os = "Unknown OS";
  if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS X/i.test(ua)) os = "macOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Unknown browser";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(ua)) browser = "Opera";
  else if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) browser = "Chrome";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";

  const deviceType = /Mobi|Android|iPhone|iPad/i.test(ua) ? "Mobile" : "Desktop";

  return `${browser} on ${os} (${deviceType})`;
}

async function sendEmailNotification({ location, device, time }) {
  const { EMAILJS_SERVICE_ID, EMAILJS_VISITOR_TEMPLATE_ID, EMAILJS_PUBLIC_KEY, SITE_URL } =
    process.env;
  if (!EMAILJS_SERVICE_ID || !EMAILJS_VISITOR_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) return;

  await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: SITE_URL || "https://rakesh-sp-portfolio.netlify.app",
    },
    body: JSON.stringify({
      service_id: EMAILJS_SERVICE_ID,
      template_id: EMAILJS_VISITOR_TEMPLATE_ID,
      user_id: EMAILJS_PUBLIC_KEY,
      template_params: {
        location,
        device,
        time,
      },
    }),
  });
}

const handler = async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const ip = context.ip || "unknown";
    const device = parseDevice(req.headers.get("user-agent"));
    const location = await lookupLocation(ip);
    const now = new Date();

    const throttleStore = getStore("visitor-throttle");
    const lastNotifiedRaw = await throttleStore.get(ip);
    const lastNotified = lastNotifiedRaw ? Number(lastNotifiedRaw) : 0;

    if (Date.now() - lastNotified > NOTIFY_THROTTLE_MS) {
      await sendEmailNotification({
        location,
        device,
        time: now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
      await throttleStore.set(ip, String(Date.now()));
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export default handler;
