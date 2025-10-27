import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Users,
  Shield,
  Activity,
  CheckCircle,
  Clock,
  XCircle,
  Info,
  RefreshCw,
  Wrench,
  ClipboardCheck,
  Key,
  ShoppingCart,
  Wallet,
  CreditCard,
  Banknote,
  Coins,
  ArrowUpDown,
  Send,
  Download,
  ArrowLeftRight,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

/**
 * Standardized activity/transaction types across the application
 */
export type ActivityType =
  | 'investment'
  | 'dividend'
  | 'deposit'
  | 'withdrawal'
  | 'token_deposit'
  | 'token_withdrawal'
  | 'sync'
  | 'property_event'
  | 'governance'
  | 'security'
  | 'status_change'
  | 'maintenance'
  | 'inspection'
  | 'rental'
  | 'purchase'
  | 'transaction'
  | 'wallet'
  | 'payment'
  | 'send'
  | 'receive'
  | 'swap';

/**
 * Standardized status types
 */
export type ActivityStatus =
  | 'completed'
  | 'pending'
  | 'failed'
  | 'cancelled'
  | 'rejected'
  | 'success'
  | 'error'
  | 'info';

/**
 * Icon configuration for each activity type
 */
interface IconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  darkBgColor: string;
}

const ACTIVITY_ICON_MAP: Record<ActivityType, IconConfig> = {
  investment: {
    icon: TrendingUp,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100',
    darkBgColor: 'dark:bg-blue-900/20',
  },
  dividend: {
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-900/20',
  },
  deposit: {
    icon: ArrowDownLeft,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-900/20',
  },
  withdrawal: {
    icon: ArrowUpRight,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-900/20',
  },
  token_deposit: {
    icon: Coins,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-900/20',
  },
  token_withdrawal: {
    icon: Coins,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-900/20',
  },
  sync: {
    icon: RefreshCw,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100',
    darkBgColor: 'dark:bg-blue-900/20',
  },
  property_event: {
    icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100',
    darkBgColor: 'dark:bg-purple-900/20',
  },
  governance: {
    icon: Users,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100',
    darkBgColor: 'dark:bg-orange-900/20',
  },
  security: {
    icon: Shield,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-900/20',
  },
  status_change: {
    icon: Info,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100',
    darkBgColor: 'dark:bg-blue-900/20',
  },
  maintenance: {
    icon: Wrench,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100',
    darkBgColor: 'dark:bg-amber-900/20',
  },
  inspection: {
    icon: ClipboardCheck,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100',
    darkBgColor: 'dark:bg-indigo-900/20',
  },
  rental: {
    icon: Key,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100',
    darkBgColor: 'dark:bg-teal-900/20',
  },
  purchase: {
    icon: ShoppingCart,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100',
    darkBgColor: 'dark:bg-emerald-900/20',
  },
  transaction: {
    icon: ArrowUpDown,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100',
    darkBgColor: 'dark:bg-gray-900/20',
  },
  wallet: {
    icon: Wallet,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100',
    darkBgColor: 'dark:bg-indigo-900/20',
  },
  payment: {
    icon: CreditCard,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100',
    darkBgColor: 'dark:bg-pink-900/20',
  },
  send: {
    icon: Send,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100',
    darkBgColor: 'dark:bg-red-900/20',
  },
  receive: {
    icon: Download,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100',
    darkBgColor: 'dark:bg-green-900/20',
  },
  swap: {
    icon: ArrowLeftRight,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100',
    darkBgColor: 'dark:bg-purple-900/20',
  },
};

/**
 * Get the icon component for an activity type
 * @param type - The activity type
 * @returns The Lucide icon component
 */
export function getActivityIcon(type: ActivityType | string): LucideIcon {
  const config = ACTIVITY_ICON_MAP[type as ActivityType];
  return config?.icon || Activity;
}

/**
 * Get the icon component wrapped in a colored circle (for dashboard/list views)
 * @param type - The activity type
 * @param status - Optional status to override icon based on status
 * @param size - Size of the wrapper (default: 'default')
 * @returns JSX element with icon in colored circle
 */
