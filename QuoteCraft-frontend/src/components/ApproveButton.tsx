import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { BOQItem, Selection } from '@/lib/types';
import { toast } from 'sonner';

interface ApproveButtonProps {
  boqItems: BOQItem[];
  selections: Selection[];
  disabled?: boolean;
}

export default function ApproveButton({ boqItems, selections, disabled }: ApproveButtonProps) {
  const handleApprove = () => {
    if (selections.length === 0) {
      toast.error('No selections to approve.');
      return;
    }

    // Build simple approval summary for demo purposes
    const summary = selections.map((s) => {
      const item = boqItems.find((b) => b.id === s.boqItemId);
      return {
        itemNumber: item?.itemNumber ?? '',
        description: item?.description ?? '',
        unit: item?.unit ?? '',
        quantity: item?.quantity ?? 0,
        selectedVendor: s.selectedVendor,
        finalRate: s.finalRate,
        total: item ? item.quantity * s.finalRate : 0,
      };
    });

    const blob = new Blob([JSON.stringify({ approvedAt: new Date().toISOString(), items: summary }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approval-summary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Selections approved. Summary downloaded.');
  };

  return (
    <Button onClick={handleApprove} disabled={disabled} size="lg" className="w-full md:w-auto">
      <CheckCircle className="mr-2 h-5 w-5" />
      Approve Selections
    </Button>
  );
}
