import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Paperclip, Users, AlertCircle, ArrowLeft, MoreVertical, Bot, Vote, DollarSign, FileText, Scale } from "lucide-react";
import { useChatMessages, useSendMessage } from "@/hooks/useUserChatRooms";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ChatRoom = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages and room info
  const { data: messages = [], isLoading, error } = useChatMessages(roomId || "");
  const sendMessageMutation = useSendMessage();

  // Fetch room info and participant count
  useEffect(() => {
    if (!roomId) return;
    
    const fetchRoomData = async () => {
      // Fetch room info
      const { data, error } = await supabase
        .from("chat_rooms")
        .select(`
          *,
          properties(title, location),
          tokenizations(token_name, token_symbol)
        `)
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("Error fetching room info:", error);
      } else {
        setRoomInfo(data);
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
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Transform messages for display
  const displayMessages = messages.map((msg: any) => {
    const isSystemMessage = msg.message_type === 'system' || !msg.sender_id;
    const isBot = isSystemMessage || msg.message_type === 'announcement';
    return {
      id: msg.id,
      user: isBot ? "Assistant Bot" : (msg.users ? `${msg.users.first_name} ${msg.users.last_name}` : "Unknown User"),
      avatar: "/placeholder.svg",
      message: msg.message_text || "",
      timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: msg.sender_id === user?.id,
      isBot: isBot,
      messageType: msg.message_type,
    };
  });

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to view this chat room.</AlertDescription>
        </Alert>
        <Button onClick={() => navigate("/auth/login")} className="mt-4">
          Go to Login
        </Button>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid chat room ID.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl h-screen flex flex-col">
      {/* Chat Header */}
      <Card className="mb-4 flex-shrink-0">
        <CardHeader className="pb-4">
          {isLoading || !roomInfo ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate("/chat")}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="text-xl">
                    {roomInfo.name || (roomInfo.properties?.title ? `${roomInfo.properties.title} Investors` : "Chat Room")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {roomInfo.description || 
                      (roomInfo.tokenizations ? `Discussion for ${roomInfo.tokenizations.token_name} (${roomInfo.tokenizations.token_symbol})` : "Property investment discussion")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {participantCount}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Chat Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/chat")}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <span>Back to Chat List</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>View Participants ({participantCount})</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Governance Tools</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate(`/properties/${roomInfo?.property_id}/governance`)}>
                      <Vote className="mr-2 h-4 w-4" />
                      <span>View Proposals</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/properties/${roomInfo?.property_id}/governance/new`)}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Create Proposal</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>Raise a Pool</span>
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
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 mb-4 overflow-hidden flex flex-col">
        <CardContent className="p-0 h-full overflow-hidden flex flex-col">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-16 w-full max-w-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Failed to load messages. Please try again.</AlertDescription>
              </Alert>
            </div>
          ) : displayMessages.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {displayMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {msg.isBot ? (
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage src={msg.avatar} />
                      <AvatarFallback>
                        {msg.user.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div className={`flex-1 max-w-xs md:max-w-md ${msg.isCurrentUser ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.isCurrentUser && (
                      <span className="text-sm font-medium text-foreground">
                        {msg.user}
                      </span>
                    )}
                    {msg.isBot && (
                      <Badge variant="secondary" className="text-xs">
                        {msg.messageType === 'system' ? 'System' : 'Official'}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {msg.timestamp}
                    </span>
                  </div>
                  
                  <div
                    className={`rounded-lg p-3 text-sm ${
                      msg.isCurrentUser
                        ? 'bg-primary text-primary-foreground'
                        : msg.isBot
                        ? 'bg-accent/50 text-accent-foreground border border-border'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card className="flex-shrink-0">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Button variant="ghost" size="sm">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !sendMessageMutation.isPending && handleSendMessage()}
                disabled={sendMessageMutation.isPending}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ChatRoom;