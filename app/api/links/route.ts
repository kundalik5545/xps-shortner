import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShortCode, isValidUrl, normalizeUrl } from "@/lib/utils/url";

// GET /api/links - Get all links for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const links = await prisma.link.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/links - Create a new shortened link
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const normalizedUrl = normalizeUrl(url);
    if (!isValidUrl(normalizedUrl)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Generate a unique short code
    let shortCode = generateShortCode(6);
    let attempts = 0;
    while (await prisma.link.findUnique({ where: { shortCode } })) {
      shortCode = generateShortCode(6);
      attempts++;
      if (attempts > 10) {
        shortCode = generateShortCode(8); // Use longer code if collisions
      }
    }

    const link = await prisma.link.create({
      data: {
        originalUrl: normalizedUrl,
        shortCode,
        userId: session.user.id,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
