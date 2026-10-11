/**
 * Driver GPS Simulator
 * Simulates real-time vehicle movement between Bandra and CST in Mumbai
 * Run with: node scripts/driver-simulator.ts or npx ts-node scripts/driver-simulator.ts
 */

const BASE_URL = process.env.APP_URL || "http://localhost:3000";

const ROUTE_POINTS = [
  { lat: 19.0657, lng: 72.8687 }, // Bandra
  { lat: 19.0522, lng: 72.8315 },
  { lat: 19.0178, lng: 72.8478 }, // Dadar
  { lat: 18.9750, lng: 72.8258 }, // Byculla
  { lat: 18.9401, lng: 72.8347 }, // CST Terminus
];

async function updateDriverLocation(point: { lat: number; lng: number }) {
  try {
    const res = await fetch(`${BASE_URL}/api/driver/location`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: "ridely_user_id=driver_1",
      },
      body: JSON.stringify({
        lat: point.lat,
        lng: point.lng,
        heading: 180,
        speed: 35,
      }),
    });
    const data = await res.json();
    console.log(`[Simulator] Driver location updated -> lat: ${point.lat}, lng: ${point.lng}`, data.ok ? "✓" : "✗");
  } catch (err) {
    console.warn("[Simulator] Could not connect to API server. Ensure server is running on " + BASE_URL);
  }
}

async function runSimulation() {
  console.log("🚗 Starting Ridely Driver Simulator (Mumbai Route)...");
  let idx = 0;
  setInterval(async () => {
    await updateDriverLocation(ROUTE_POINTS[idx]);
    idx = (idx + 1) % ROUTE_POINTS.length;
  }, 4000);
}

runSimulation();

