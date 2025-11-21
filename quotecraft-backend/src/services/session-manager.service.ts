import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Session data structure
 */
interface Session {
  id: string;
  userId?: string;
  email?: string;
  createdAt: Date;
  lastActivity: Date;
  data: Record<string, any>;
  expiresAt: Date;
}

/**
 * Session Manager Service
 * Manages user sessions for tracking uploads, comparisons, and approvals
 */
class SessionManagerService {
  private sessions: Map<string, Session> = new Map();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  /**
   * Create a new session
   */
  createSession(userId?: string, email?: string): Session {
    const sessionId = uuidv4();
    const now = new Date();

    const session: Session = {
      id: sessionId,
      userId,
      email,
      createdAt: now,
      lastActivity: now,
      data: {},
      expiresAt: new Date(now.getTime() + this.SESSION_TIMEOUT),
    };

    this.sessions.set(sessionId, session);
    logger.info(`Session created: ${sessionId}`);

    // Schedule cleanup
    this.scheduleCleanup(sessionId);

    return session;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): Session | null {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    // Check if expired
    if (new Date() > session.expiresAt) {
      this.deleteSession(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT);

    return session;
  }

  /**
   * Update session data
   */
  updateSession(sessionId: string, data: Record<string, any>): Session | null {
    const session = this.getSession(sessionId);

    if (!session) {
      logger.warn(`Session not found: ${sessionId}`);
      return null;
    }

    session.data = { ...session.data, ...data };
    session.lastActivity = new Date();

    logger.info(`Session updated: ${sessionId}`);
    return session;
  }

  /**
   * Store uploaded BOQ in session
   */
  storeUploadedBOQ(sessionId: string, boqData: any): Session | null {
    return this.updateSession(sessionId, { uploadedBOQ: boqData });
  }

  /**
   * Store uploaded quote in session
   */
  storeUploadedQuote(sessionId: string, quoteData: any): Session | null {
    const session = this.getSession(sessionId);

    if (!session) {
      return null;
    }

    const quotes = session.data.uploadedQuotes || [];
    quotes.push(quoteData);

    return this.updateSession(sessionId, { uploadedQuotes: quotes });
  }

  /**
   * Get uploaded files from session
   */
  getUploadedFiles(sessionId: string): {
    boq: any | null;
    quotes: any[];
  } {
    const session = this.getSession(sessionId);

    if (!session) {
      return { boq: null, quotes: [] };
    }

    return {
      boq: session.data.uploadedBOQ || null,
      quotes: session.data.uploadedQuotes || [],
    };
  }

  /**
   * Store comparison result in session
   */
  storeComparison(sessionId: string, comparisonId: string, comparisonData: any): Session | null {
    const session = this.getSession(sessionId);

    if (!session) {
      return null;
    }

    const comparisons = session.data.comparisons || {};
    comparisons[comparisonId] = comparisonData;

    return this.updateSession(sessionId, { comparisons });
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);

    if (deleted) {
      logger.info(`Session deleted: ${sessionId}`);
    }

    return deleted;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): Session[] {
    const now = new Date();
    const activeSessions: Session[] = [];

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now <= session.expiresAt) {
        activeSessions.push(session);
      } else {
        // Clean up expired session
        this.sessions.delete(sessionId);
      }
    }

    return activeSessions;
  }

  /**
   * Get session statistics
   */
  getStatistics(): {
    totalSessions: number;
    activeSessions: number;
    expiredSessions: number;
  } {
    const now = new Date();
    let active = 0;
    let expired = 0;

    for (const session of this.sessions.values()) {
      if (now <= session.expiresAt) {
        active++;
      } else {
        expired++;
      }
    }

    return {
      totalSessions: this.sessions.size,
      activeSessions: active,
      expiredSessions: expired,
    };
  }

  /**
   * Schedule session cleanup
   */
  private scheduleCleanup(sessionId: string): void {
    setTimeout(() => {
      const session = this.sessions.get(sessionId);

      if (session && new Date() > session.expiresAt) {
        this.deleteSession(sessionId);
      }
    }, this.SESSION_TIMEOUT + 60000); // Cleanup 1 minute after expiry
  }

  /**
   * Clean up all expired sessions
   */
  cleanupExpiredSessions(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`Cleaned up ${cleaned} expired sessions`);
    }

    return cleaned;
  }
}

export const sessionManagerService = new SessionManagerService();

// Run cleanup every 5 minutes
setInterval(() => {
  sessionManagerService.cleanupExpiredSessions();
}, 5 * 60 * 1000);
