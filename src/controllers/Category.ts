import { Request, Response } from 'express';
import { db } from '../db/index.ts';
import { categoryTable, usersTable } from '../db/schema.ts';
import { sql, eq } from 'drizzle-orm';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}
export const createCategory = async (req: AuthenticatedRequest, res: Response) => {
  try { 
    const { id } = req.user;
    if(!id){
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    // Check if user is authenticated and an educator
    const isEducator = await db.select().from(usersTable).where(eq(usersTable.id, id)).then((data) => data[0].isEducator);
    if (!isEducator) {
      res.status(403).json({
        success: false,
        message: 'Only authenticated educators can create categories'
      });
      return;
    }
    const { name, description } = req.body;

    const category = await db.insert(categoryTable).values({
      name,
      description
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
// controller for searching categories
export const getCategoryBySearch = async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    console.log('Search query:', query);

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Invalid search query' 
      });
    }

    const categories = await db
      .select({
        id: categoryTable.id, 
        name: categoryTable.name,
        description: categoryTable.description
      })
      .from(categoryTable)
      .where(sql`${categoryTable.name} ILIKE ${query + '%'}`);


    return res.status(200).json({
      success: true,
      message: 'Categories searched successfully',
      data: categories
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error searching categories'
    });
  }
};




