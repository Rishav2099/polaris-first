import { api } from "@/convex/_generated/api";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const requestSchema = z.object({
  url: z.string(),
});

function parseGitHubUrl(url: string) {
  // ✅ FIX 2: Better Regex to handle trailing slashes or .git
  const match = url.match(/github\.com\/([^/]+)\/([^/.]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL format");
  }

  return { owner: match[1], repo: match[2] };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, has } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPro = has({ plan: "pro" });

    if (!hasPro) {
      return NextResponse.json({ error: "Pro plan required" }, { status: 403 });
    }

    const body = await request.json();

    const validation = requestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid URL provided" },
        { status: 400 },
      );
    }

    const { url } = validation.data;
    const { owner, repo } = parseGitHubUrl(url);

    const client = await clerkClient();
    const tokens = await client.users.getUserOauthAccessToken(userId, "github");

    const githubToken = tokens.data[0].token;

    if (!githubToken) {
      return NextResponse.json(
        {
          error:
            "Github not connected. Please reconnect your Github account in settings ",
        },
        { status: 400 },
      );
    }

    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      console.error("Missing POLARIS_CONVEX_INTERNAL_KEY");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Create Project in Convex
    const projectId = await convex.mutation(api.system.createProject, {
      internalKey,
      name: repo,
      ownerId: userId,
    });

    // send Event to Inngest
    const event = await inngest.send({
      name: "github/import.repo",
      data: {
        owner,
        repo,
        projectId,
        githubToken,
      },
    });

    return NextResponse.json({
      success: true,
      projectId,
      eventId: event.ids[0],
    });
  } catch (error) {
    console.error("[GITHUB IMPORT ERROR]", error);

    const message =
      error instanceof Error ? error.message : "Internal Server Error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
