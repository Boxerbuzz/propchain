# Activity Icons & Data Sources

This document outlines the standardized approach to displaying icons and fetching activity/transaction data across the PropChain application.

## 📦 Centralized Icon Utility

All activity and transaction icons are managed through `src/lib/activityIcons.tsx`.

### Available Functions

#### `getActivityIcon(type: ActivityType): LucideIcon`
Returns the appropriate Lucide icon component for an activity type.

```tsx
import { getActivityIcon } from "@/lib/activityIcons";

const Icon = getActivityIcon('investment');
<Icon className="h-4 w-4" />
```

#### `getActivityIconWithCircle(type: ActivityType, status?: ActivityStatus, size?: 'sm' | 'default' | 'lg'): JSX.Element`
Returns an icon wrapped in a colored circle for dashboard/list views. For `investment` type, the icon changes based on status.

```tsx
import { getActivityIconWithCircle } from "@/lib/activityIcons";

{getActivityIconWithCircle('investment', 'completed', 'default')}
```

#### `getStatusIcon(status: ActivityStatus): LucideIcon`
Returns the status icon component.

```tsx
const StatusIcon = getStatusIcon('completed');
<StatusIcon className="h-3 w-3" />
```

#### `renderStatusBadge(status: ActivityStatus): JSX.Element`
Renders a complete Badge component with icon and text.

```tsx
{renderStatusBadge('completed')}
```

#### `getStatusBadgeVariant(status: ActivityStatus): { variant, className }`
Returns Badge component styling props for custom badge creation.

#### `getActivityTypeColor(type: ActivityType): string`
Returns Tailwind CSS classes for activity type styling.

---

## 🎨 Activity Types & Their Icons

| Activity Type | Icon | Color | Use Case |
|--------------|------|-------|----------|
| `investment` | TrendingUp (status-based) | Blue/Green/Amber/Red | Property investments |
| `dividend` | DollarSign | Green | Dividend payments |
| `deposit` | ArrowDownLeft | Green | Fiat/crypto deposits |
| `withdrawal` | ArrowUpRight | Red | Bank withdrawals |
| `token_deposit` | Coins | Green | Token received |
| `token_withdrawal` | Coins | Red | Token sent |
| `sync` | RefreshCw | Blue | Wallet balance sync |
| `property_event` | Building2 | Purple | Property updates |
| `governance` | Users | Orange | DAO proposals |
| `security` | Shield | Red | Security alerts |
| `status_change` | Info | Blue | Status updates |
| `maintenance` | Wrench | Amber | Property maintenance |
| `inspection` | ClipboardCheck | Indigo | Property inspections |
| `rental` | Key | Teal | Rental events |
| `purchase` | ShoppingCart | Emerald | Purchase transactions |
| `transaction` | ArrowUpDown | Gray | Generic transactions |
| `wallet` | Wallet | Indigo | Wallet operations |
| `payment` | CreditCard | Pink | Payment processing |
| `send` | Send | Red | Outgoing transfers |
| `receive` | Download | Green | Incoming transfers |
| `swap` | ArrowLeftRight | Purple | Token swaps |

---

## 📊 Data Sources & Hooks

### `useWalletTransactions()`
**Location:** `src/hooks/useWalletTransactions.ts`

**Returns:** All financial transactions (investments, dividends, deposits, withdrawals, Hedera transactions)

**Fields:**
- `type`: Specific transaction type (`investment`, `dividend`, etc.)
- `displayType`: Simplified type (`send`, `receive`, `swap`, `internal`)
- `amount`: Transaction amount
- `currency`: Currency code
- `status`: Transaction status
- `description`: Human-readable description

**Use when:** You need detailed financial transaction data with amounts and currencies.

**Used in:**
- `src/pages/account/Dashboard.tsx` - Account wallet overview
- `src/pages/account/AllTransactions.tsx` - Full transaction history

---

