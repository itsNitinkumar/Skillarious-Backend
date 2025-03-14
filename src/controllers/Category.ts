import { Request, Response } from 'express';
import { db } from '../db/index.ts';
import { categoryTable, coursesTable } from '../db/schema.ts';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, courseId } = req.body;

    const category = await db.insert(categoryTable).values({
      name,
      description,
      courseId
    }).returning();

    return res.status(201).json({
      success: true,
      data: category[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error creating category'
    });
  }
};