export function getActivityIconWithCircle(
  type: ActivityType | string,
  status?: ActivityStatus | string,
  size: 'sm' | 'default' | 'lg' = 'default'
): JSX.Element {
  // For investment type, icon changes based on status
  if (type === 'investment' && status) {
    const statusIcons = {
      completed: CheckCircle,
      success: CheckCircle,
      pending: Clock,
      failed: XCircle,
      error: XCircle,
    };
    
    const statusColors = {
      completed: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100',
        darkBgColor: 'dark:bg-green-900/20',
      },
      success: {
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-100',
        darkBgColor: 'dark:bg-green-900/20',
      },
      pending: {
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100',
        darkBgColor: 'dark:bg-amber-900/20',
      },
      failed: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100',
        darkBgColor: 'dark:bg-red-900/20',
      },
      error: {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100',
        darkBgColor: 'dark:bg-red-900/20',
      },
    };
    
    const StatusIcon = statusIcons[status as keyof typeof statusIcons];
    const colors = statusColors[status as keyof typeof statusColors];
    
    if (StatusIcon && colors) {
      const sizeClasses = {
        sm: 'w-6 h-6',
        default: 'w-8 h-8',
        lg: 'w-10 h-10',
      };
      const iconSizeClasses = {
        sm: 'w-3 h-3',
        default: 'w-4 h-4',
        lg: 'w-5 h-5',
      };
      
      return (
        <div className={`flex items-center justify-center ${sizeClasses[size]} rounded-full ${colors.bgColor} ${colors.darkBgColor}`}>
          <StatusIcon className={`${iconSizeClasses[size]} ${colors.color}`} />
        </div>
      );
    }
  }
  
  const config = ACTIVITY_ICON_MAP[type as ActivityType] || ACTIVITY_ICON_MAP.transaction;
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    default: 'w-8 h-8',
    lg: 'w-10 h-10',
  };
  const iconSizeClasses = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} rounded-full ${config.bgColor} ${config.darkBgColor}`}>
      <Icon className={`${iconSizeClasses[size]} ${config.color}`} />
    </div>
  );
}

/**
 * Get the status icon component
 * @param status - The status type
 * @returns The Lucide icon component
 */
export function getStatusIcon(status: ActivityStatus | string): LucideIcon {
  const statusMap: Record<string, LucideIcon> = {
    completed: CheckCircle,
    success: CheckCircle,
    pending: Clock,
    failed: XCircle,
    cancelled: XCircle,
    rejected: XCircle,
    error: XCircle,
    info: Info,
  };
  
  return statusMap[status] || Info;
}

/**
 * Get the status badge variant
 * @param status - The status type
 * @returns Badge component props classes
 */
export function getStatusBadgeVariant(status: ActivityStatus | string): {
  variant: "default" | "secondary" | "destructive" | "outline";
  className?: string;
} {
  switch (status) {
    case 'completed':
    case 'success':
      return { 
        variant: 'outline',
        className: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700'
      };
    case 'pending':
      return { 
        variant: 'outline',
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700'
      };
    case 'failed':
    case 'error':
    case 'rejected':
      return { 
        variant: 'outline',
        className: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700'
      };
    case 'cancelled':
      return { 
        variant: 'outline',
        className: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700'
      };
    default:
      return { 
        variant: 'secondary',
      };
  }
}

/**
 * Get color classes for activity type badges
 * @param type - The activity type
 * @returns Tailwind CSS classes for text and background
 */
export function getActivityTypeColor(type: ActivityType | string): string {
  const config = ACTIVITY_ICON_MAP[type as ActivityType];
  if (!config) {
    return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20';
  }
  
  return `${config.color} ${config.bgColor} ${config.darkBgColor}`;
}

/**
 * Render a status badge component with icon
 * @param status - The status type
 * @returns JSX Badge element
 */
export function renderStatusBadge(status: ActivityStatus | string): JSX.Element {
  const StatusIcon = getStatusIcon(status);
  const { variant, className } = getStatusBadgeVariant(status);
  
  return (
    <Badge variant={variant} className={className}>
      <StatusIcon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