### `useUnifiedActivityFeed(limit?: number)`
**Location:** `src/hooks/useUnifiedActivityFeed.ts`

**Returns:** Combined activities from multiple sources (transactions + activity logs)

**Fields:**
- `type`: Activity type
- `title`: Activity title
- `description`: Detailed description
- `status`: Activity status
- `amount`: Optional amount
- `currency`: Optional currency

**Use when:** You need a consolidated view of all user activities.

**Used in:**
- `src/pages/Dashboard.tsx` - Main dashboard recent activities
- `src/pages/AllActivities.tsx` - Full activity feed

---

### `useActivityFeed(limit?: number)`
**Location:** `src/hooks/useActivityFeed.ts`

**Returns:** System-generated activity logs (property events, governance actions, etc.)

**Fields:**
- `activity_type`: Type of activity
- `description`: Activity description
- `created_at`: Timestamp

**Use when:** You need non-financial activity tracking.

**Note:** Generally not used directly; consumed by `useUnifiedActivityFeed`.

---

## 🔄 Data Flow Decision Tree

```
Need to display activities?
│
├─ Financial transactions only?
│  └─ Use useWalletTransactions()
│     └─ Display with getActivityIcon(tx.displayType)
│
├─ All activities (financial + system events)?
│  └─ Use useUnifiedActivityFeed()
│     └─ Display with getActivityIconWithCircle()
│
└─ System events only?
   └─ Use useActivityFeed()
      └─ Display with getActivityIcon(activity.activity_type)
```

---

## ✅ Best Practices

### DO ✓
- Import icon utilities from `@/lib/activityIcons`
- Use `displayType` for simplified transaction display
- Use `getActivityIconWithCircle()` in dashboard cards
- Use `renderStatusBadge()` for consistent status badges
- Use semantic color tokens from design system

### DON'T ✗
- Create custom icon mappings in components
- Duplicate `switch` statements for icon selection
- Fetch from multiple hooks when one suffices
- Use hardcoded colors (use design tokens instead)
- Mix icon rendering approaches in the same page

---

## 📝 Adding New Activity Types

1. **Add type to `ActivityType` in `src/lib/activityIcons.tsx`:**
```tsx
export type ActivityType =
  | 'existing_types'
  | 'your_new_type';
```

2. **Add icon mapping to `ACTIVITY_ICON_MAP`:**
```tsx
your_new_type: {
  icon: YourIcon,
  color: 'text-your-color-600 dark:text-your-color-400',
  bgColor: 'bg-your-color-100',
  darkBgColor: 'dark:bg-your-color-900/20',
}
```

3. **Update this documentation with the new type.**

---

## 🐛 Common Issues & Solutions

### Issue: Icons not displaying correctly
**Solution:** Check that you're importing from `@/lib/activityIcons`, not creating local functions.

### Issue: Different icons on different pages
**Solution:** Ensure all pages use the centralized utility, not custom mappings.

### Issue: Status badges have wrong colors
**Solution:** Use `renderStatusBadge()` or `getStatusBadgeVariant()` for consistent styling.

### Issue: Duplicate activities in feed
**Solution:** Only use `useUnifiedActivityFeed()` - it already combines all sources.

---

## 📌 Files Reference

**Core Utility:**
- `src/lib/activityIcons.tsx` - Centralized icon system

**Hooks:**
- `src/hooks/useWalletTransactions.ts` - Financial transactions
- `src/hooks/useUnifiedActivityFeed.ts` - Combined activity feed
- `src/hooks/useActivityFeed.ts` - System activity logs

**Pages Using Icons:**
- `src/pages/Dashboard.tsx` - Main dashboard
- `src/pages/AllActivities.tsx` - Full activity list
- `src/pages/account/Dashboard.tsx` - Wallet dashboard
- `src/pages/account/AllTransactions.tsx` - Transaction history

---

**Last Updated:** 2025-10-27  
**Maintained by:** PropChain Development Team
