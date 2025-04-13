import { Request, Response, RequestHandler } from 'express';
import { db } from '../db/index.ts';
import { classesTable, coursesTable, educatorsTable, modulesTable } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { uploadMedia } from '../utils/storage.ts';
import { UploadedFile } from 'express-fileupload';

// Use the global Express namespace to extend Request
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  }
  files?: {
    [key: string]: UploadedFile | UploadedFile[];
  };
  courseId: string; }

async function isEducatorForCourse(userId: string, courseId: string): Promise<boolean> {
  const educator = await db
    .select()
    .from(educatorsTable)
    .innerJoin(coursesTable, eq(educatorsTable.id, coursesTable.educatorId))
    .where(and(
      eq(educatorsTable.userId, userId),
      eq(coursesTable.id, courseId)
    ))
    .limit(1);

  return educator.length > 0;
}

export const createClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id: userId } = req.user;
    const { moduleId, duration } = req.body;

    // Get courseId from moduleId
    const module = await db.select()
      .from(modulesTable)
      .where(eq(modulesTable.id, moduleId))
      .limit(1);

    if (!module.length) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }

    const courseId = module[0].courseId;
 
    // Check if the user is an educator for the course
    const isEducator = await isEducatorForCourse(userId, courseId);
   
    if (!isEducator) {
      return res.status(403).json({
        success: false,
        message: 'Only educators can create classes for this course'
      });
    }

    const videoFile = req.files?.video as UploadedFile;

    if (!videoFile) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }
  
    const videoUpload = await uploadMedia(videoFile);

    const newClass = await db.insert(classesTable).values({
      moduleId,
      views: 0, // Now we can use number directly
      duration: duration ? new Date(duration * 1000) : null, // Make duration optional
      fileId: videoUpload.url
    }).returning();
   
    return res.status(201).json({
      success: true,
      data: newClass[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating class'
    });
  }
};

export const getClassStream = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const classContent = await db.select().from(classesTable)
      .where(eq(classesTable.id, classId))
      .limit(1);

    if (!classContent.length) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Increment views
    await db.update(classesTable)
      .set({ views: (classContent[0].views || 0) + 1 })
      .where(eq(classesTable.id, classId));

    return res.status(200).json({
      success: true,
      data: classContent[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching class'
    });
  }
};

export const updateClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { id: userId } = req.user;
    const { duration, moduleId } = req.body;

    // Get courseId from moduleId
    const classDetails = await db
      .select({
        module: modulesTable,
      })
      .from(classesTable)
      .innerJoin(modulesTable, eq(classesTable.moduleId, modulesTable.id))
      .where(eq(classesTable.id, classId))
      .limit(1);

    if (!classDetails.length) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const courseId = classDetails[0].module.courseId;

    // Check if user is educator for the course
    const isEducator = await isEducatorForCourse(userId, courseId);
    
    if (!isEducator) {
      return res.status(403).json({
        success: false,
        message: 'Only educators can update classes'
      });
    }

    const updateData: Record<string, any> = {};

    // Update moduleId if provided
    if (moduleId) {
      updateData.moduleId = moduleId;
    }

    // Update duration if provided
    if (duration) {
      updateData.duration = new Date(duration * 1000);
    }

    // Handle video file update if provided
    if (req.files?.video) {
      const videoFile = req.files.video as UploadedFile;
      const videoUpload = await uploadMedia(videoFile);
      updateData.fileId = videoUpload.url;
    }

    const updatedClass = await db.update(classesTable)
      .set(updateData)
      .where(eq(classesTable.id, classId))
      .returning();

    return res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      class: updatedClass[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating class'
    });
  }
};

export const deleteClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { id: userId } = req.user;

    // Get courseId from moduleId
    const classDetails = await db
      .select({
        module: modulesTable,
      })
      .from(classesTable)
      .innerJoin(modulesTable, eq(classesTable.moduleId, modulesTable.id))
      .where(eq(classesTable.id, classId))
      .limit(1);

    if (!classDetails.length) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const courseId = classDetails[0].module.courseId;

    // Check if user is educator for the course
    const isEducator = await isEducatorForCourse(userId, courseId);
    
    if (!isEducator) {
      return res.status(403).json({
        success: false,
        message: 'Only educators can delete classes'
      });
    }

    await db.delete(classesTable)
      .where(eq(classesTable.id, classId));

    return res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting class'
    });
  }
};

export const getModuleClasses = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;

    const classes = await db
      .select({
        id: classesTable.id,
        moduleId: classesTable.moduleId,
        views: classesTable.views,
        duration: classesTable.duration,
        fileId: classesTable.fileId
      })
      .from(classesTable)
      .where(eq(classesTable.moduleId, moduleId));

    return res.status(200).json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching module classes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching module classes'
    });
  }
};

// // Helper function to check if user is educator for the class
// async function isEducatorForClass(userId: string, classId: string) {
//   const result = await db
//     .select()
//     .from(classesTable)
//     .innerJoin(coursesTable, eq(classesTable.moduleId, coursesTable.id))
//     .innerJoin(educatorsTable, eq(coursesTable.educatorId, educatorsTable.id))
//     .where(and(
//       eq(classesTable.id, classId),
//       eq(educatorsTable.userId, userId)
//     ));
  
//   return result.length > 0;
// }


