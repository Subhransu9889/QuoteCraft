import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

class ERPIntegrationService {
  private mockERPEnabled: boolean = process.env.MOCK_ERP_ENABLED === 'true';

  async createPurchaseOrder(poData: any): Promise<{
    success: boolean;
    poNumber: string;
    poId: string;
    status: string;
    createdAt: string;
    vendorNotificationSent: boolean;
  }> {
    try {
      if (this.mockERPEnabled) {
        return this.createMockPO(poData);
      }

      logger.warn('Real ERP integration not configured, using mock');
      return this.createMockPO(poData);
    } catch (error) {
      logger.error(`Error creating PO: ${error}`);
      throw error;
    }
  }

  private async createMockPO(poData: any): Promise<{
    success: boolean;
    poNumber: string;
    poId: string;
    status: string;
    createdAt: string;
    vendorNotificationSent: boolean;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const poNumber = `PO-${process.env.MOCK_ERP_PO_PREFIX || 'TEST'}-${Date.now()}`;

    logger.info(`Mock PO created: ${poNumber}`);

    return {
      success: true,
      poNumber,
      poId: `po-${uuidv4()}`,
      status: 'CREATED',
      createdAt: new Date().toISOString(),
      vendorNotificationSent: true
    };
  }

  async getPOStatus(poNumber: string): Promise<any> {
    logger.info(`Fetching PO status: ${poNumber}`);

    return {
      poNumber,
      status: 'CONFIRMED',
      confirmedAt: new Date().toISOString(),
      estimatedDelivery: new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000
      ).toISOString(),
      vendorAcknowledged: true
    };
  }
}

export default new ERPIntegrationService();
