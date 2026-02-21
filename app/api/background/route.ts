import { inngest } from "@/inngest/client";
import { NextResponse } from "next/server";

export async function GET() {
  await inngest.send({
    name: "test/hello.world",
    data: {
      email: "testUser@man.com",
    },
  });

  return NextResponse.json({ message: "Event sent!" });
}
