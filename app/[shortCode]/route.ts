import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUserAgent } from "@/lib/utils/analytics";

// GET /[shortCode] - Redirect to original URL and track click
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    const link = await prisma.link.findUnique({
      where: { shortCode },
    });

    if (!link) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Track the click
    const userAgent = request.headers.get("user-agent") || "";
    const referer = request.headers.get("referer") || "";
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const { device, browser } = parseUserAgent(userAgent);

    await prisma.click.create({
      data: {
        linkId: link.id,
        ipAddress,
        userAgent,
        referer: referer || null,
        device,
        browser,
      },
    });

    // Redirect to original URL
    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    console.error("Error redirecting:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
