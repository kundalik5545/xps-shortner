import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/links/[id]/analytics - Get analytics for a specific link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const link = await prisma.link.findUnique({
      where: { id },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    if (link.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const clicks = await prisma.click.findMany({
      where: { linkId: id },
      orderBy: { timestamp: "desc" },
    });

    // Aggregate data
    const totalClicks = clicks.length;
    const uniqueIPs = new Set(clicks.map((c) => c.ipAddress).filter(Boolean)).size;

    // Group by device
    const deviceStats = clicks.reduce((acc, click) => {
      const device = click.device || "Unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by browser
    const browserStats = clicks.reduce((acc, click) => {
      const browser = click.browser || "Unknown";
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by date for time series
    const timeSeries = clicks.reduce((acc, click) => {
      const date = new Date(click.timestamp).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalClicks,
      uniqueIPs,
      deviceStats,
      browserStats,
      timeSeries,
      clicks: clicks.slice(0, 100), // Return last 100 clicks
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

