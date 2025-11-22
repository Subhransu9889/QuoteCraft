import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle, XCircle, Hourglass } from 'lucide-react';

interface PurchaseOrderProps {
  poDetails: {
    poNumber: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    erpLink: string;
  } | null;
}

const PurchaseOrderStatus = ({ poDetails }: PurchaseOrderProps) => {
  if (!poDetails) {
    return null;
  }

  const getStatusIcon = () => {
    switch (poDetails.status) {
      case 'Approved':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'Rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Hourglass className="w-6 h-6 text-yellow-500 animate-spin" />;
    }
  };

  return (
    <Card className="mt-4 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Purchase Order Status</span>
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">PO Number:</span>
          <span className="font-mono text-primary">{poDetails.poNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Status:</span>
          <span className="font-semibold">{poDetails.status}</span>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full">
          <a href={poDetails.erpLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            View in ERP
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PurchaseOrderStatus;
