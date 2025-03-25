import { Request, Response, NextFunction } from 'express/index.js';
import { db } from '../db/index.ts';
import { adminLogsTable } from '../db/schema.ts';

type AdminAction = 
  | 'BAN_USER' 
  | 'UNBAN_USER'
  | 'DISMISS_COURSE'
  | 'DISMISS_MODULE'
  | 'DISMISS_CONTENT'
  | 'DISMISS_STUDY_MATERIAL';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

export const logAdminAction = (action: AdminAction) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.user.id;
      const targetId = req.params.userId || req.params.courseId || req.params.moduleId || 
                      req.params.contentId || req.params.materialId;
      
      await db.insert(adminLogsTable).values({
        adminId,
        action,
        targetId,
        metadata: req.body,
        createdAt: new Date()
      });

      next();
    } catch (error) {
      // Log error but don't block the request
      console.error('Error logging admin action:', error);
      next();
    }
  };
};