import { Router, type IRouter } from "express";
import healthRouter from "./health";
import workersRouter from "./workers";
import customersRouter from "./customers";
import bookingsRouter from "./bookings";
import attendanceRouter from "./attendance";
import tasksRouter from "./tasks";
import reviewsRouter from "./reviews";
import adminRouter from "./admin";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(authRouter);
router.use(healthRouter);
router.use(workersRouter);
router.use(customersRouter);
router.use(bookingsRouter);
router.use(attendanceRouter);
router.use(tasksRouter);
router.use(reviewsRouter);
router.use(adminRouter);

export default router;
