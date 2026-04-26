import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  reviewsTable,
  workersTable,
  customersTable,
} from "@workspace/db";
import {
  CreateReviewBody,
  ListReviewsQueryParams,
  ListReviewsResponse,
} from "@workspace/api-zod";
import { serializeReview } from "../lib/serializers";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/reviews", async (req, res): Promise<void> => {
  const params = ListReviewsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const conditions = [] as ReturnType<typeof eq>[];
  if (params.data.workerId !== undefined)
    conditions.push(eq(reviewsTable.workerId, params.data.workerId));
  if (params.data.customerId !== undefined)
    conditions.push(eq(reviewsTable.customerId, params.data.customerId));

  const rows = await db
    .select({
      review: reviewsTable,
      customer: customersTable,
    })
    .from(reviewsTable)
    .leftJoin(customersTable, eq(reviewsTable.customerId, customersTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(reviewsTable.createdAt));

  res.json(
    ListReviewsResponse.parse(
      rows.map((r) => serializeReview(r.review, r.customer ?? undefined)),
    ),
  );
});

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(reviewsTable)
    .values({
      workerId: parsed.data.workerId,
      customerId: parsed.data.customerId,
      bookingId: parsed.data.bookingId ?? null,
      taskId: parsed.data.taskId ?? null,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create review" });
    return;
  }
  // Recompute worker rating
  const [agg] = await db
    .select({
      avg: sql<string>`COALESCE(AVG(${reviewsTable.rating})::numeric(3,2), 0)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(reviewsTable)
    .where(eq(reviewsTable.workerId, parsed.data.workerId));
  if (agg) {
    await db
      .update(workersTable)
      .set({
        averageRating: agg.avg,
        reviewCount: agg.count,
      })
      .where(eq(workersTable.id, parsed.data.workerId));
  }
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, row.customerId));
  const [worker] = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.id, row.workerId));
  await logActivity({
    type: "review_created",
    title: `${row.rating}-star review`,
    description: `${customer?.fullName ?? "A customer"} reviewed ${worker?.fullName ?? "a worker"}`,
    actorName: customer?.fullName ?? null,
  });
  res.status(201).json(serializeReview(row, customer ?? undefined));
});

export default router;
