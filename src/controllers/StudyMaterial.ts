import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { db } from '../db/index.ts';
import { studyMaterialsTable, contentTable } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { uploadMedia } from '../utils/storage.ts';

interface CustomRequest extends Request {
  files?: {
    material?: UploadedFile | UploadedFile[];
  };
}

export const uploadStudyMaterial = async (req: CustomRequest, res: Response) => {
  try {
    const { moduleId, title, description, order } = req.body;
    const file = req.files?.material;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const upload = await uploadMedia(file, 'document');

    const material = await db.insert(contentTable).values({
      moduleId,
      title,
      description,
      type: 'document',
      order: parseInt(order) || 0,
      fileUrl: upload.url,
      fileType: Array.isArray(file) ? file[0].mimetype : file.mimetype,
      views: 0,  // Changed from 0n to 0
      createdAt: new Date(),
      updatedAt: new Date(),
      isPreview: Boolean(req.body.isPreview)
    }).returning();

    return res.status(201).json({
      success: true,
      data: material[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error uploading study material'
    });
  }
};

export const getModuleStudyMaterials = async (req: Request, res: Response) => {
  try {
    const { moduleId } = req.params;
    
    const materials = await db.select()
      .from(contentTable)
      .where(and(
        eq(contentTable.moduleId, moduleId),
        eq(contentTable.type, 'document')
      ));

    if (!materials.length) {
      return res.status(404).json({
        success: false,
        message: 'No study materials found for this module'
      });
    }

    // Increment views for each material
    await Promise.all(materials.map(material => 
      db.update(contentTable)
        .set({ views: (material.views || 0) + 1 })
        .where(eq(contentTable.id, material.id))
    ));

    return res.status(200).json({
      success: true,
      data: materials
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching study materials'
    });
  }
};
