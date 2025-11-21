import axios from 'axios';
import { logger } from '../utils/logger';

class NotificationService {
  async sendSlackNotification(
    comparisonData: any,
    approverEmail: string
  ): Promise<{ success: boolean; channel: string }> {
    try {
      const webhookUrl = process.env.SLACK_WEBHOOK_URL;

      if (!webhookUrl) {
        logger.warn('Slack webhook URL not configured, skipping notification');
        return { success: true, channel: 'slack-mock' };
      }

      const message = {
        text: '📊 New Purchase Approval Required',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🛒 Purchase Approval Request'
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Comparison ID:*\n${comparisonData.id}`
              },
              {
                type: 'mrkdwn',
                text: `*Total Cost:*\n${comparisonData.totalCost?.toFixed(2) || 'N/A'}`
              },
              {
                type: 'mrkdwn',
                text: `*Best Vendor:*\n${comparisonData.bestVendor || 'TBD'}`
              }
            ]
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Approve'
                },
                value: comparisonData.id,
                action_id: 'approve_button',
                style: 'primary'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Reject'
                },
                value: comparisonData.id,
                action_id: 'reject_button',
                style: 'danger'
              }
            ]
          }
        ]
      };

      await axios.post(webhookUrl, message);
      logger.info(`Slack notification sent for comparison: ${comparisonData.id}`);
      return { success: true, channel: 'slack' };
    } catch (error) {
      logger.error(`Error sending Slack notification: ${error}`);
      return { success: false, channel: 'slack' };
    }
  }

  async sendEmailNotification(
    toEmail: string,
    subject: string,
    htmlContent: string
  ): Promise<{ success: boolean; channel: string; recipient: string }> {
    try {
      logger.info(`Email would be sent to: ${toEmail}`);
      return { success: true, channel: 'email', recipient: toEmail };
    } catch (error) {
      logger.error(`Error sending email: ${error}`);
      return { success: false, channel: 'email', recipient: toEmail };
    }
  }
}

export default new NotificationService();
