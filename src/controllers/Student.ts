import { Request, Response } from 'express';
import { db } from '../db/index.ts';
import { 
  coursesTable,
  modulesTable,
  contentTable,
  doubtsTable,
  usersTable,
  educatorsTable,
  transactionsTable,
  reviewsTable
} from '../db/schema.ts';
import { and, eq, desc, gt, sql, count } from 'drizzle-orm';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

// export const getStudentDashboard = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const userId = req.user.id;

//     const [enrolledCourses, upcomingContent, doubts, progress] = await Promise.all([
//       // Get enrolled courses
//       db.select({
//         id: coursesTable.id,
//         name: coursesTable.name,
//         educatorName: usersTable.name,
//         completionRate: sql<number>`
//           (SELECT COUNT(*) FROM ${contentTable} 
//            WHERE completed = true AND course_id = ${coursesTable.id}) /
//           (SELECT COUNT(*) FROM ${contentTable} 
//            WHERE course_id = ${coursesTable.id}) * 100
//         `,
//         lastAccessed: transactionsTable.updatedAt
//       })
//       .from(coursesTable)
//       .innerJoin(transactionsTable, eq(transactionsTable.courseId, coursesTable.id))
//       .innerJoin(educatorsTable, eq(coursesTable.educatorId, educatorsTable.id))
//       .innerJoin(usersTable, eq(educatorsTable.userId, usersTable.id))
//       .where(eq(transactionsTable.userId, userId))
//       .orderBy(desc(transactionsTable.updatedAt))
//       .limit(5),

//       // Get upcoming content/modules
//       db.select({
//         id: contentTable.id,
//         title: contentTable.title,
//         type: contentTable.type,
//         courseName: coursesTable.name,
//         dueDate: contentTable.dueDate
//       })
//       .from(contentTable)
//       .innerJoin(coursesTable, eq(contentTable.courseId, coursesTable.id))
//       .innerJoin(transactionsTable, eq(coursesTable.id, transactionsTable.courseId))
//       .where(
//         and(
//           eq(transactionsTable.userId, userId),
//           gt(contentTable.dueDate, new Date()),
//           eq(contentTable.completed, false)
//         )
//       )
//       .orderBy(contentTable.dueDate)
//       .limit(3),

//       // Get recent doubts
//       db.select({
//         id: doubtsTable.id,
//         title: doubtsTable.title,
//         courseName: coursesTable.name,
//         resolved: doubtsTable.resolved,
//         createdAt: doubtsTable.createdAt,
//         repliesCount: sql<number>`
//           (SELECT COUNT(*) FROM doubt_replies WHERE doubt_id = ${doubtsTable.id})
//         `
//       })
//       .from(doubtsTable)
//       .innerJoin(coursesTable, eq(doubtsTable.courseId, coursesTable.id))
//       .where(eq(doubtsTable.userId, userId))
//       .orderBy(desc(doubtsTable.createdAt))
//       .limit(5),

//       // Get overall progress
//       db.select({
//         totalCourses: count(coursesTable.id),
//         completedContent: sql<number>`
//           COUNT(CASE WHEN ${contentTable.completed} = true THEN 1 END)
//         `,
//         totalContent: count(contentTable.id),
//         averageRating: sql<number>`
//           AVG(CASE WHEN ${reviewsTable.userId} = ${userId} THEN ${reviewsTable.rating} END)
//         `
//       })
//       .from(transactionsTable)
//       .innerJoin(coursesTable, eq(transactionsTable.courseId, coursesTable.id))
//       .leftJoin(contentTable, eq(coursesTable.id, contentTable.courseId))
//       .leftJoin(reviewsTable, eq(coursesTable.id, reviewsTable.courseId))
//       .where(eq(transactionsTable.userId, userId))
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: {
//         enrolledCourses,
//         upcomingContent,
//         doubts,
//         progress: progress[0],
//       }
//     });
//   } catch (error) {
//     console.error('Student dashboard error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching student dashboard data'
//     });
//   }
// };

// export const getStudentProgress = async (req: AuthenticatedRequest, res: Response) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     const [courseProgress, moduleProgress] = await Promise.all([
//       // Get course level progress
//       db.select({
//         courseName: coursesTable.name,
//         completedContent: sql<number>`
//           COUNT(CASE WHEN ${contentTable.completed} = true THEN 1 END)
//         `,
//         totalContent: count(contentTable.id),
//         lastAccessed: transactionsTable.updatedAt
//       })
//       .from(coursesTable)
//       .innerJoin(contentTable, eq(coursesTable.id, contentTable.courseId))
//       .innerJoin(transactionsTable, eq(coursesTable.id, transactionsTable.courseId))
//       .where(
//         and(
//           eq(coursesTable.id, courseId),
//           eq(transactionsTable.userId, userId)
//         )
//       )
//       .groupBy(coursesTable.name, transactionsTable.updatedAt),

//       // Get module level progress
//       db.select({
//         moduleId: modulesTable.id,
//         moduleName: modulesTable.name,
//         completedContent: sql<number>`
//           COUNT(CASE WHEN ${contentTable.completed} = true THEN 1 END)
//         `,
//         totalContent: count(contentTable.id)
//       })
//       .from(modulesTable)
//       .leftJoin(contentTable, eq(modulesTable.id, contentTable.moduleId))
//       .where(eq(modulesTable.courseId, courseId))
//       .groupBy(modulesTable.id, modulesTable.name)
//     ]);

//     return res.status(200).json({
//       success: true,
//       data: {
//         courseProgress: courseProgress[0],
//         moduleProgress
//       }
//     });
//   } catch (error) {
//     console.error('Student progress error:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error fetching student progress data'
//     });
//   }
// };

export const getEnrolledCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const enrolledCourses = await db
      .select({
        id: coursesTable.id,
        name: coursesTable.name,
        description: coursesTable.description,
        thumbnail: coursesTable.thumbnail,
        educatorName: usersTable.name,
        educatorPfp: usersTable.pfp,
        enrollmentDate: transactionsTable.date,
        completionRate: sql<number>`0` // TODO: Implement actual completion rate calculation
      })
      .from(transactionsTable)
      .innerJoin(
        coursesTable,
        eq(transactionsTable.courseId, coursesTable.id)
      )
      .innerJoin(
        educatorsTable,
        eq(coursesTable.educatorId, educatorsTable.id)
      )
      .innerJoin(
        usersTable,
        eq(educatorsTable.userId, usersTable.id)
      )
      .where(
        and(
          eq(transactionsTable.userId, userId),
          eq(transactionsTable.status, 'completed')
        )
      )
      .orderBy(desc(transactionsTable.date));

    return res.status(200).json({
      success: true,
      data: enrolledCourses
    });
  } catch (error) {
    console.error('Error in getEnrolledCourses:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch enrolled courses'
    });
  }
};




