import { db } from '../src/db';
import {
  usersTable,
  educatorsTable,
  coursesTable,
  modulesTable,
  contentTable,
  doubtsTable,
  messagesTable,
  classesTable,
  transactionsTable,
  categoryCoursesTable,
  categoryTable,
  filesTable
} from '../src/db/schema';
import { fakerEN as faker } from '@faker-js/faker';
import crypto from 'crypto';

import {
  generateDummyUsers,
  generateDummyEducators,
  generateDummyCourses,
  generateDummyModules,
  generateDummyContent,
  generateDummyCategories,
  generateDummyCategoryCourses,
  generateDummyClasses,
  generateDummyFiles,
  generateDummyTransactions
} from './seedUtils';

async function main() {
  try {
    console.log('Starting database seeding...');
    
    // Generate and insert users
    const users = await generateDummyUsers(50);
    await db.insert(usersTable).values(users);
    console.log('✓ Users seeded');
    
    // Generate and insert educators
    const educatorUsers = users.filter(u => u.isEducator);
    const educators = educatorUsers.map(user => ({
      id: crypto.randomUUID(),
      userId: user.id,
      bio: faker.person.bio(),
      about: faker.lorem.paragraphs(2),
      doubtOpen: faker.datatype.boolean()
    }));
    await db.insert(educatorsTable).values(educators);
    console.log('✓ Educators seeded');
    
    // Handle categories
    const categories = generateDummyCategories();
    
    // Check existing categories
    const existingCategories = await db.select().from(categoryTable);
    const existingCategoryNames = new Set(existingCategories.map(c => c.name));
    
    // Filter out categories that already exist
    const newCategories = categories.filter(category => !existingCategoryNames.has(category.name));
    
    if (newCategories.length > 0) {
      await db.insert(categoryTable).values(newCategories);
      console.log('✓ New categories seeded');
    } else {
      console.log('✓ Categories already exist, skipping');
    }
    
    // Get all categories (including existing ones) for relationship creation
    const allCategories = await db.select().from(categoryTable);
    
    // Generate and insert courses
    const courses = generateDummyCourses(educators);
    await db.insert(coursesTable).values(courses);
    console.log('✓ Courses seeded');
    
    // Generate and insert category-course relationships
    const categoryCourses = generateDummyCategoryCourses(allCategories, courses);
    await db.insert(categoryCoursesTable).values(categoryCourses);
    console.log('✓ Category-course relationships seeded');
    
    // Generate and insert modules
    const modules = generateDummyModules(courses);
    await db.insert(modulesTable).values(modules);
    console.log('✓ Modules seeded');
    
    // Generate and insert classes
    const classes = generateDummyClasses(modules);
    await db.insert(classesTable).values(classes);
    console.log('✓ Classes seeded');
    
    // Continue with remaining seeding...
    const files = generateDummyFiles(users);
    await db.insert(filesTable).values(files);
    console.log('✓ Files seeded');
    
    const content = generateDummyContent(modules);
    await db.insert(contentTable).values(content);
    console.log('✓ Content seeded');
    
    const transactions = generateDummyTransactions(users, courses);
    await db.insert(transactionsTable).values(transactions);
    console.log('✓ Transactions seeded');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

main().catch(console.error);







