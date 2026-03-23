import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import { Id } from "@/convex/_generated/dataModel";
import { DEFAULT_CONVERSATION_TITLE } from "@/features/conversations/constants";
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
import PastConversationDialog from "./past-conversation-dialog";

const ConversationSidebar = ({ projectId }: { projectId: Id<"projects"> }) => {
  const [selectedConversationId, setSelectedConversationId] =
    useState<Id<"conversations"> | null>(null);
  const [pastConversationsOpen, setPastConversationsOpen] = useState(false);
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

  const handleCancel = async () => {
    try {
      await ky.post("/api/messages/cancel", {
        json: { projectId },
      });
    } catch (error) {
      toast.error("Unable to cancel request");
    }
  };

  const handleSubmit = async (message: PromptInputMessage) => {
    if (isProcessing && !message.text) {
      await handleCancel();
      setInput("");
      return;
    }

    let conversationId = activeConversationId;

    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) {
        return;
      }
    }

    // Trigger Inggest function via Api
    try {
      await ky.post("/api/messages", {
        json: {
          conversationId,
          message: message.text,
        },
      });
    } catch (error) {
      toast.error("Failed to submit message");
    }
    setInput("");
  };

  return (
    <>
      <PastConversationDialog
        projectId={projectId}
        open={pastConversationsOpen}
        onOpenChange={setPastConversationsOpen}
        onSelect={setSelectedConversationId}
      />
      <div className="flex flex-col h-full w-full bg-background">
        {/* 2. Added items-center so the text and buttons align vertically */}
        <div className="h-8.75 border-b w-full flex items-center justify-between shrink-0">
          <div className="text-sm font-medium truncate pl-3 text-muted-foreground">
            {activeConversation?.title ?? DEFAULT_CONVERSATION_TITLE}
          </div>
          <div className="flex items-center px-2 gap-1">
            <Button size={"icon-xs"} variant={"ghost"} onClick={() => setPastConversationsOpen((val) => !val)}>
              <HistoryIcon className="size-3.5" />
            </Button>
            <Button
              size={"icon-xs"}
              variant={"ghost"}
              onClick={handleCreateConversation}
            >
              <PlusIcon className="size-3.5" />
            </Button>
          </div>
        </div>

        {/* 3. Added min-h-0 to prevent the flex child from expanding past the screen */}
        <div className="flex-1 min-h-0 relative w-full">
          <Conversation className="h-full w-full">
            <ConversationContent>
              {conversationMessages?.map((message, messageIndex) => (
                <Message key={message._id} from={message.role}>
                  <MessageContent>
                    {message.status === "processing" ? (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <LoaderIcon className="size-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : message.status === "cancelled" ? (
                      <span className="text-muted-foreground italic">
                        Request Cancelled
                      </span>
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
        </div>

        {/* 4. Removed mt-2, added shrink-0 so it never gets crushed by a long chat */}
        <div className="p-3 w-full shrink-0 bg-background">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask Polaris..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[60px]"
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit
                status={isProcessing ? "streaming" : undefined}
                disabled={isProcessing ? false : !input.trim()}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
};

export default ConversationSidebar;
