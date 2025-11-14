import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Search, Plus, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserChatRooms } from "@/hooks/useUserChatRooms";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const Chat = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Fetch real chat rooms data
  const { data: chatRooms = [], isLoading, error } = useUserChatRooms();

  // Transform chat rooms for display
  const displayRooms = chatRooms.map((room) => ({
    id: room.room_id,
    name: room.room_name || "Chat Room",
    lastMessage: room.last_message || "No recent messages",
    timestamp: room.last_message_at
      ? formatDistanceToNow(new Date(room.last_message_at), { addSuffix: true })
      : "Recently",
    unread: room.unread_count || 0,
    participants: 0,
    avatar: "/placeholder.svg",
    isActive: room.unread_count > 0,
  }));

  const filteredRooms = displayRooms.filter((room) =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to access chat rooms.
            </p>
            <Button
              onClick={() => navigate("/auth/login")}
              size="lg"
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Messages</h1>
          <p className="text-lg text-muted-foreground">
            Communicate with other investors and property managers
          </p>
        </div>

        {/* Search and New Chat */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-base border-2 focus:border-primary"
            />
          </div>
          <Button size="lg" className="h-12 gap-2 shadow-sm">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">New Chat</span>
          </Button>
        </div>

        {/* Chat List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <Card className="border-2 border-destructive/20 bg-destructive/5">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Failed to Load Chat Rooms
                </h3>
                <p className="text-muted-foreground mb-6">
                  There was an error loading your chat rooms.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="destructive"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredRooms.length === 0 && searchTerm ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No conversations found
                </h3>
                <p className="text-muted-foreground mb-6">
                  No chat rooms match "{searchTerm}"
                </p>
                <Button onClick={() => setSearchTerm("")} variant="outline">
                  Clear Search
                </Button>
              </CardContent>
            </Card>
          ) : chatRooms.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  No Chat Rooms Available
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  You haven't joined any chat rooms yet. Chat rooms are created
                  automatically when you invest in properties.
                </p>
                <Button
                  onClick={() => navigate("/browse")}
                  size="lg"
                  className="gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Browse Properties
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredRooms.map((room) => (
              <Card
                key={room.id}
                className={`group cursor-pointer transition-all duration-200 ${
                  room.isActive
                    ? "border-2 border-primary/20 bg-primary/5"
                    : "hover:border-primary/30"
                }`}
                onClick={() => navigate(`/chat/${room.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <Avatar className="h-14 w-14 ring-2 ring-background">
                        <AvatarImage src={room.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white text-lg font-semibold">
                          <MessageCircle className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      {room.isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <h3
                          className={`font-semibold text-lg truncate ${
                            room.isActive
                              ? "text-foreground"
                              : "text-foreground/90"
                          }`}
                        >
                          {room.name}
                        </h3>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {room.timestamp}
                          </span>
                        </div>
                      </div>

                      <p
                        className={`text-sm truncate mb-2 ${
                          room.isActive
                            ? "text-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {room.lastMessage}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <div className="flex -space-x-2">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-background"></div>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-background"></div>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-background"></div>
                          </div>
                          <span className="ml-1">
                            {room.participants || "3+"} participants
                          </span>
                        </span>
                        {room.unread > 0 && (
                          <Badge className="bg-primary text-primary-foreground shadow-sm">
                            {room.unread} new
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
