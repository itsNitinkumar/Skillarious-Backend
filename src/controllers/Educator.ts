import { Request, Response } from 'express';
import { db } from '../db/index.ts';
import { 
  educatorsTable, 
  coursesTable, 
  doubtsTable, 
  transactionsTable 
} from '../db/schema.ts';
import { eq, and, sql } from 'drizzle-orm';
import { uploadMedia } from '../utils/storage.ts';

interface AuthenticatedRequest extends Request {
  user: {
    id: string
  };
}

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bio, about } = req.body;
    const educatorId = req.user.id;
    
    const profilePic = req.files?.profilePic;
    let profilePicUrl;

    if (profilePic) {
      const upload = await uploadMedia(profilePic, 'image');
      profilePicUrl = upload.url;
    }

    const updatedProfile = await db.update(educatorsTable)
      .set({
        bio,
        about,
        ...(profilePicUrl ? { profilePic: profilePicUrl } : {})
      })
      .where(eq(educatorsTable.id, educatorId))
      .returning();

    return res.status(200).json({
      success: true,
      data: updatedProfile[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const educatorId = (req as AuthenticatedRequest).user.id;

    // Get total courses
    const courses = await db.select().from(coursesTable)
      .where(eq(coursesTable.educatorId, educatorId));

    // Get total students from transactions
    const enrolledStudents = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.status, 'completed'),
          sql`${transactionsTable.courseId} IN (
            SELECT id FROM ${coursesTable}
            WHERE ${coursesTable.educatorId} = ${educatorId}
          )`
        )
      );

    const uniqueStudents = [...new Set(enrolledStudents.map(e => e.userId))];
    const totalStudents = uniqueStudents.length;

    // Get total doubts
    const doubts = await db.select().from(doubtsTable)
      .where(eq(doubtsTable.educatorAssigned, educatorId));

    // Calculate response rate
    const resolvedDoubts = doubts.filter(d => d.resolved);
    const responseRate = doubts.length > 0 
      ? (resolvedDoubts.length / doubts.length) * 100 
      : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalCourses: courses.length,
        totalStudents,
        totalDoubts: doubts.length,
        responseRate,
        totalRevenue: enrolledStudents.reduce((sum, t) => sum + Number(t.amount), 0)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};