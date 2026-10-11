const BASE = "http://localhost:3000";

const routesToTest = [
  "/",
  "/how-it-works",
  "/help",
  "/terms",
  "/privacy",
  "/onboarding",
  "/dashboard",
  "/book",
  "/history",
  "/profile",
  "/support",
  "/support/new",
  "/notifications",
  "/driver",
  "/driver/onboarding",
  "/driver/pending",
  "/driver/earnings",
  "/driver/history",
  "/driver/profile",
  "/admin",
  "/admin/drivers",
  "/admin/rides",
  "/admin/users",
  "/admin/promos",
  "/admin/pricing",
  "/admin/sos",
  "/api/health",
  "/api/me",
  "/api/driver/application",
  "/api/driver/offers",
  "/api/driver/stats",
  "/api/driver/earnings",
  "/api/admin/overview",
  "/api/admin/drivers",
  "/api/admin/users",
  "/api/admin/promos",
  "/api/admin/pricing",
  "/api/admin/rides",
  "/api/notifications",
  "/api/support/tickets",
];

async function run() {
  console.log("🔍 Verifying all localhost endpoints with role authentication...");
  let passed = 0;
  let failed = 0;

  for (const path of routesToTest) {
    try {
      const headers = {};
      if (path.includes("/admin")) {
        headers["Cookie"] = "ridely_user_id=user_admin";
      } else if (path.includes("/driver")) {
        headers["Cookie"] = "ridely_user_id=driver_1";
      } else {
        headers["Cookie"] = "ridely_user_id=user_rider_1";
      }

      const res = await fetch(`${BASE}${path}`, { headers });
      if (res.status >= 200 && res.status < 400) {
        console.log(`✓ [${res.status}] ${path}`);
        passed++;
      } else {
        console.log(`✗ [${res.status}] ${path}`);
        failed++;
      }
    } catch (err) {
      console.log(`✗ [ERR] ${path}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed out of ${routesToTest.length}`);
}

run();

