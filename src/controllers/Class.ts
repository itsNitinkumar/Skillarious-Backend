import { Request, Response, RequestHandler } from 'express';
import { db } from '../db/index.ts';
import { contentTable } from '../db/schema.ts';
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
}

export const createClass = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { moduleId, title, description, order } = req.body;
    const videoFile = req.files?.video as UploadedFile;

    if (!videoFile) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const videoUpload = await uploadMedia(videoFile);

    const newClass = await db.insert(contentTable).values({
      moduleId,
      title,
      description,
      order: parseInt(order) || 0,
      fileUrl: videoUpload.url,
      type: videoFile.mimetype,
      isPreview: Boolean(req.body.isPreview),
      duration: parseFloat(req.body.duration) || 0.0,
      createdAt: new Date(),
      updatedAt: new Date()
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

export const getClassStream = async (req:Request, res: Response) => {
  try {
    const { classId } = req.params;
    const classContent = await db.select().from(contentTable)
      .where(and(
        eq(contentTable.id, classId)
      ))
      .limit(1);

    if (!classContent.length) {
      res.status(404).json({
        success: false,
        message: 'Class not found'
      });
      return;
    }

    // Increment views
    await db.update(contentTable)
      .set({ views: (classContent[0].views || 0) + 1 })
      .where(eq(contentTable.id, classId));

    res.status(200).json({
      success: true,
      data: classContent[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class'
    });
  }
};




