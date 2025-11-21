import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QuotationItem } from '@/lib/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface VendorQuote {
  vendor: string;
  items: QuotationItem[];
  fileName: string;
}

interface UploadQuotesProps {
  onQuotesLoaded: (quotes: QuotationItem[]) => void;
  quotes: VendorQuote[];
  setQuotes: (quotes: VendorQuote[]) => void;
}

export default function UploadQuotes({
  onQuotesLoaded,
  quotes,
  setQuotes,
}: UploadQuotesProps) {
  const [pendingVendor, setPendingVendor] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
  };

  const handleAddVendor = () => {
    if (!pendingVendor.trim()) {
      toast.error('Please enter a vendor name.');
      return;
    }

    if (!pendingFile) {
      toast.error('Please select a file.');
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(pendingFile.type)) {
      toast.error('Invalid file type. Please upload .xlsx, .xls, or .csv files.');
      return;
    }

    // Validate file size (10MB)
    if (pendingFile.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      // Send original file to backend for processing as well
      api.uploadFile(pendingFile, { fileType: 'quote', vendorName: pendingVendor.trim() })
        .then((resp) => {
          if (resp?.success) {
            toast.success(resp.message || `Quote uploaded to backend for ${pendingVendor.trim()}.`);
          }
        })
        .catch((err) => {
          console.error('Backend upload (quote) failed:', err);
          toast.error(`Backend upload failed: ${err.message || err}`);
        });
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          toast.error('The file is empty or has no valid data.');
          return;
        }

        // Auto-detect columns (description, unit, rate)
        const columns = Object.keys(jsonData[0] as object);
        const lower = columns.map((c) => c.toLowerCase());

        const descCol =
          columns[
            lower.findIndex(
              (c) =>
                c.includes('description') ||
                c.includes('particulars') ||
                c.includes('item')
            )
          ];
        const unitCol =
          columns[lower.findIndex((c) => c.includes('unit') || c === 'uom')];
        const rateCol =
          columns[
            lower.findIndex((c) => c.includes('rate') || c.includes('price'))
          ];

        if (!descCol || !unitCol || !rateCol) {
          toast.error(
            'Could not detect required columns (Description, Unit, Rate). Please check the file format.'
          );
          return;
        }

        const items: QuotationItem[] = jsonData
          .map((row: any) => ({
            vendor: pendingVendor.trim(),
            description: String(row[descCol] || ''),
            unit: String(row[unitCol] || ''),
            rate: Number(row[rateCol]) || 0,
          }))
          .filter((item) => item.description && item.rate > 0);

        if (items.length === 0) {
          toast.error('No valid quote items found in the file.');
          return;
        }

        const newQuote: VendorQuote = {
          vendor: pendingVendor.trim(),
          items,
          fileName: pendingFile!.name,
        };

        const updatedQuotes = [...quotes, newQuote];
        setQuotes(updatedQuotes);
        onQuotesLoaded(updatedQuotes.flatMap((q) => q.items));

        // Reset form
        setPendingVendor('');
        setPendingFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';

        toast.success(
          `Loaded ${items.length} items from ${pendingVendor.trim()}.`
        );
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to parse file. Please check the file format.');
      }
    };
    reader.readAsBinaryString(pendingFile);
  };

  const handleRemoveVendor = (index: number) => {
    const updatedQuotes = quotes.filter((_, i) => i !== index);
    setQuotes(updatedQuotes);
    onQuotesLoaded(updatedQuotes.flatMap((q) => q.items));
    toast.success('Vendor quote removed.');
  };

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Upload Vendor Quotes
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload quotations from multiple vendors
        </p>
      </div>

      <div className="space-y-4">
        {/* Add Vendor Form */}
        <div className="border border-border rounded-lg p-4 space-y-3">
          <div className="space-y-2">
            <Label htmlFor="vendorName">Vendor Name</Label>
            <Input
              id="vendorName"
              placeholder="Enter vendor name"
              value={pendingVendor}
              onChange={(e) => setPendingVendor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorFile">Quotation File</Label>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                id="vendorFile"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="flex-1"
              />
              <Button onClick={handleAddVendor} disabled={!pendingVendor || !pendingFile}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Uploaded Vendors */}
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p className="text-sm">No vendor quotes uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className="border border-border rounded-lg overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 bg-secondary">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{quote.vendor}</p>
                      <p className="text-sm text-muted-foreground">
                        {quote.fileName} • {quote.items.length} items
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveVendor(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="overflow-x-auto max-h-64">
                  <table className="w-full">
                    <thead className="bg-table-header sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium text-foreground border-b border-table-border">
                          Description
                        </th>
                        <th className="text-left p-3 text-sm font-medium text-foreground border-b border-table-border">
                          Unit
                        </th>
                        <th className="text-right p-3 text-sm font-medium text-foreground border-b border-table-border">
                          Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {quote.items.slice(0, 20).map((item, itemIndex) => (
                        <tr key={itemIndex} className="hover:bg-muted/30">
                          <td className="p-3 text-sm border-b border-table-border">
                            {item.description}
                          </td>
                          <td className="p-3 text-sm border-b border-table-border">
                            {item.unit}
                          </td>
                          <td className="p-3 text-sm text-right border-b border-table-border">
                            ₹{item.rate.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {quote.items.length > 20 && (
                  <div className="p-3 text-sm text-center text-muted-foreground bg-muted/30 border-t border-table-border">
                    Showing first 20 of {quote.items.length} items
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
