import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTimesheetEmail, TimesheetRow, TimesheetAttachment } from "@/lib/email";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

interface Payload {
  to?: string;
  periodFrom?: string;
  periodTo?: string;
  rows?: TimesheetRow[];
  totals?: { hours: number; overtime: number; pay: number };
  attachments?: TimesheetAttachment[];
}

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { error: "Email sending requires Supabase + Resend. Configure env vars to enable delivery." },
        { status: 503 }
      );
    }

    // Require a valid session.
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/, "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admins may email timesheets.
    const { data: employee } = await supabase
      .from("employees")
      .select("id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!employee || employee.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = (await request.json()) as Payload;
    const { to, periodFrom, periodTo, rows, totals, attachments } = body;

    if (!to || !periodFrom || !periodTo || !rows || !totals) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error: sendError } = await sendTimesheetEmail({
      to,
      periodFrom,
      periodTo,
      rows,
      totals,
      attachments: attachments ?? [],
      senderName: user.email ?? undefined,
    });

    if (sendError) {
      console.error("Resend timesheet error:", sendError);
      return NextResponse.json(
        { error: "Email delivery failed", detail: (sendError as Error).message },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, sentTo: to });
  } catch (err) {
    console.error("Unexpected error in /api/timesheets/send:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
