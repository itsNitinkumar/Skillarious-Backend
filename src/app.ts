import express from 'express';
import adminRouter from './routes/admin';
import studentRouter from './routes/student';
// ... other imports

const app = express();

// ... other middleware and configurations

// Routes
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/student', studentRouter);
// ... other routes

export default app;