import { Request, Response } from 'express';
import { db } from '../db';
import { 
  usersTable, 
  coursesTable, 
  modulesTable,
  contentTable,
  educatorsTable,
  categoryTable,
  categoryCoursesTable,
  transactionsTable,
  reviewsTable,
  doubtsTable,
} from '../db/schema';
import { eq, and, sql, desc, count, avg, SQL } from 'drizzle-orm';

// Platform Overview Analytics
export const getPlatformOverview = async (req: Request, res: Response) => {
  try {
    const overview = await db
      .select({
        // User Metrics
        totalUsers: sql<number>`COUNT(DISTINCT ${usersTable.id})`,
        totalEducators: sql<number>`COUNT(DISTINCT ${educatorsTable.id})`,
        verifiedUsers: sql<number>`COUNT(CASE WHEN ${usersTable.verified} = true THEN 1 END)`,
        
        // Course Metrics
        totalCourses: sql<number>`COUNT(DISTINCT ${coursesTable.id})`,
        activeCourses: sql<number>`COUNT(DISTINCT CASE WHEN ${coursesTable.end} >= NOW() THEN ${coursesTable.id} END)`,
        totalCategories: sql<number>`COUNT(DISTINCT ${categoryTable.id})`,
        totalModules: sql<number>`COUNT(DISTINCT ${modulesTable.id})`,
        
        // Content Metrics
        totalContent: sql<number>`COUNT(DISTINCT ${contentTable.id})`,
        
        // Financial Metrics
        totalRevenue: sql<number>`SUM(${transactionsTable.amount})`,
        successfulTransactions: sql<number>`COUNT(CASE WHEN ${transactionsTable.status} = 'completed' THEN 1 END)`,
        
        // Review Metrics
        totalReviews: sql<number>`COUNT(DISTINCT ${reviewsTable.id})`,
        averageRating: sql<number>`AVG(${reviewsTable.rating})`,
        
        // Support Metrics
        totalDoubts: sql<number>`COUNT(DISTINCT ${doubtsTable.id})`,
        resolvedDoubts: sql<number>`COUNT(CASE WHEN ${doubtsTable.resolved} = true THEN 1 END)`,
      })
      .from(usersTable)
      .leftJoin(educatorsTable, eq(usersTable.id, educatorsTable.userId))
      .leftJoin(coursesTable, eq(educatorsTable.id, coursesTable.educatorId))
      .leftJoin(transactionsTable, eq(coursesTable.id, transactionsTable.courseId))
      .leftJoin(reviewsTable, eq(coursesTable.id, reviewsTable.courseId))
      .leftJoin(doubtsTable, eq(usersTable.id, doubtsTable.userId));

    return res.status(200).json({
      success: true,
      data: overview[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching platform overview'
    });
  }
};

// Review Analytics
export const getReviewAnalytics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, courseId, educatorId } = req.query;
    
    let conditions: SQL[] = [];
    
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        conditions.push(
          sql`${reviewsTable.createdAt} BETWEEN ${start}::timestamp AND ${end}::timestamp`
        );
      }
    }
    if (courseId) {
      conditions.push(eq(reviewsTable.courseId, courseId as string));
    }
    if (educatorId) {
      conditions.push(eq(reviewsTable.educatorId, educatorId as string));
    }

    let query = db
      .select({
        totalReviews: count(reviewsTable.id),
        averageRating: avg(reviewsTable.rating),
        
        // Rating Distribution
        fiveStarCount: sql<number>`COUNT(CASE WHEN ${reviewsTable.rating} = 5 THEN 1 END)`,
        fourStarCount: sql<number>`COUNT(CASE WHEN ${reviewsTable.rating} = 4 THEN 1 END)`,
        threeStarCount: sql<number>`COUNT(CASE WHEN ${reviewsTable.rating} = 3 THEN 1 END)`,
        twoStarCount: sql<number>`COUNT(CASE WHEN ${reviewsTable.rating} = 2 THEN 1 END)`,
        oneStarCount: sql<number>`COUNT(CASE WHEN ${reviewsTable.rating} = 1 THEN 1 END)`,
        
        courseId: coursesTable.id,
        courseName: coursesTable.name,
        educatorId: educatorsTable.id,
        educatorName: usersTable.name,
      })
      .from(reviewsTable)
      .leftJoin(coursesTable, eq(reviewsTable.courseId, coursesTable.id))
      .leftJoin(educatorsTable, eq(reviewsTable.educatorId, educatorsTable.id))
      .leftJoin(usersTable, eq(educatorsTable.userId, usersTable.id))
      .where(conditions.length ? and(...conditions) : undefined);

    const reviewStats = await query;

    // Get top reviewed courses
    const topCourses = await db
      .select({
        courseId: coursesTable.id,
        courseName: coursesTable.name,
        totalReviews: count(reviewsTable.id),
        averageRating: avg(reviewsTable.rating),
        educatorName: usersTable.name
      })
      .from(coursesTable)
      .leftJoin(reviewsTable, eq(coursesTable.id, reviewsTable.courseId))
      .leftJoin(educatorsTable, eq(coursesTable.educatorId, educatorsTable.id))
      .leftJoin(usersTable, eq(educatorsTable.userId, usersTable.id))
      .groupBy(coursesTable.id, coursesTable.name, usersTable.name)
      .orderBy(desc(avg(reviewsTable.rating)))
      .limit(10);

    return res.status(200).json({
      success: true,
      data: {
        overview: reviewStats[0],
        topCourses
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching review analytics'
    });
  }
};

