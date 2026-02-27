import { Id } from "@/convex/_generated/dataModel";
import ProjectIdView from "@/features/projects/components/project-id-view";
import React from "react";

const page = async ({ params }: { params: Promise<{ projectId: string }> }) => {
  const { projectId } = await params;
  return (
    <ProjectIdView projectId={projectId as Id<"projects">}></ProjectIdView>
  );
};

export default page;
