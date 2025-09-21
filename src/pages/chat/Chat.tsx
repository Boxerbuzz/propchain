import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Chat = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const chatRooms = [
    {
      id: "prop-123",
      name: "Downtown Apartment Complex",
      lastMessage: "New maintenance update available",
      timestamp: "2 min ago",
      unread: 3,
      participants: 24,
      avatar: "/placeholder.svg"
    },
    {
      id: "prop-456", 
      name: "Seaside Villa Resort",
      lastMessage: "Q3 financial report is ready",
      timestamp: "1 hour ago",
      unread: 1,
      participants: 18,
      avatar: "/placeholder.svg"
    },
    {
      id: "prop-789",
      name: "City Center Office Building",
      lastMessage: "Voting on renovation proposal",
      timestamp: "3 hours ago",
      unread: 0,
      participants: 45,
      avatar: "/placeholder.svg"
    }
  ];

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {filteredRooms.map((room) => (
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

      {filteredRooms.length === 0 && (
        <Card className="p-12 text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No conversations found
          </h3>
          <p className="text-muted-foreground mb-4">
            Start a new conversation or adjust your search terms
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Start Chatting
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Chat;