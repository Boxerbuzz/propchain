import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  Paperclip,
  Users,
  AlertCircle,
  ArrowLeft,
  MoreVertical,
  Bot,
  Vote,
  Scale,
  Plus,
  Smile,
  Image as ImageIcon,
  Check,
  CheckCheck,
} from "lucide-react";
import { useChatMessages, useSendMessage } from "@/hooks/useUserChatRooms";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProposalCreator } from "@/components/ProposalCreator";
import { ProposalMessage } from "@/components/ProposalMessage";

const ChatRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState<{
    name: string;
    property_id: string;
    tokenization_id: string;
    tokenization_status?: string;
    properties?: { title: string; location: any };
    tokenizations?: { token_name: string; token_symbol: string; status: string };
  } | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [showProposalCreator, setShowProposalCreator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch messages and room info
  const {
    data: messages = [],
    isLoading,
    error,
  } = useChatMessages(roomId || "");
  const sendMessageMutation = useSendMessage();

  // Fetch room info and participant count
  useEffect(() => {
    if (!roomId) return;

    const fetchRoomData = async () => {
      // Fetch room info
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          properties(title, location),
          tokenizations(token_name, token_symbol, status)
        `
        )
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("Error fetching room info:", error);
      } else {
        setRoomInfo({
          ...data,
          tokenization_status: data.tokenizations?.status
        });
      }

      // Fetch participant count
      const { count, error: countError } = await supabase
        .from("chat_participants")
        .select("*", { count: "exact", head: true })
        .eq("room_id", roomId);

      if (!countError && count !== null) {
        setParticipantCount(count);
      }
    };

    fetchRoomData();
  }, [roomId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !roomId || !user?.id) return;

    try {
      await sendMessageMutation.mutateAsync({
        roomId,
        message: message.trim(),
      });
      setMessage("");
      inputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Transform messages for display
  const displayMessages = messages.map((msg: any) => {
    const isSystemMessage = msg.message_type === "system" || !msg.sender_id;
    const isBot = isSystemMessage || msg.message_type === "announcement";
    return {
      id: msg.id,
      user: isBot
        ? "Assistant Bot"
        : msg.users
        ? `${msg.users.first_name} ${msg.users.last_name}`
        : "Unknown User",
      avatar: "/placeholder.svg",
      message: msg.message_text || "",
      timestamp: new Date(msg.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullTimestamp: new Date(msg.created_at).toLocaleString(),
      isCurrentUser: msg.sender_id === user?.id,
      isBot: isBot,
      messageType: msg.message_type,
      metadata: msg.metadata,
      createdAt: msg.created_at,
    };
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in to view this chat room.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/auth/login")}
              className="mt-6 w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Invalid chat room ID.</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Chat Header */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          {isLoading || !roomInfo ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3 w-64" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate("/chat")}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white">
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-lg truncate">
                    {roomInfo.name ||
                      (roomInfo.properties?.title
                        ? `${roomInfo.properties.title} Investors`
                        : "Chat Room")}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">
                    {participantCount} participants ·{" "}
                    {roomInfo.properties?.location 
                      ? typeof roomInfo.properties.location === 'object'
                        ? `${roomInfo.properties.location.city || ''}, ${roomInfo.properties.location.state || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || 'Property Chat'
                        : roomInfo.properties.location
                      : 'Active now'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="secondary"
                  className="hidden sm:flex items-center gap-1"
                >
                  <Users className="h-3 w-3" />
                  {participantCount}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Chat Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>View Participants ({participantCount})</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Governance Tools</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() =>
                        setShowProposalCreator(!showProposalCreator)
                      }
                      disabled={
                        roomInfo?.tokenization_status !== 'minted' && 
                        roomInfo?.tokenization_status !== 'distributed'
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Create Proposal</span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(
                          `/properties/${roomInfo?.property_id}/governance`
                        )
                      }
                    >
                      <Vote className="mr-2 h-4 w-4" />
                      <span>View All Proposals</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Scale className="mr-2 h-4 w-4" />
                      <span>Voting History</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <div className="container mx-auto px-4 h-full max-w-5xl">
          <div className="h-full overflow-y-auto py-6 space-y-4">
            {isLoading ? (
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 ${
                      i % 3 === 0 ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                    <div className="flex-1 max-w-md space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton
                        className={`h-20 ${i % 3 === 0 ? "ml-auto" : ""}`}
                        style={{ width: `${60 + Math.random() * 40}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <Card className="max-w-md border-2 border-destructive/20 bg-destructive/5">
                  <CardContent className="p-8 text-center">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load messages. Please try again.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="h-10 w-10 text-primary" />
                  </div>
                  <p className="text-xl font-semibold mb-2">No messages yet</p>
                  <p className="text-muted-foreground">
                    Start the conversation!
                  </p>
                </div>
              </div>
            ) : (
              <>
                {showProposalCreator && roomInfo && (
                  <div className="mb-6">
                    <ProposalCreator
                      roomId={roomId || ""}
                      propertyId={roomInfo.property_id}
                      tokenizationId={roomInfo.tokenization_id}
                      onClose={() => setShowProposalCreator(false)}
                    />
                  </div>
                )}

                {displayMessages.map((msg, index) => {
                  const showAvatar =
                    index === 0 || displayMessages[index - 1].user !== msg.user;
                  const isLastFromUser =
                    index === displayMessages.length - 1 ||
                    displayMessages[index + 1].user !== msg.user;

                  return (
                    <div key={msg.id}>
                      {msg.messageType === "proposal" ? (
                        <ProposalMessage
                          metadata={msg.metadata}
                          createdAt={msg.createdAt}
                        />
                      ) : (
                        <div
                          className={`flex gap-3 ${
                            msg.isCurrentUser ? "flex-row-reverse" : ""
                          } group ${showAvatar ? "mt-4" : "mt-1"}`}
                        >
                          {/* Avatar */}
                          {showAvatar ? (
                            <Avatar className="h-10 w-10 shrink-0 ring-2 ring-background">
                              {msg.isBot ? (
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                  <Bot className="h-5 w-5" />
                                </AvatarFallback>
                              ) : (
                                <>
                                  <AvatarImage src={msg.avatar} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
                                    {msg.user
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </>
                              )}
                            </Avatar>
                          ) : (
                            <div className="w-10 shrink-0"></div>
                          )}

                          {/* Message Content */}
                          <div
                            className={`flex-1 max-w-lg ${
                              msg.isCurrentUser ? "flex flex-col items-end" : ""
                            }`}
                          >
                            {showAvatar && (
                              <div
                                className={`flex items-center gap-2 mb-1.5 ${
                                  msg.isCurrentUser ? "flex-row-reverse" : ""
                                }`}
                              >
                                <span className="text-sm font-semibold text-foreground">
                                  {msg.isCurrentUser ? "You" : msg.user}
                                </span>
                                {msg.isBot && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {msg.messageType === "system"
                                      ? "System"
                                      : "Official"}
                                  </Badge>
                                )}
                              </div>
                            )}

                            <div
                              className={`inline-block rounded-2xl px-4 py-2.5 shadow-sm ${
                                msg.isCurrentUser
                                  ? `bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ${
                                      showAvatar ? "rounded-tr-sm" : ""
                                    }`
                                  : msg.isBot
                                  ? `bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950 dark:to-blue-900/50 text-foreground border border-blue-200 dark:border-blue-800 ${
                                      showAvatar ? "rounded-tl-sm" : ""
                                    }`
                                  : `bg-card text-foreground border ${
                                      showAvatar ? "rounded-tl-sm" : ""
                                    }`
                              }`}
                            >
                              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>
                            </div>

                            {isLastFromUser && (
                              <div
                                className={`flex items-center gap-1.5 mt-1 px-1 ${
                                  msg.isCurrentUser ? "flex-row-reverse" : ""
                                }`}
                              >
                                <span
                                  className="text-xs text-muted-foreground"
                                  title={msg.fullTimestamp}
                                >
                                  {msg.timestamp}
                                </span>
                                {msg.isCurrentUser && (
                                  <CheckCheck className="h-3.5 w-3.5 text-primary" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-5xl">
          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" &&
                  !sendMessageMutation.isPending &&
                  handleSendMessage()
                }
                disabled={sendMessageMutation.isPending}
                className="pr-12 h-11 border-2 focus:border-primary rounded-full"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full shadow-sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {sendMessageMutation.isPending && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:150ms]"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:300ms]"></div>
              </div>
              <span>Sending...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
