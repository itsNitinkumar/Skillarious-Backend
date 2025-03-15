import express from "express";
const router = express.Router();
import {createCourse,updateCourse,deleteCourse,getAllCourses,getSingleCourse,searchCourses,getCoursesByCategory,getCoursesByEducator} from '../controllers/Course.ts';
router.post("/create", createCourse as unknown as express.RequestHandler);
router.put("/update/:id", updateCourse as unknown as express.RequestHandler);  // Changed from POST to PUT
router.delete("/delete/:id",deleteCourse as unknown as express.RequestHandler);
router.post("/all",getAllCourses as unknown as express.RequestHandler);
router.post("/single",getSingleCourse as unknown as express.RequestHandler);
router.get('/search', searchCourses as unknown as express.RequestHandler); 
router.get('/category/:category', getCoursesByCategory as unknown as express.RequestHandler);
router.get('/educator/:id', getCoursesByEducator as unknown as express.RequestHandler);
export default router;
