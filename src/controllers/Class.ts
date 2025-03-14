import { Request, Response, RequestHandler } from 'express';
import { db } from '../db/index.ts';
import { contentTable } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { uploadMedia } from '../utils/storage.ts';
import { UploadedFile } from 'express-fileupload';

// Use the global Express namespace to extend Request
interface CustomRequest extends Request {
  files?: {
    [key: string]: UploadedFile | UploadedFile[];
  };
}

export const createClass: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { moduleId, title, description, order } = req.body;
    const customReq = req as CustomRequest;
    const videoFile = customReq.files?.video as UploadedFile;

    if (!videoFile) {
      res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
      return;
    }

    const videoUpload = await uploadMedia(videoFile, 'video');

    const newClass = await db.insert(contentTable).values({
      moduleId,
      title,
      description,
      type: 'video', 
      order,
      fileUrl: videoUpload.url,
      isPreview: Boolean(req.body.isPreview),
      duration: parseFloat(req.body.duration) || 0.0,
    }).returning();

    res.status(201).json({
      success: true,
      data: newClass[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating class'
    });
  }
};

export const getClassStream: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;
    const classContent = await db.select().from(contentTable)
      .where(and(
        eq(contentTable.id, classId),
        eq(contentTable.type, 'video')
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
      .set({ views: (classContent[0].views || 0n) + 1n })
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