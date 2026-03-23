import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const requestSchema = z.object({
  conversationId: z.string(),
  message: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      return NextResponse.json(
        { error: "Internal key not configured" },
        { status: 500 },
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId, message } = requestSchema.parse(body);
    const conversations = await convex.query(api.system.getConversationById, {
      conversationId: conversationId as Id<"conversations">,
      internalKey,
    });

    if (!conversations) {
      return NextResponse.json(
        { error: "conversation not found" },
        { status: 404 },
      );
    }

    const projectId = conversations.projectId;

    // cancel all processing message
    const processingMessages = await convex.query(
      api.system.getProcessingMessage,
      { projectId, internalKey },
    );

    if (processingMessages.length > 0) {
      await Promise.all(
        processingMessages.map(async (msg) => {
          await inngest.send({
            name: "message/cancel",
            data: {
              messageId: msg._id,
            },
          });

          await convex.mutation(api.system.updateMessageStatus, {
            internalKey,
            messageId: msg._id,
            status: "cancelled",
          });
        }),
      );
    }

    await convex.mutation(api.system.createMessage, {
      internalKey,
      conversationId: conversationId as Id<"conversations">,
      projectId,
      role: "user",
      content: message,
    });

    const assistantMessageId = await convex.mutation(api.system.createMessage, {
      internalKey,
      conversationId: conversationId as Id<"conversations">,
      projectId,
      role: "assistant",
      content: "",
      status: "processing",
    });

    const event = await inngest.send({
      name: "message/sent",
      data: {
        messageId: assistantMessageId,
        conversationId: conversationId,
        projectId: projectId,
        message: message
      },
    });

    return NextResponse.json({
      success: true,
      messageId: assistantMessageId,
      eventId: event.ids[0],
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
