import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserChatRooms } from "@/hooks/useUserChatRooms";
import { useAuth } from "@/hooks/useAuth";

const Chat = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Fetch real chat rooms data
  const { data: chatRooms = [], isLoading, error } = useUserChatRooms();

  // Transform chat rooms for display
  const displayRooms = chatRooms.map(room => ({
    id: room.room_id,
    name: room.room_name || "Chat Room",
    lastMessage: room.last_message || "No recent messages",
    timestamp: room.last_message_at ? new Date(room.last_message_at).toLocaleDateString() : "Recently",
    unread: room.unread_count || 0,
    participants: 0, // This would come from counting chat_participants
    avatar: "/placeholder.svg"
  }));

  const filteredRooms = displayRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
        <p className="text-muted-foreground mb-6">You need to be logged in to access chat rooms.</p>
        <Button onClick={() => navigate("/auth/login")}>Go to Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with other investors and property managers
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <Card className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to Load Chat Rooms</h3>
            <p className="text-muted-foreground mb-4">There was an error loading your chat rooms.</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </Card>
        ) : filteredRooms.length === 0 && searchTerm ? (
          <Card className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No conversations found</h3>
            <p className="text-muted-foreground mb-4">No chat rooms match your search terms.</p>
            <Button onClick={() => setSearchTerm("")}>Clear Search</Button>
          </Card>
        ) : chatRooms.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Chat Rooms Available</h3>
            <p className="text-muted-foreground mb-4">
              You haven't joined any chat rooms yet. Chat rooms are created when you invest in properties.
            </p>
            <Button onClick={() => navigate("/browse")}>
              <Plus className="h-4 w-4 mr-2" />
              Browse Properties
            </Button>
          </Card>
        ) : filteredRooms.map((room) => (
          <Card 
            key={room.id}
            className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/20"
            onClick={() => navigate(`/chat/${room.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={room.avatar} />
                  <AvatarFallback>
                    <MessageCircle className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-foreground truncate">
                      {room.name}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {room.timestamp}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate mb-2">
                    {room.lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {room.participants} participants
                    </span>
                    {room.unread > 0 && (
                      <Badge variant="default" className="text-xs">
                        {room.unread} new
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default Chat;