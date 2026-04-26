import { Router, type IRouter } from "express";
import { desc, eq, sql } from "drizzle-orm";
import {
  db,
  workersTable,
  customersTable,
  bookingsTable,
  tasksTable,
  reviewsTable,
  activityTable,
} from "@workspace/db";
import {
  GetAdminDashboardResponse,
  ListRecentActivityResponse,
  GetCategoryBreakdownResponse,
} from "@workspace/api-zod";
import { serializeActivity } from "../lib/serializers";

const router: IRouter = Router();

router.get("/admin/dashboard", async (_req, res): Promise<void> => {
  const [workerStats] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      pending: sql<number>`COUNT(*) FILTER (WHERE ${workersTable.verificationStatus} = 'pending')::int`,
      approved: sql<number>`COUNT(*) FILTER (WHERE ${workersTable.verificationStatus} = 'approved')::int`,
      rejected: sql<number>`COUNT(*) FILTER (WHERE ${workersTable.verificationStatus} = 'rejected')::int`,
    })
    .from(workersTable);

  const [customerStats] = await db
    .select({ total: sql<number>`COUNT(*)::int` })
    .from(customersTable);

  const [bookingStats] = await db
    .select({
      active: sql<number>`COUNT(*) FILTER (WHERE ${bookingsTable.status} = 'active')::int`,
    })
    .from(bookingsTable);

  const [taskStats] = await db
    .select({
      open: sql<number>`COUNT(*) FILTER (WHERE ${tasksTable.status} = 'open')::int`,
      completed: sql<number>`COUNT(*) FILTER (WHERE ${tasksTable.status} = 'completed')::int`,
    })
    .from(tasksTable);

  const [reviewStats] = await db
    .select({
      avg: sql<string>`COALESCE(AVG(${reviewsTable.rating})::numeric(3,2), 0)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(reviewsTable);

  res.json(
    GetAdminDashboardResponse.parse({
      totalWorkers: workerStats?.total ?? 0,
      pendingWorkers: workerStats?.pending ?? 0,
      approvedWorkers: workerStats?.approved ?? 0,
      rejectedWorkers: workerStats?.rejected ?? 0,
      totalCustomers: customerStats?.total ?? 0,
      activeBookings: bookingStats?.active ?? 0,
      openTasks: taskStats?.open ?? 0,
      completedTasks: taskStats?.completed ?? 0,
      averageRating: Number(reviewStats?.avg ?? 0),
      totalReviews: reviewStats?.count ?? 0,
    }),
  );
});

router.get("/admin/recent-activity", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(20);
  res.json(ListRecentActivityResponse.parse(rows.map(serializeActivity)));
});

router.get("/admin/category-breakdown", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: workersTable.category,
      count: sql<number>`COUNT(*)::int`,
      approved: sql<number>`COUNT(*) FILTER (WHERE ${workersTable.verificationStatus} = 'approved')::int`,
    })
    .from(workersTable)
    .groupBy(workersTable.category)
    .orderBy(desc(sql`COUNT(*)`));
  res.json(GetCategoryBreakdownResponse.parse(rows));
});

export default router;
