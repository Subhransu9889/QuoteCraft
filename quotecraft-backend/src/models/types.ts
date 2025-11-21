// ============ BOQ TYPES ============
export interface BOQItem {
  lineNo: number;
  sku: string;
  description: string;
  spec: string;
  qty: number;
  uom: string;
  estimatedPrice: number;
  totalEstimate: number;
}

export interface BOQ {
  id: string;
  version: string;
  dateCreated: string;
  currency: string;
  items: BOQItem[];
  totalBOQ: number;
}

// ============ QUOTE TYPES ============
export interface QuoteItem {
  boqLineNo: number;
  sku: string;
  unitPrice: number;
  qty: number;
  minQty: number;
  leadTime: number;
  tax: number;
  lineTotal: number;
}

export interface Quote {
  id: string;
  vendorId: string;
  vendorName: string;
  dateReceived: string;
  currency: string;
  items: QuoteItem[];
  shippingCost: number;
  discountPercent: number;
  totalCost: number;
  paymentTerms: string;
  warranty: string;
}

// ============ COMPARISON TYPES ============
export interface MatchedItem {
  boqLineNo: number;
  sku: string;
  description: string;
  boqQty: number;
  boqPrice: number;
  quoteQty: number;
  quotePrice: number;
  variance: number;
  matched: boolean;
  isOutlier?: boolean;
  outlierReason?: string;
}

export interface UnmatchedItem {
  sku: string;
  qty: number;
  quotePrice: number;
  matched: boolean;
  reason: string;
}

export interface VendorScore {
  vendorId: string;
  vendorName: string;
  totalCost: number;
  variance: number;
  complianceScore: number;
  deliveryDays: number;
  score: number;
  recommendation: 'RECOMMENDED' | 'ACCEPTABLE' | 'FLAG_REVIEW';
}

export interface ComparisonResult {
  id: string;
  boqId: string;
  quotes: VendorScore[];
  bestVendor: string;
  costSavings: number;
  approvalRoute: 'PROCUREMENT_MANAGER' | 'FINANCE_DIRECTOR' | 'EXECUTIVE';
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  updatedAt?: string;
}

// ============ APPROVAL TYPES ============
export interface ApprovalDecision {
  comparisonId: string;
  decision: 'APPROVED' | 'REJECTED';
  approverRole: string;
  approverEmail: string;
  comment: string;
  nextApprovalLevel?: string;
}

export interface Approval {
  id: string;
  comparisonId: string;
  decision: 'APPROVED' | 'REJECTED';
  timestamp: string;
  nextStep: string;
  approvalId: string;
  message: string;
}

// ============ AUDIT LOG TYPES ============
export interface AuditLogEntry {
  timestamp: string;
  action: string;
  details: any;
  userId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
}

// ============ KPI TYPES ============
export interface KPIMetrics {
  totalProcessed: number;
  avgProcessingTime: string;
  stpRate: number;
  autoApprovedCount: number;
  escalatedCount: number;
  totalCostSavings: number;
  avgCostVariance: number;
  errorRate: number;
}

// ============ POLICY TYPES ============
export interface PolicyViolation {
  policy: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  action: string;
}

export interface PolicyEvaluation {
  violations: PolicyViolation[];
  warnings: Array<{ message: string; severity: string }>;
  policyChecksPassed: boolean;
}

// ============ API RESPONSE TYPES ============
export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code?: string;
    message: string;
    details?: any;
  };
}

export type APIResponse<T = any> = SuccessResponse<T> | ErrorResponse;
