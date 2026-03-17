import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";

export const useConversation = (id: Id<"conversations"> | null) => {
  return useQuery(api.conversation.getById, id ? { id } : "skip");
};

export const useMessages = (conversationId: Id<"conversations"> | null) => {
  return useQuery(
    api.conversation.getMessages,
    conversationId ? { conversationId } : "skip",
  );
};

export const useConversations = (projectId: Id<"projects">) => {
  return useQuery(api.conversation.getByProject, { projectId });
};

export const useCreateConversation = () => {
  return useMutation(api.conversation.create);
};
