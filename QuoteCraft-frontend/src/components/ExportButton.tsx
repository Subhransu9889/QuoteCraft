import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { BOQItem, Selection } from '@/lib/types';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ExportButtonProps {
  boqItems: BOQItem[];
  selections: Selection[];
  disabled?: boolean;
}

export default function ExportButton({
  boqItems,
  selections,
  disabled,
}: ExportButtonProps) {
  const handleExport = () => {
    try {
      // Create export data
      const exportData = boqItems.map((item) => {
        const selection = selections.find((s) => s.boqItemId === item.id);

        return {
          Item: item.itemNumber,
          Description: item.description,
          Unit: item.unit,
          Quantity: item.quantity,
          BaseRate: item.baseRate || '',
          SelectedVendor: selection?.selectedVendor || '',
          FinalRate: selection?.finalRate || '',
          Total: selection
            ? (item.quantity * selection.finalRate).toFixed(2)
            : '',
        };
      });

      // Create workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Updated BOQ');

      // Set column widths
      const columnWidths = [
        { wch: 10 }, // Item
        { wch: 50 }, // Description
        { wch: 10 }, // Unit
        { wch: 10 }, // Quantity
        { wch: 12 }, // BaseRate
        { wch: 20 }, // SelectedVendor
        { wch: 12 }, // FinalRate
        { wch: 15 }, // Total
      ];
      worksheet['!cols'] = columnWidths;

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: 'xlsx',
        type: 'array',
      });

      // Create Blob and download
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Updated-BOQ-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('BOQ exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export BOQ. Please try again.');
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={disabled}
      size="lg"
      className="w-full md:w-auto"
    >
      <Download className="mr-2 h-5 w-5" />
      Export Updated BOQ
    </Button>
  );
}
