import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { BOQItem, Selection } from '@/lib/types';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface ApproveButtonProps {
  boqItems: BOQItem[];
  selections: Selection[];
  comparisonId?: string;
  disabled?: boolean;
  onSuccess?: (approvalData: any) => void;
}

export default function ApproveButton({ boqItems, selections, comparisonId, disabled, onSuccess }: ApproveButtonProps) {
  const handleApprove = async () => {
    if (selections.length === 0) {
      toast.error('No selections to approve.');
      return;
    }

    if (!comparisonId) {
      toast.error('Comparison ID is missing.');
      return;
    }

    const payload = {
      comparisonId,
      decision: 'APPROVED',
      approverRole: 'Manager',
      approverEmail: 'manager@example.com',
      comment: 'Looks good.',
    };
    toast.promise(api.submitApproval(payload), {
      loading: 'Submitting approval...',
      success: (res: any) => {
        if (onSuccess) onSuccess(res.data);
        return `Approval successful: ${res.data.message}`;
      },
      error: (err: any) => `Approval failed: ${err.message}`,
    });
  };

  return (
    <Button onClick={handleApprove} disabled={disabled} size="lg" className="w-full md:w-auto">
      <CheckCircle className="mr-2 h-5 w-5" />
      Approve Selections
    </Button>
  );
}
