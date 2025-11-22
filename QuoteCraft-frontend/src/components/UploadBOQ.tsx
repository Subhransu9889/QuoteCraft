import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BOQItem, ColumnMapping } from '@/lib/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UploadBOQProps {
  onDataLoaded: (items: BOQItem[]) => void;
  boqData: BOQItem[] | null;
}

export default function UploadBOQ({ onDataLoaded, boqData }: UploadBOQProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showMapping, setShowMapping] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload .xlsx, .xls, or .csv files.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setFileName(file.name);

    // Send file to backend for processing as well
    api.uploadFile(file, { fileType: 'boq' })
      .then((resp) => {
        if (resp?.success) {
          toast.success(resp.message || 'BOQ uploaded to backend.');
        }
      })
      .catch((err) => {
        console.error('Backend upload failed:', err);
        toast.error(`Backend upload failed: ${err.message || err}`);
      });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          toast.error('The file is empty or has no valid data.');
          return;
        }

        // Get available columns
        const columns = Object.keys(jsonData[0] as object);
        setAvailableColumns(columns);
        setRawData(jsonData);

        // Try to detect columns automatically
        const detectedMapping = detectColumns(columns);
        
        // Check if all required columns were detected
        if (
          detectedMapping.description &&
          detectedMapping.unit &&
          detectedMapping.quantity
        ) {
          // Auto-map and process
          setMapping(detectedMapping);
          processWithMapping(jsonData, detectedMapping);
        } else {
          // Show mapping dialog
          setMapping(detectedMapping);
          setShowMapping(true);
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        toast.error('Failed to parse file. Please check the file format.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const detectColumns = (columns: string[]): ColumnMapping => {
    const lower = columns.map((c) => c.toLowerCase());
    const mapping: ColumnMapping = {};

    // Item Number
    const itemIdx = lower.findIndex((c) =>
      c.includes('item') && (c.includes('no') || c.includes('number') || c.includes('#'))
    );
    if (itemIdx !== -1) mapping.itemNumber = columns[itemIdx];

    // Description
    const descIdx = lower.findIndex((c) =>
      c.includes('description') || c.includes('particulars') || c.includes('item')
    );
    if (descIdx !== -1) mapping.description = columns[descIdx];

    // Unit
    const unitIdx = lower.findIndex((c) => c.includes('unit') || c === 'uom');
    if (unitIdx !== -1) mapping.unit = columns[unitIdx];

    // Quantity
    const qtyIdx = lower.findIndex((c) =>
      c.includes('quantity') || c.includes('qty') || c === 'no'
    );
    if (qtyIdx !== -1) mapping.quantity = columns[qtyIdx];

    // Base Rate
    const rateIdx = lower.findIndex((c) =>
      c.includes('rate') || c.includes('price')
    );
    if (rateIdx !== -1) mapping.baseRate = columns[rateIdx];

    // Section
    const sectionIdx = lower.findIndex((c) =>
      c.includes('section') || c.includes('category') || c.includes('group')
    );
    if (sectionIdx !== -1) mapping.section = columns[sectionIdx];

    return mapping;
  };

  const processWithMapping = (data: any[], columnMapping: ColumnMapping) => {
    const items: BOQItem[] = data.map((row, index) => ({
      id: `boq-${index + 1}`,
      itemNumber: columnMapping.itemNumber
        ? String(row[columnMapping.itemNumber] || index + 1)
        : String(index + 1),
      description: columnMapping.description
        ? String(row[columnMapping.description] || '')
        : '',
      unit: columnMapping.unit ? String(row[columnMapping.unit] || '') : '',
      quantity: columnMapping.quantity
        ? Number(row[columnMapping.quantity]) || 0
        : 0,
      baseRate: columnMapping.baseRate
        ? Number(row[columnMapping.baseRate]) || undefined
        : undefined,
      section: columnMapping.section
        ? String(row[columnMapping.section] || '')
        : undefined,
    }));

    // Validate required fields
    const hasValidData = items.some(
      (item) => item.description && item.unit && item.quantity > 0
    );

    if (!hasValidData) {
      toast.error('No valid data found. Please check the column mapping.');
      return;
    }

    onDataLoaded(items);
    setShowMapping(false);
    toast.success(`Loaded ${items.length} BOQ items successfully.`);
  };

  const handleMappingSubmit = () => {
    if (!mapping.description || !mapping.unit || !mapping.quantity) {
      toast.error('Please map all required columns: Description, Unit, and Quantity.');
      return;
    }
    processWithMapping(rawData, mapping);
  };

  const handleClear = () => {
    setFileName(null);
    setRawData([]);
    setAvailableColumns([]);
    setMapping({});
    onDataLoaded(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-1">Upload BOQ</h2>
          <p className="text-sm text-muted-foreground">
            Upload your Bill of Quantities (.xlsx, .xls, or .csv)
          </p>
        </div>

        {!boqData ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-foreground mb-2">
              Drag and drop your BOQ file here, or
            </p>
            <Button onClick={() => fileInputRef.current?.click()} variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </Button>
            {fileName && (
              <p className="mt-4 text-sm text-muted-foreground">
                Selected: {fileName}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{fileName}</p>
                  <p className="text-sm text-muted-foreground">
                    {boqData.length} items loaded
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-table-header sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-foreground border-b border-table-border">
                        Item
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-foreground border-b border-table-border">
                        Description
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-foreground border-b border-table-border">
                        Unit
                      </th>
                      <th className="text-right p-3 text-sm font-medium text-foreground border-b border-table-border">
                        Quantity
                      </th>
                      {boqData.some((item) => item.baseRate) && (
                        <th className="text-right p-3 text-sm font-medium text-foreground border-b border-table-border">
                          Base Rate
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {boqData.slice(0, 50).map((item, index) => (
                      <tr key={item.id} className="hover:bg-muted/30">
                        <td className="p-3 text-sm border-b border-table-border">
                          {item.itemNumber}
                        </td>
                        <td className="p-3 text-sm border-b border-table-border">
                          {item.description}
                        </td>
                        <td className="p-3 text-sm border-b border-table-border">
                          {item.unit}
                        </td>
                        <td className="p-3 text-sm text-right border-b border-table-border">
                          {item.quantity}
                        </td>
                        {boqData.some((item) => item.baseRate) && (
                          <td className="p-3 text-sm text-right border-b border-table-border">
                            {item.baseRate
                              ? `₹${item.baseRate.toFixed(2)}`
                              : '-'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {boqData.length > 50 && (
                <div className="p-3 text-sm text-center text-muted-foreground bg-muted/30 border-t border-table-border">
                  Showing first 50 of {boqData.length} items
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <Dialog open={showMapping} onOpenChange={setShowMapping}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Map Columns</DialogTitle>
            <DialogDescription>
              Map your file columns to the required BOQ fields. Required fields are
              marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Number</Label>
              <Select
                value={mapping.itemNumber || ''}
                onValueChange={(value) =>
                  setMapping({ ...mapping, itemNumber: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Description <span className="text-destructive">*</span>
              </Label>
              <Select
                value={mapping.description || ''}
                onValueChange={(value) =>
                  setMapping({ ...mapping, description: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Unit <span className="text-destructive">*</span>
              </Label>
              <Select
                value={mapping.unit || ''}
                onValueChange={(value) => setMapping({ ...mapping, unit: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Quantity <span className="text-destructive">*</span>
              </Label>
              <Select
                value={mapping.quantity || ''}
                onValueChange={(value) =>
                  setMapping({ ...mapping, quantity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Base Rate (Optional)</Label>
              <Select
                value={mapping.baseRate || ''}
                onValueChange={(value) =>
                  setMapping({ ...mapping, baseRate: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {availableColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowMapping(false)}>
              Cancel
            </Button>
            <Button onClick={handleMappingSubmit}>Import</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
