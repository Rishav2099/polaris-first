import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Id } from "@/convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "@/convex/constants";
import { useState } from "react";
import {
  useConversation,
  useConversations,
  useCreateConversation,
  useMessages,
} from "../hooks/use-conversations";
import { toast } from "sonner";
import { CopyIcon, HistoryIcon, LoaderIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import ky from "ky";

const ConversationSidebar = ({ projectId }: { projectId: Id<"projects"> }) => {
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [input, setInput] = useState("");
  const createConversation = useCreateConversation();
  const conversations = useConversations(projectId);

const activeConversationId =
    selectedConversationId ?? conversations?.[0]?._id ?? null;

  const activeConversation = useConversation(activeConversationId);
  const conversationMessages = useMessages(activeConversationId);

  const isProcessing = conversationMessages?.some(
    (msg) => msg.status === "processing",
  );

  const handleCreateConversation = async () => {
    try {
      const newConversationId = await createConversation({
        projectId,
        title: DEFAULT_CONVERSATION_TITLE,
      });

      setSelectedConversationId(newConversationId);
      return newConversationId;
    } catch {
      toast.error("Unable to create new conversation");
      return null;
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if (isProcessing && !message.text) {
      // handle cancel
      setInput("");
      return;
    }

    let conversationId = activeConversationId

    if(!conversationId){
      conversationId = await handleCreateConversation();
      if(!conversationId){
        return;
      }
    }

    // Trigger Inggest function via Api
    try {
      await ky.post('/api/messages', {
        json: {
          conversationId,
          message: message.text,
        }
      })
    } catch (error) {
      toast.error("Failed to submit message");
    }
    setInput('')
  };

  return (
    <div className="flex flex-col w-full items-center justify-center">
      <div className="h-8.75 border-b w-full flex justify-between">
        <p>{activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}</p>
        <div>
          <Button size={"icon-xs"} variant={"highlight"} onClick={() => {}}>
            <HistoryIcon className="size-3.5" />
          </Button>
          <Button
            size={"icon-xs"}
            variant={"highlight"}
            onClick={handleCreateConversation}
          >
            <PlusIcon className="size-3.5" />
          </Button>
        </div>
      </div>

      <Conversation>
        <ConversationContent>
          {conversationMessages?.map((message, messageIndex) => (
            <Message key={message._id} from={message.role}>
              <MessageContent>
                {message.status === "processing" ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <LoaderIcon className="size-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <MessageResponse>{message.content}</MessageResponse>
                )}
              </MessageContent>
              {message.role === "assistant" &&
                message.status === "completed" &&
                messageIndex === (conversationMessages.length ?? 0) - 1 && (
                  <MessageActions>
                    <MessageAction
                      onClick={() => {
                        navigator.clipboard.writeText(message.content);
                      }}
                      label="Copy"
                    >
                      <CopyIcon className="size-3" />
                    </MessageAction>
                  </MessageActions>
                )}
            </Message>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="p-3">
        <PromptInput onSubmit={handleSubmit} className="mt-2">
          <PromptInputTextarea
            placeholder="Ask Polaris..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className=""
          />
          <PromptInputTools />
          <PromptInputSubmit
            status={isProcessing ? "streaming" : undefined}
            disabled={isProcessing ? false : !input}
          />
        </PromptInput>
      </div>
    </div>
  );
};

export default ConversationSidebar;
