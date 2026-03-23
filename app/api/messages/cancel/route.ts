import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import z, { success } from "zod";

const requestSchema = z.object({
  projectId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;

    if (!internalKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();

    const { projectId } = requestSchema.parse(body);

    const processingMessages = await convex.query(
      api.system.getProcessingMessage,
      {
        internalKey,
        projectId: projectId as Id<"projects">,
      },
    );

    if (processingMessages.length === 0) {
      return NextResponse.json({ success: true, cancelled: false });
    }

    const cancelledIds = await Promise.all(
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

        return msg._id;
      }),
    );

    return NextResponse.json({
      success: true,
      cancelled: true,
      messageIds: cancelledIds,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
