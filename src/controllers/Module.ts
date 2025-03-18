import { Request, Response } from 'express';
import { db } from '../db/index.ts';
import { modulesTable } from '../db/schema.ts';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    isEducator: boolean;
  }
}

export const createModule = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { courseId, name, duration, videoCount, materialCount } = req.body;

    // Validate required fields
    if (!courseId || !name) {
      res.status(400).json({
        success: false,
        message: 'Course ID and name are required'
      });
      return;
    }

    // Check if user is authenticated and an educator
    if (!req.user || !req.user.isEducator) {
      res.status(403).json({
        success: false,
        message: 'Only authenticated educators can create modules'
      });
      return;
    }

    // Create new module
    const newModule = await db.insert(modulesTable)
      .values({
        courseId,
        name,
        duration: duration || null,
        videoCount: videoCount || 0,
        materialCount: materialCount || 0
      })
      .returning();

    res.status(201).json({
      success: true,
      message: 'Module created successfully',
      data: newModule[0]
    });
  } catch (error) {
    console.error('Error creating module:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating module'
    });
  }
};

