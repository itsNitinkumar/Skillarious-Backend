import { fakerEN as faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const generateDummyUsers = async (count: number) => {
  const users = [];
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  for (let i = 0; i < count; i++) {
    users.push({
      id: crypto.randomUUID(), // Explicitly set the ID
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: hashedPassword,
      pfp: faker.image.avatar(),
      phone: faker.phone.number(),
      gender: faker.helpers.arrayElement(['male', 'female', 'other']),
      age: faker.number.int({ min: 18, max: 70 }),
      isEducator: i < 10, // First 10 users are educators
      verified: true,
      isAdmin: i === 0, // First user is admin
      role: i === 0 ? 'admin' : i < 10 ? 'educator' : 'user',
      isBanned: false
    });
  }
  return users;
};

export const generateDummyEducators = (educators: any[]) => {
  return educators.map(educator => ({
    userId: educator.id,
    bio: faker.person.bio(),
    about: faker.lorem.paragraphs(2),
    doubtOpen: faker.datatype.boolean()
  }));
};

export const generateDummyCategories = () => {
  return [
    { id: crypto.randomUUID(), name: 'Programming', description: 'Learn various programming languages and concepts' },
    { id: crypto.randomUUID(), name: 'Web Development', description: 'Master web technologies and frameworks' },
    { id: crypto.randomUUID(), name: 'Data Science', description: 'Explore data analysis and machine learning' },
    { id: crypto.randomUUID(), name: 'Mobile Development', description: 'Build mobile applications for iOS and Android' },
    { id: crypto.randomUUID(), name: 'DevOps', description: 'Learn about development operations and deployment' },
    { id: crypto.randomUUID(), name: 'Database Management', description: 'Master database design and administration' },
    { id: crypto.randomUUID(), name: 'Cybersecurity', description: 'Understand security principles and practices' },
    { id: crypto.randomUUID(), name: 'UI/UX Design', description: 'Create user-friendly interfaces and experiences' },
    { id: crypto.randomUUID(), name: 'Artificial Intelligence', description: 'Explore AI and machine learning concepts' },
    { id: crypto.randomUUID(), name: 'Cloud Computing', description: 'Master cloud platforms and services' }
  ];
};

export const generateDummyCourses = (educators: any[]) => {
  const courses = [];
  
  for (const educator of educators) {
    const courseCount = faker.number.int({ min: 1, max: 3 });
    
    for (let i = 0; i < courseCount; i++) {
      courses.push({
        id: crypto.randomUUID(),
        name: faker.lorem.words({ min: 2, max: 5 }),
        description: faker.lorem.paragraph(),
        about: faker.lorem.paragraphs(2),
        comments: faker.lorem.sentences(2),
        start: faker.date.future(),
        end: faker.date.future({ years: 1 }),
        educatorId: educator.id,
        price: faker.number.float({ min: 10, max: 200, multipleOf: 0.01 }),
        thumbnail: faker.image.url(),
        isDismissed: false,
        completionRate: faker.number.float({ min: 0, max: 100, multipleOf: 0.01 }),
        viewCount: faker.number.int({ min: 0, max: 1000 })
      });
    }
  }
  return courses;
};

export const generateDummyModules = (courses: any[]) => {
  const modules = [];
  
  for (const course of courses) {
    const moduleCount = faker.number.int({ min: 3, max: 6 });
    
    for (let i = 0; i < moduleCount; i++) {
      modules.push({
        id: crypto.randomUUID(),
        courseId: course.id, // Ensure this is set correctly
        name: `Module ${i + 1}: ${faker.lorem.words(3)}`,
        duration: faker.number.float({ min: 1, max: 5, multipleOf: 0.01 }),
        videoCount: faker.number.int({ min: 3, max: 10 }),
        materialCount: faker.number.int({ min: 1, max: 5 }),
        isDismissed: false
      });
    }
  }
  return modules;
};

export const generateDummyFiles = (users: any[]) => {
  const files = [];
  for (let i = 0; i < 50; i++) {
    files.push({
      owner: faker.helpers.arrayElement(users).id,
      name: faker.system.fileName(),
      uploaded: faker.date.past(),
      link: faker.internet.url(),
      type: faker.helpers.arrayElement(['video', 'pdf', 'document'])
    });
  }
  return files;
};

export const generateDummyContent = (modules: any[]) => {
  const content = [];
  modules.forEach(module => {
    const contentCount = faker.number.int({ min: 3, max: 8 });
    for (let i = 0; i < contentCount; i++) {
      content.push({
        moduleId: module.id,
        title: faker.lorem.words(4),
        description: faker.lorem.paragraph(),
        order: i + 1,
        fileUrl: faker.internet.url(),
        type: faker.helpers.arrayElement(['video', 'pdf', 'quiz']),
        views: faker.number.int({ min: 0, max: 500 }),
        duration: faker.number.float({ min: 5, max: 45 }),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        isPreview: i === 0
      });
    }
  });
  return content;
};

export const generateDummyTransactions = (users: any[], courses: any[]) => {
  const transactions = [];
  for (let i = 0; i < 50; i++) {
    const course = faker.helpers.arrayElement(courses);
    transactions.push({
      userId: faker.helpers.arrayElement(users).id,
      amount: course.price,
      date: faker.date.past(),
      courseId: course.id,
      status: faker.helpers.arrayElement(['completed', 'pending', 'refunded']),
      paymentId: faker.string.alphanumeric(16)
    });
  }
  return transactions;
};

// Add this function to generate category-course relationships
export const generateDummyCategoryCourses = (categories: any[], courses: any[]) => {
  const categoryCourses = [];
  
  // Assign 1-3 random categories to each course
  for (const course of courses) {
    const numCategories = faker.number.int({ min: 1, max: 3 });
    const shuffledCategories = [...categories].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < numCategories && i < shuffledCategories.length; i++) {
      categoryCourses.push({
        categoryId: shuffledCategories[i].id,
        courseId: course.id
      });
    }
  }
  
  return categoryCourses;
};

// Add this function to generate classes
export const generateDummyClasses = (modules: any[]) => {
  const classes = [];
  
  for (const module of modules) {
    // Generate 2-5 classes per module
    const classCount = faker.number.int({ min: 2, max: 5 });
    
    for (let i = 0; i < classCount; i++) {
      classes.push({
        id: crypto.randomUUID(),
        moduleId: module.id,
        views: faker.number.int({ min: 0, max: 1000 }),
        duration: faker.date.future(), // This represents video duration
        fileId: faker.system.filePath(), // This would be replaced with actual video file IDs in production
      });
    }
  }
  
  return classes;
};

// Main seeding function
export const seedDatabase = async () => {
  // Generate 50 users
  const users = await generateDummyUsers(50);
  
  // Generate educators from users who are marked as educators
  const educators = generateDummyEducators(users.filter(u => u.isEducator));
  
  // Generate 10 categories
  const categories = generateDummyCategories();
  
  // Generate 10 courses
  const courses = generateDummyCourses(educators);
  
  // Generate category-course relationships
  const categoryCourses = generateDummyCategoryCourses(categories, courses);
  
  // Generate 3-6 modules per course
  const modules = generateDummyModules(courses);
  
  // Generate 3-8 content items per module
  const content = generateDummyContent(modules);
  
  // Generate 100 reviews
  const reviews = generateDummyReviews(users, courses);
  
  // Generate 100 transactions
  const transactions = generateDummyTransactions(users, courses);

  return {
    users,
    educators,
    categories,
    courses,
    categoryCourses,
    modules,
    content,
    reviews,
    transactions
  };
};






