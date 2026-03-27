import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";

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
  return useMutation(api.conversation.create).withOptimisticUpdate(
    (localStorage, args) => {
      const conversations = localStorage.getQuery(
        api.conversation.getByProject,
        {
          projectId: args.projectId,
        },
      );

      if (conversations !== undefined) {
        const newConversation = {
          _id: crypto.randomUUID() as Id<"conversations">,
          _creationTime: Date.now(),
          projectId: args.projectId,
          title: DEFAULT_CONVERSATION_TITLE,
          updatedAt: Date.now(),
          createdAt: Date.now(),
        };

        localStorage.setQuery(
          api.conversation.getByProject,
          { projectId: args.projectId },
          [newConversation, ...conversations],
        );
      }
    },
  );
};
