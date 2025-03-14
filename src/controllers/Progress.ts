import { Request, Response } from 'express';
import { db } from '../db';
import { 
   modulesTable, 
  progressTable, // Import existing progressTable
  contentTable 
} from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

// Add this interface
interface AuthenticatedRequest extends Request {
  user: {
    id: string; // or number, depending on your user ID type
  };
}

export const updateProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { contentId, completed, timeSpent } = req.body;
    const userId = req.user.id;

    const progress = await db.insert(progressTable)
      .values({
        userId,
        contentId,
        completed,
        timeSpent,
        lastAccessed: new Date()
      })
      .onConflictDoUpdate({
        target: [progressTable.userId, progressTable.contentId],
        set: {
          completed,
          timeSpent: sql`${progressTable.timeSpent} + ${timeSpent}`,
          lastAccessed: new Date()
        }
      })
      .returning();

    return res.status(200).json({
      success: true,
      data: progress[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating progress'
    });
  }
};

export const getCourseProgress = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Get all content IDs for the course
    const modules = await db.select()
      .from(modulesTable)
      .where(eq(modulesTable.courseId, courseId));

    const moduleIds = modules.map(m => m.id);

    // Get all content for these modules
    const content = await db.select()
      .from(contentTable)
      .where(sql`${contentTable.moduleId} = ANY(${moduleIds})`);

    // Get progress for all content
    const progress = await db.select()
      .from(progressTable)
      .where(
        and(
          eq(progressTable.userId, userId),
          sql`${progressTable.contentId} = ANY(${content.map(c => c.id)})`
        )
      );

    // Calculate completion percentage
    const totalContent = content.length;
    const completedContent = progress.filter(p => p.completed).length;
    const completionPercentage = totalContent > 0 ? (completedContent / totalContent) * 100 : 0;

    return res.status(200).json({
      success: true,
      data: {
        completionPercentage,
        lastAccessed: progress[0]?.lastAccessed,
        totalTimeSpent: progress.reduce((acc, curr) => acc + (curr.timeSpent ?? 0), 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching course progress'
    });
  }
};


