import { CheckCircle, Clock, Wallet, Coins, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface InvestmentStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending' | 'failed';
  icon: React.ElementType;
}

interface InvestmentProgressIndicatorProps {
  paymentMethod: 'paystack' | 'wallet';
  paymentStatus: 'pending' | 'processing' | 'confirmed' | 'failed';
  tokenTransferStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  chatRoomCreated?: boolean;
}

export default function InvestmentProgressIndicator({ 
  paymentMethod, 
  paymentStatus, 
  tokenTransferStatus = 'pending',
  chatRoomCreated = false 
}: InvestmentProgressIndicatorProps) {
  const getPaymentSteps = (): InvestmentStep[] => {
    const baseSteps: InvestmentStep[] = [
      {
        id: 'payment',
        title: paymentMethod === 'paystack' ? 'Payment Processing' : 'Wallet Deduction',
        description: paymentMethod === 'paystack' 
          ? 'Processing your Paystack payment' 
          : 'Deducting amount from your wallet',
        status: paymentStatus === 'confirmed' ? 'completed' 
               : paymentStatus === 'failed' ? 'failed'
               : paymentStatus === 'processing' ? 'in-progress' : 'pending',
        icon: Wallet,
      },
      {
        id: 'token-allocation',
        title: 'Token Allocation',
        description: 'Allocating tokens to your portfolio',
        status: paymentStatus === 'confirmed' ? 'completed' : 'pending',
        icon: Coins,
      }
    ];

    if (tokenTransferStatus !== 'pending') {
      baseSteps.push({
        id: 'token-transfer',
        title: 'Token Transfer',
        description: 'Transferring tokens to your blockchain wallet',
        status: tokenTransferStatus === 'completed' ? 'completed'
               : tokenTransferStatus === 'failed' ? 'failed'
               : tokenTransferStatus === 'processing' ? 'in-progress' : 'pending',
        icon: CheckCircle,
      });
    }

    baseSteps.push({
      id: 'chat-room',
      title: 'Investor Community',
      description: 'Adding you to the investor chat room',
      status: chatRoomCreated ? 'completed' : 'pending',
      icon: MessageCircle,
    });

    return baseSteps;
  };

  const steps = getPaymentSteps();
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / steps.length) * 100;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-blue-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'in-progress': return <Badge variant="default" className="bg-blue-500">Processing</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Investment Progress</h3>
              <span className="text-sm text-muted-foreground">
                {completedSteps}/{steps.length} completed
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.id} className="flex items-start space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(step.status)}`}>
                    {step.status === 'in-progress' ? (
                      <Clock className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{step.title}</p>
                      {getStatusBadge(step.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}