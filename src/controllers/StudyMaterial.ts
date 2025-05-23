import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { db } from '../db/index.ts';
import {  contentTable, usersTable, modulesTable, coursesTable, educatorsTable } from '../db/schema.ts';
import { eq, and, or } from 'drizzle-orm';
import { uploadMedia, deleteMedia } from '../utils/storage.ts';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  },
  files?: {
    material?: UploadedFile | UploadedFile[];
  };
}

// Helper function to check if user is educator
const isEducator = async (userId: string): Promise<boolean> => {
  try {
    const user = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    return user.length > 0 && user[0].isEducator;
  } catch (error) {
    console.error('Error checking educator status:', error);
    return false;
  }
};

// Helper function to validate authentication
const validateAuth = async (req: AuthenticatedRequest): Promise<{ isValid: boolean; message?: string }> => {
  if (!req.user?.id) {
    return { isValid: false, message: 'User not authenticated' };
  }
  const educatorStatus = await isEducator(req.user.id);
  if (!educatorStatus) {
    return { isValid: false, message: 'Only educators can perform this action' };
  }
  return { isValid: true };
};

// Controller for uploading study material
export const uploadStudyMaterial = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { moduleId, title, description, order } = req.body;
    const file = req.files?.material as UploadedFile;

    if (!moduleId || !title || !file) {
      return res.status(400).json({
        success: false,
        message: 'Module ID, title and file are required'
      });
    }

    console.log('Processing file upload:', {
      name: file.name,
      type: file.mimetype,
      size: file.size,
      tempPath: file.tempFilePath
    });

    const upload = await uploadMedia(file);

    const material = await db.insert(contentTable).values({
      moduleId,
      title,
      description,
      fileUrl: upload.url,
      type: file.mimetype,
      order: parseInt(order) || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPreview: Boolean(req.body.isPreview),
      duration: file.mimetype.startsWith('video/') ? parseFloat(req.body.duration) : null
    }).returning();
    console.log('File details:', {
      name: file.name,
      type: file.mimetype,
      size: file.size,
      url: upload.url
    });
    return res.status(201).json({
      success: true,
      data: material[0],
      message: "Study material uploaded successfully",
    });
  

  } catch (error: any) {
    console.error('Error in uploadStudyMaterial:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload study material',
      error: error.message
    });
  }
};


// Controller for updating study material

export const updateStudyMaterial = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Validate authentication
    const authValidation = await validateAuth(req);
    if (!authValidation.isValid) {
      return res.status(401).json({
        success: false,
        message: authValidation.message
      });
    }

    // First, validate that the material belongs to the educator
    const { materialId } = req.params;
    const { title, description, order, isPreview, moduleId } = req.body;

    // First validate that the material exists and get its current module
    const existingMaterial = await db
      .select({
        material: {
          id: contentTable.id,
          fileUrl: contentTable.fileUrl,
          moduleId: contentTable.moduleId,
          courseId: modulesTable.courseId,
          educatorId: coursesTable.educatorId,
          userId: educatorsTable.userId
        },
     
       
      })
      .from(contentTable)
      .innerJoin(
        modulesTable, 
        eq(contentTable.moduleId, modulesTable.id)
      )
      .innerJoin(
        coursesTable, 
        eq(modulesTable.courseId, coursesTable.id)
      )
      .innerJoin(
        educatorsTable, 
        eq(coursesTable.educatorId, educatorsTable.id)
      )
      .innerJoin(
        usersTable, 
        eq(educatorsTable.userId, usersTable.id)
      )
      .where(eq(contentTable.id, materialId));
     
    console.log('Debug - Found material:', existingMaterial); // Debug log
    console.log('Debug - User ID:', req.user.id); // Debug log

    if (!existingMaterial.length) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Then check if the educator owns this content
    if (existingMaterial[0].material.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this content'
      });
    }

    // If trying to update moduleId, validate the new module exists
    if (moduleId) {
      const moduleExists = await db.select()
        .from(modulesTable)
        .where(eq(modulesTable.id, moduleId));

      if (!moduleExists.length) {
        return res.status(400).json({
          success: false,
          message: 'Invalid module ID provided'
        });
      }
    }

    const updateData: Record<string, any> = {
      updatedAt: new Date()
    };
    
    // If no moduleId provided in update, use the current one
    if (!moduleId) {
      updateData.moduleId = existingMaterial[0].material.moduleId;
    }

    // Set update fields with validation
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (moduleId) updateData.moduleId = moduleId;
    if (order !== undefined) updateData.order = parseInt(order);
    if (isPreview !== undefined) updateData.isPreview = Boolean(isPreview);

    const file = req.files?.material;

    // Handle file upload if provided
    if (file) {
      const fileToUpload = Array.isArray(file) ? file[0] : file;
      
      try {
        const upload = await uploadMedia(fileToUpload);
        updateData.fileUrl = upload.url;
        updateData.type = fileToUpload.mimetype;

        // Delete old file if exists
        if (existingMaterial[0].material.fileUrl) {
          const oldPublicId = existingMaterial[0].material.fileUrl.split('/').slice(-1)[0].split('.')[0];
          await deleteMedia(oldPublicId);
        }
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload new file'
        });
      }
    }

    // Perform the update
    const updatedMaterial = await db.update(contentTable)
      .set(updateData)
      .where(eq(contentTable.id, materialId))
      .returning();

    return res.status(200).json({
      success: true,
      data: updatedMaterial[0],
      message: 'Study material updated successfully'
    });

  } catch (error) {
    console.error('Error in updateStudyMaterial:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update study material'
    });
  }
};