// Course Category Analytics
export const getCategoryAnalytics = async (req: Request, res: Response) => {
  try {
    const categoryStats = await db
      .select({
        categoryId: categoryTable.id,
        categoryName: categoryTable.name,
        courseCount: sql<number>`COUNT(DISTINCT ${categoryCoursesTable.courseId})`,
        totalRevenue: sql<number>`SUM(${transactionsTable.amount})`,
        averageRating: avg(reviewsTable.rating)
      })
      .from(categoryTable)
      .leftJoin(categoryCoursesTable, eq(categoryTable.id, categoryCoursesTable.categoryId))
      .leftJoin(coursesTable, eq(categoryCoursesTable.courseId, coursesTable.id))
      .leftJoin(transactionsTable, eq(coursesTable.id, transactionsTable.courseId))
      .leftJoin(reviewsTable, eq(coursesTable.id, reviewsTable.courseId))
      .groupBy(categoryTable.id, categoryTable.name)
      .orderBy(desc(sql<number>`COUNT(DISTINCT ${categoryCoursesTable.courseId})`));

    return res.status(200).json({
      success: true,
      data: categoryStats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching category analytics'
    });
  }
};

// Educator Analytics
export const getEducatorAnalytics = async (req: Request, res: Response) => {
  try {
    const educatorStats = await db
      .select({
        educatorId: educatorsTable.id,
        educatorName: usersTable.name,
        courseCount: sql<number>`COUNT(DISTINCT ${coursesTable.id})`,
        totalStudents: sql<number>`COUNT(DISTINCT ${transactionsTable.userId})`,
        totalRevenue: sql<number>`SUM(${transactionsTable.amount})`,
        averageRating: avg(reviewsTable.rating),
        totalDoubts: sql<number>`COUNT(DISTINCT ${doubtsTable.id})`,
        resolvedDoubts: sql<number>`COUNT(CASE WHEN ${doubtsTable.resolved} = true THEN 1 END)`
      })
      .from(educatorsTable)
      .leftJoin(usersTable, eq(educatorsTable.userId, usersTable.id))
      .leftJoin(coursesTable, eq(educatorsTable.id, coursesTable.educatorId))
      .leftJoin(transactionsTable, eq(coursesTable.id, transactionsTable.courseId))
      .leftJoin(reviewsTable, eq(coursesTable.id, reviewsTable.courseId))
      .leftJoin(doubtsTable, eq(educatorsTable.id, doubtsTable.educatorAssigned))
      .groupBy(educatorsTable.id, usersTable.name)
      .orderBy(desc(sql<number>`COUNT(DISTINCT ${coursesTable.id})`));

    return res.status(200).json({
      success: true,
      data: educatorStats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching educator analytics'
    });
  }
};























