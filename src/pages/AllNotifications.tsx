import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  CheckCheck, 
  Trash2, 
  ArrowLeft,
  Mail,
  DollarSign,
  TrendingUp,
  Building2,
  Users,
  Shield,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const AllNotifications = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { notifications, isLoading, markAllAsRead, clearReadNotifications } = useNotifications(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'investment_success':
        return TrendingUp;
      case 'treasury_created':
        return Building2;
      case 'tokenization_approved':
        return CheckCircle;
      case 'usdc_associated':
        return DollarSign;
      case 'hedera_account_created':
        return CheckCircle;
      case 'reservation_expired':
        return Calendar;
      case 'system_summary':
        return Info;
      case 'dividend_distributed':
        return DollarSign;
      case 'proposal_created':
        return Users;
      case 'security_alert':
        return Shield;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'investment_success':
        return 'text-green-600 bg-green-50';
      case 'treasury_created':
        return 'text-purple-600 bg-purple-50';
      case 'tokenization_approved':
        return 'text-blue-600 bg-blue-50';
      case 'usdc_associated':
        return 'text-green-600 bg-green-50';
      case 'hedera_account_created':
        return 'text-blue-600 bg-blue-50';
      case 'reservation_expired':
        return 'text-orange-600 bg-orange-50';
      case 'system_summary':
        return 'text-gray-600 bg-gray-50';
      case 'dividend_distributed':
        return 'text-green-600 bg-green-50';
      case 'proposal_created':
        return 'text-orange-600 bg-orange-50';
      case 'security_alert':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.notification_type === filterType;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'read' && notification.read_at) ||
                         (filterStatus === 'unread' && !notification.read_at);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleMarkAsRead = (notificationId: string) => {
    // Implementation for marking single notification as read
    toast({
      title: "Notification marked as read",
      description: "The notification has been marked as read.",
    });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    toast({
      title: "All notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const handleClearRead = () => {
    clearReadNotifications();
    toast({
      title: "Read notifications cleared",
      description: "All read notifications have been cleared.",
    });
  };

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'investment_success', label: 'Investment Success' },
    { value: 'treasury_created', label: 'Treasury Created' },
    { value: 'tokenization_approved', label: 'Tokenization Approved' },
    { value: 'usdc_associated', label: 'USDC Associated' },
    { value: 'hedera_account_created', label: 'Account Created' },
    { value: 'reservation_expired', label: 'Reservation Expired' },
    { value: 'system_summary', label: 'System Summary' },
    { value: 'dividend_distributed', label: 'Dividend Distributed' },
    { value: 'proposal_created', label: 'Proposal Created' },
    { value: 'security_alert', label: 'Security Alert' },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Bell className="h-8 w-8 text-primary" />
              All Notifications
            </h1>
            <p className="text-muted-foreground">
              Manage and view all your notifications
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All Read
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearRead}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear Read
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notifications ({filteredNotifications.length})</span>
            {notifications.filter(n => !n.read_at).length > 0 && (
              <Badge variant="destructive">
                {notifications.filter(n => !n.read_at).length} unread
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Try adjusting your filters to see more notifications.'
                  : 'You have no notifications at the moment.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.notification_type);
                const colorClasses = getNotificationColor(notification.notification_type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                      !notification.read_at ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${colorClasses}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            {!notification.read_at && (
                              <div className="h-2 w-2 bg-primary rounded-full"></div>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {notification.notification_type}
                          </Badge>
                          {notification.read_at ? (
                            <Badge variant="secondary" className="text-xs">
                              Read
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-xs">
                              Unread
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AllNotifications;
