import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X } from "lucide-react";

interface TransactionFiltersProps {
  onFilter: (filters: FilterOptions) => void;
  totalCount: number;
  filteredCount: number;
}

export interface FilterOptions {
  search: string;
  type: string;
  status: string;
  dateRange: string;
}

export const TransactionFilters = ({ onFilter, totalCount, filteredCount }: TransactionFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const [showFilters, setShowFilters] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      type: 'all',
      status: 'all',
      dateRange: 'all'
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {Object.values(filters).filter(v => v && v !== 'all').length}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="dividend">Dividend</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="token_deposit">Token Deposit</SelectItem>
                    <SelectItem value="token_withdrawal">Token Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {totalCount !== filteredCount && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredCount} of {totalCount} transactions
        </div>
      )}
    </div>
  );
};