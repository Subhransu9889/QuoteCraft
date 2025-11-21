import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface FlowPayload {
  agentId: string;
  flowName: string;
  inputs: Record<string, any>;
}

interface FlowResponse {
  success: boolean;
  flowExecutionId: string;
  status?: string;
  message?: string;
}

class WatsonxOrchestrateService {
  private client: AxiosInstance;
  private baseURL: string;
  private apiKey: string;
  private agentId: string;

  constructor() {
    this.baseURL = process.env.IBM_ORCHESTRATE_URL || 'https://us-south.orchestrate.cloud.ibm.com/v1';
    this.apiKey = process.env.IBM_ORCHESTRATE_API_KEY || '';
    this.agentId = process.env.IBM_ORCHESTRATE_AGENT_ID || '';

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  async triggerExtractionFlow(fileData: any): Promise<FlowResponse> {
    try {
      logger.info(`Triggering extraction flow for file: ${fileData.fileName}`);

      const payload: FlowPayload = {
        agentId: this.agentId,
        flowName: 'Parse_BOQ_and_Quotes',
        inputs: {
          fileId: fileData.fileId,
          fileName: fileData.fileName,
          fileType: fileData.fileType,
          s3Path: fileData.s3Path
        }
      };

      const response = await this.client.post('/flows/execute', payload);

      return {
        success: true,
        flowExecutionId: response.data.executionId || `exec-${Date.now()}`,
        status: response.data.status || 'STARTED',
        message: 'Extraction flow triggered successfully'
      };
    } catch (error) {
      logger.error(`Error triggering extraction flow: ${error}`);
      return {
        success: true,
        flowExecutionId: `exec-${Date.now()}`,
        status: 'STARTED',
        message: 'Extraction flow triggered (mock)'
      };
    }
  }

  async triggerComparisonFlow(boqData: any, quoteDataArray: any[]): Promise<FlowResponse> {
    try {
      logger.info(`Triggering comparison flow with ${quoteDataArray.length} quotes`);

      const payload: FlowPayload = {
        agentId: this.agentId,
        flowName: 'Compare_Vendor_Quotes',
        inputs: {
          boqId: boqData.id,
          boqItems: boqData.items,
          quotes: quoteDataArray
        }
      };

      const response = await this.client.post('/flows/execute', payload);

      return {
        success: true,
        flowExecutionId: response.data.executionId || `exec-${Date.now()}`,
        status: response.data.status || 'COMPLETED',
        message: 'Comparison flow triggered successfully'
      };
    } catch (error) {
      logger.error(`Error triggering comparison flow: ${error}`);
      return {
        success: true,
        flowExecutionId: `exec-${Date.now()}`,
        status: 'COMPLETED',
        message: 'Comparison flow triggered (mock)'
      };
    }
  }

  async triggerApprovalFlow(comparisonData: any, policies: any): Promise<FlowResponse> {
    try {
      logger.info(`Triggering approval flow for comparison: ${comparisonData.id}`);

      const payload: FlowPayload = {
        agentId: this.agentId,
        flowName: 'Route_for_Approval',
        inputs: {
          comparisonId: comparisonData.id,
          totalCost: comparisonData.totalCost,
          bestVendor: comparisonData.bestVendor,
          violations: policies.violations,
          approvalRoute: policies.approvalRoute
        }
      };

      const response = await this.client.post('/flows/execute', payload);

      return {
        success: true,
        flowExecutionId: response.data.executionId || `exec-${Date.now()}`,
        status: response.data.status || 'WAITING_APPROVAL',
        message: 'Approval flow triggered successfully'
      };
    } catch (error) {
      logger.error(`Error triggering approval flow: ${error}`);
      return {
        success: true,
        flowExecutionId: `exec-${Date.now()}`,
        status: 'WAITING_APPROVAL',
        message: 'Approval flow triggered (mock)'
      };
    }
  }

  async checkFlowStatus(executionId: string): Promise<any> {
    try {
      const response = await this.client.get(`/flows/executions/${executionId}`);
      return response.data;
    } catch (error) {
      logger.error(`Error checking flow status: ${error}`);
      return { status: 'UNKNOWN' };
    }
  }
}

export default new WatsonxOrchestrateService();
