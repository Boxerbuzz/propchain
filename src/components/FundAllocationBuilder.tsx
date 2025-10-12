import { useState, useEffect } from 'react';
import { Plus, Trash2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MoneyInput from '@/components/ui/money-input';

export interface FundAllocation {
  id: string;
  category: string;
  amount_ngn: number;
  percentage: number;
  description: string;
}

interface FundAllocationBuilderProps {
  tokenizationType: 'equity' | 'debt' | 'revenue';
  targetRaise: number;
  value: FundAllocation[];
  onChange: (allocations: FundAllocation[]) => void;
}

const getCategoriesByType = (type: string) => {
  switch (type) {
    case 'equity':
      return [
        'Property Acquisition',
        'Renovation & Improvements',
        'Legal & Closing Costs',
        'Property Management Setup',
        'Marketing & Leasing',
        'Reserve Fund (Maintenance)',
        'Platform Fees',
        'Other'
      ];
    case 'debt':
      return [
        'Loan Principal to Property Owner',
        'Origination Fees',
        'Legal & Documentation',
        'Escrow/Reserve Account',
        'Platform Fees',
        'Other'
      ];
    case 'revenue':
      return [
        'Marketing & Tenant Acquisition',
        'Property Improvements (Revenue-Generating)',
        'Technology & Systems Setup',
        'Professional Services',
        'Reserve Fund',
        'Platform Fees',
        'Other'
      ];
    default:
      return ['Other'];
  }
};

const getSmartDefaults = (type: string, targetRaise: number): FundAllocation[] => {
  const generateId = () => Math.random().toString(36).substr(2, 9);
  
  switch (type) {
    case 'equity':
      return [
        { id: generateId(), category: 'Property Acquisition', amount_ngn: targetRaise * 0.70, percentage: 70, description: 'Initial purchase of the property' },
        { id: generateId(), category: 'Renovation & Improvements', amount_ngn: targetRaise * 0.15, percentage: 15, description: 'Property upgrades and repairs' },
        { id: generateId(), category: 'Legal & Closing Costs', amount_ngn: targetRaise * 0.05, percentage: 5, description: 'Legal fees and closing costs' },
        { id: generateId(), category: 'Reserve Fund (Maintenance)', amount_ngn: targetRaise * 0.07, percentage: 7, description: 'Emergency maintenance reserve' },
        { id: generateId(), category: 'Platform Fees', amount_ngn: targetRaise * 0.03, percentage: 3, description: 'Tokenization and platform fees' }
      ];
    case 'debt':
      return [
        { id: generateId(), category: 'Loan Principal to Property Owner', amount_ngn: targetRaise * 0.925, percentage: 92.5, description: 'Principal amount disbursed to property owner' },
        { id: generateId(), category: 'Legal & Documentation', amount_ngn: targetRaise * 0.025, percentage: 2.5, description: 'Legal documentation and due diligence' },
        { id: generateId(), category: 'Platform Fees', amount_ngn: targetRaise * 0.0375, percentage: 3.75, description: 'Platform fees and administration' },
        { id: generateId(), category: 'Escrow/Reserve Account', amount_ngn: targetRaise * 0.0125, percentage: 1.25, description: 'Reserve account for defaults' }
      ];
    case 'revenue':
      return [
        { id: generateId(), category: 'Marketing & Tenant Acquisition', amount_ngn: targetRaise * 0.30, percentage: 30, description: 'Marketing and tenant acquisition costs' },
        { id: generateId(), category: 'Property Improvements (Revenue-Generating)', amount_ngn: targetRaise * 0.40, percentage: 40, description: 'Improvements to increase revenue' },
        { id: generateId(), category: 'Professional Services', amount_ngn: targetRaise * 0.15, percentage: 15, description: 'Property management and legal services' },
        { id: generateId(), category: 'Reserve Fund', amount_ngn: targetRaise * 0.10, percentage: 10, description: 'Operating reserve fund' },
        { id: generateId(), category: 'Platform Fees', amount_ngn: targetRaise * 0.05, percentage: 5, description: 'Platform fees' }
      ];
    default:
      return [];
  }
};

export function FundAllocationBuilder({ tokenizationType, targetRaise, value, onChange }: FundAllocationBuilderProps) {
  const [allocations, setAllocations] = useState<FundAllocation[]>(value);
  const categories = getCategoriesByType(tokenizationType);

  useEffect(() => {
    if (value.length === 0 && targetRaise > 0) {
      const defaults = getSmartDefaults(tokenizationType, targetRaise);
      setAllocations(defaults);
      onChange(defaults);
    }
  }, [tokenizationType, targetRaise]);

  useEffect(() => {
    setAllocations(value);
  }, [value]);

  const totalAmount = allocations.reduce((sum, a) => sum + a.amount_ngn, 0);
  const totalPercentage = allocations.reduce((sum, a) => sum + a.percentage, 0);
  const isValid = Math.abs(totalPercentage - 100) < 0.01 && Math.abs(totalAmount - targetRaise) < 1;

  const addCategory = () => {
    const newAllocation: FundAllocation = {
      id: Math.random().toString(36).substr(2, 9),
      category: categories[0],
      amount_ngn: 0,
      percentage: 0,
      description: ''
    };
    const updated = [...allocations, newAllocation];
    setAllocations(updated);
    onChange(updated);
  };

  const removeCategory = (id: string) => {
    const updated = allocations.filter(a => a.id !== id);
    setAllocations(updated);
    onChange(updated);
  };

  const updateAllocation = (id: string, field: keyof FundAllocation, value: any) => {
    const updated = allocations.map(a => {
      if (a.id === id) {
        const newAllocation = { ...a, [field]: value };
        
        // Auto-calculate percentage when amount changes
        if (field === 'amount_ngn' && targetRaise > 0) {
          newAllocation.percentage = (value / targetRaise) * 100;
        }
        
        // Auto-calculate amount when percentage changes
        if (field === 'percentage') {
          newAllocation.amount_ngn = (value / 100) * targetRaise;
        }
        
        return newAllocation;
      }
      return a;
    });
    setAllocations(updated);
    onChange(updated);
  };

  const applyDefaults = () => {
    const defaults = getSmartDefaults(tokenizationType, targetRaise);
    setAllocations(defaults);
    onChange(defaults);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Use of Funds Allocation</h3>
          <p className="text-sm text-muted-foreground">
            Specify how the ₦{targetRaise.toLocaleString()} will be deployed
          </p>
        </div>
        <Badge variant={isValid ? "default" : "destructive"} className="text-lg px-4 py-2">
          {totalPercentage.toFixed(1)}%
        </Badge>
      </div>

      {allocations.length === 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No allocations yet. <Button variant="link" className="p-0 h-auto" onClick={applyDefaults}>Click here to apply smart defaults</Button> or add categories manually.
          </AlertDescription>
        </Alert>
      )}

      {allocations.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Allocated</span>
                <span className="font-medium">₦{totalAmount.toLocaleString()}</span>
              </div>
              <Progress value={totalPercentage} className="h-3" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {allocations.map((allocation, index) => (
          <Card key={allocation.id}>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-4">
                    <Label>Category</Label>
                    <Select
                      value={allocation.category}
                      onValueChange={(value) => updateAllocation(allocation.id, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-3">
                    <Label>Amount (₦)</Label>
                    <MoneyInput
                      value={allocation.amount_ngn}
                      onChange={(value) => updateAllocation(allocation.id, 'amount_ngn', value)}
                      placeholder="Enter amount"
                      currency="₦"
                      min={0}
                      max={targetRaise}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Percentage</Label>
                    <Input
                      type="text"
                      value={allocation.percentage > 0 ? allocation.percentage.toFixed(2) : ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          updateAllocation(allocation.id, 'percentage', 0);
                        } else {
                          updateAllocation(allocation.id, 'percentage', parseFloat(val) || 0);
                        }
                      }}
                      onFocus={(e) => e.target.select()}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="col-span-3 flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCategory(allocation.id)}
                      disabled={allocations.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    {allocations.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={applyDefaults}
                        className="ml-2"
                      >
                        Reset All
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Explain how these funds will be used..."
                    value={allocation.description}
                    onChange={(e) => updateAllocation(allocation.id, 'description', e.target.value)}
                    rows={2}
                    maxLength={500}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button type="button" onClick={addCategory} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Category
      </Button>

      {!isValid && (
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertDescription>
            {Math.abs(totalPercentage - 100) >= 0.01 && (
              <p>Total allocation must equal 100%. Current: {totalPercentage.toFixed(2)}%</p>
            )}
            {Math.abs(totalAmount - targetRaise) >= 1 && (
              <p>Total amount must equal ₦{targetRaise.toLocaleString()}. Current: ₦{totalAmount.toLocaleString()}</p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Regulatory Disclosure:</strong> The use of funds outlined is a projection based on current property plans. 
          Actual fund deployment may vary due to unforeseen circumstances, market conditions, or regulatory requirements. 
          Any material changes will be communicated to token holders.
        </AlertDescription>
      </Alert>
    </div>
  );
}
