import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Users, Settings } from "lucide-react";

const ChatRoom = () => {
  const { roomId } = useParams();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomInfo = {
    name: "Downtown Apartment Complex",
    participants: 24,
    description: "Investment discussion for Property ID: DT-123"
  };

  const messages = [
    {
      id: 1,
      user: "Sarah Johnson",
      avatar: "/placeholder.svg",
      message: "The Q3 financial report looks promising. Occupancy is at 95%",
      timestamp: "10:30 AM",
      isCurrentUser: false
    },
    {
      id: 2,
      user: "Mike Chen", 
      avatar: "/placeholder.svg",
      message: "Great news! What about the upcoming renovations?",
      timestamp: "10:32 AM",
      isCurrentUser: false
    },
    {
      id: 3,
      user: "You",
      avatar: "/placeholder.svg",
      message: "I've reviewed the renovation proposal. The ROI projections look solid.",
      timestamp: "10:35 AM",
      isCurrentUser: true
    },
    {
      id: 4,
      user: "Property Manager",
      avatar: "/placeholder.svg",
      message: "Thanks for the feedback. We'll begin voting on the proposal next week.",
      timestamp: "10:38 AM",
      isCurrentUser: false,
      isOfficial: true
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Handle sending message
      setMessage("");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl h-[calc(100vh-120px)]">
      {/* Chat Header */}
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{roomInfo.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {roomInfo.description}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                {roomInfo.participants}
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Area */}
      <Card className="flex-1 mb-4 h-[calc(100vh-280px)]">
        <CardContent className="p-0 h-full">
          <div className="overflow-y-auto h-full p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={msg.avatar} />
                  <AvatarFallback>
                    {msg.user.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className={`flex-1 max-w-xs md:max-w-md ${msg.isCurrentUser ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {!msg.isCurrentUser && (
                      <span className="text-sm font-medium text-foreground">
                        {msg.user}
                      </span>
                    )}
                    {msg.isOfficial && (
                      <Badge variant="secondary" className="text-xs">
                        Official
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
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
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
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!message.trim()}>
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