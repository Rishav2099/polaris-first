import { api } from "@/convex/_generated/api";
import { DEFAULT_CONVERSATION_TITLE } from "@/features/conversations/constants";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import z from "zod";

const requestSchema = z.object({
  prompt: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthroized" }, { status: 401 });
    }

    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      return NextResponse.json(
        { error: "Internal Key not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    // Improvement: Use safeParse to handle validation errors gracefully
    const parsedBody = requestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: parsedBody.error.format(),
        },
        { status: 400 },
      );
    }

    const { prompt } = parsedBody.data;

    // Generate a random project name
    const projectName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals, colors],
      separator: "-",
      length: 3,
    });

    // Create project and conversation together
    const { projectId, conversationId } = await convex.mutation(
      api.system.createProjectWithConversation,
      {
        internalKey,
        projectName,
        conversationTitle: DEFAULT_CONVERSATION_TITLE,
        ownerId: userId,
      },
    );

    // Create user message
    await convex.mutation(api.system.createMessage, {
      internalKey,
      conversationId,
      projectId,
      role: "user",
      content: prompt,
    });

    // Create assistant message placeholder with processing status
    const assistantMessageId = await convex.mutation(api.system.createMessage, {
      internalKey,
      conversationId,
      projectId,
      role: "assistant",
      content: "",
      status: "processing",
    });

    // Trigger Inngest to process the message
    await inngest.send({
      name: "message/sent",
      data: {
        messageId: assistantMessageId,
        conversationId,
        projectId,
        message: prompt,
      },
    });

    return NextResponse.json({projectId})
  } catch (error) {
    console.error("Error creating project/conversation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
