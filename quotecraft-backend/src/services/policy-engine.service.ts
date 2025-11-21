import { PolicyEvaluation, PolicyViolation } from '../models/types';

class PolicyEngineService {
  private preferredVendors: string[] = [
    'Best Supply Co.',
    'Quality Goods Inc.',
    'Trusted Partners Ltd.'
  ];

  private approvalThresholds = {
    PROCUREMENT_MANAGER: 50000,
    FINANCE_DIRECTOR: 500000,
    EXECUTIVE: Infinity
  };

  evaluatePolicies(
    totalCost: number,
    quoteCount: number,
    unmatchedItemsCount: number,
    costVariance: number
  ): PolicyEvaluation {
    const violations: PolicyViolation[] = [];
    const warnings: Array<{ message: string; severity: string }> = [];

    if (totalCost > 10000 && quoteCount < 3) {
      violations.push({
        policy: 'threeQuoteRule',
        message: 'Total cost > $10k requires 3+ quotes',
        severity: 'HIGH',
        action: 'ESCALATE_TO_PROCUREMENT'
      });
    }

    if (unmatchedItemsCount > 0) {
      violations.push({
        policy: 'specCompliance',
        message: `${unmatchedItemsCount} items not in BOQ`,
        severity: 'MEDIUM',
        action: 'FLAG_FOR_REVIEW'
      });
    }

    if (costVariance < -50) {
      warnings.push({
        message: 'Unusually low price; verify vendor capacity',
        severity: 'MEDIUM'
      });
    } else if (costVariance > 50) {
      warnings.push({
        message: 'Unusually high price; consider renegotiation',
        severity: 'MEDIUM'
      });
    }

    return {
      violations,
      warnings,
      policyChecksPassed: violations.length === 0
    };
  }

  determineApprovalRoute(
    totalCost: number,
    hasViolations: boolean
  ): 'PROCUREMENT_MANAGER' | 'FINANCE_DIRECTOR' | 'EXECUTIVE' {
    if (hasViolations) {
      return 'PROCUREMENT_MANAGER';
    }

    if (totalCost <= this.approvalThresholds.PROCUREMENT_MANAGER) {
      return 'PROCUREMENT_MANAGER';
    } else if (totalCost <= this.approvalThresholds.FINANCE_DIRECTOR) {
      return 'FINANCE_DIRECTOR';
    } else {
      return 'EXECUTIVE';
    }
  }

  isPreferredVendor(vendorName: string): boolean {
    return this.preferredVendors.some((pv) =>
      vendorName.toLowerCase().includes(pv.toLowerCase())
    );
  }
}

export default new PolicyEngineService();