// Controller for deleting study material
export const deleteStudyMaterial = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    // Validate authentication
    const authValidation = await validateAuth(req);
    if (!authValidation.isValid) {
      return res.status(401).json({
        success: false,
        message: authValidation.message
      });
    }

    const { materialId } = req.params;
    if (!materialId) {
      return res.status(400).json({
        success: false,
        message: 'Material ID is required'
      });
    }     

    const existingmaterial = await db.select(
      {
        material: {
          id: contentTable.id,
          fileUrl: contentTable.fileUrl,
          moduleId: contentTable.moduleId,
        },
        course:{courseId: modulesTable.courseId},
        
         user:{ educatorId: coursesTable.educatorId,
          userId: educatorsTable.userId}
        
      },
      
    )
      .from(contentTable)
      .innerJoin(
        modulesTable, 
        eq(contentTable.moduleId, modulesTable.id)
      )
      .innerJoin(
        coursesTable, 
        eq(modulesTable.courseId, coursesTable.id)
      )
      .innerJoin(
        educatorsTable, 
        eq(coursesTable.educatorId, educatorsTable.id)
      )
      .innerJoin(
        usersTable, 
        eq(educatorsTable.userId, usersTable.id)
      )
      .where(and(
        eq(contentTable.id, materialId),
        
      ));

      

    if (!existingmaterial.length) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found'
      });
    }

    // Delete file from storage if exists
    if (existingmaterial[0].material.fileUrl) {
      const urlParts = existingmaterial[0].material.fileUrl.split('/');
      const public_id = urlParts.slice(urlParts.indexOf('skillarious')).join('/').split('.')[0];
      await deleteMedia(public_id);
    }

    // Delete from database
    await db.delete(contentTable)
      .where(eq(contentTable.id, materialId));

    // Delete from cloudinary
    await deleteMedia(existingmaterial[0].material.fileUrl);

    return res.status(200).json({
      success: true,
      message: 'Study material deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteStudyMaterial:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete study material',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Controller for getting study materials for a module

export const getModuleStudyMaterials = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { moduleId } = req.params;
    
    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: 'Module ID is required'
      });
    }

    const materials = await db.select()
      .from(contentTable)
      .where(and(
        eq(contentTable.moduleId, moduleId),

      ))
      .orderBy(contentTable.order);

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
    console.error('Error in getModuleStudyMaterials:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch study materials',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const moderateStudyMaterial = {
  dismissMaterial: async (req: Request, res: Response) => {
    try {
      const { materialId } = req.params;
      const { reason } = req.body;

      const dismissedMaterial = await db
        .update(contentTable)
        .set({ 
          isDismissed: true,
          dismissReason: reason,
          dismissedAt: new Date()
        })
        .where(eq(contentTable.id, materialId))
        .returning();

      return res.status(200).json({
        success: true,
        message: 'Study material dismissed successfully',
        data: dismissedMaterial[0]
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error dismissing study material'
      });
    }
  }
};


