import { isDeveloper } from "@/lib/analytics/auth";
import { store } from "@/lib/analytics/store";

export const dynamic = "force-dynamic";

/** Dashboard actions: resolve/reopen/delete bug reports, dismiss errors. */
export async function POST(request: Request) {
  if (!(await isDeveloper())) return new Response("Unauthorized", { status: 401 });
  let body: { action?: string; id?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const s = store();
  const id = typeof body.id === "string" ? body.id : "";

  switch (body.action) {
    case "resolve-report":
    case "reopen-report": {
      const report = (await s.reports()).find((r) => r.id === id);
      if (!report) return new Response("Not found", { status: 404 });
      await s.saveReport({ ...report, status: body.action === "resolve-report" ? "resolved" : "open" });
      break;
    }
    case "delete-report":
      await s.deleteReport(id);
      break;
    case "dismiss-error":
      await s.deleteErrorGroup(id);
      break;
    case "clear-errors":
      await s.deleteErrorGroup(null);
      break;
    default:
      return new Response("Unknown action", { status: 400 });
  }
  return new Response(null, { status: 204 });
}
