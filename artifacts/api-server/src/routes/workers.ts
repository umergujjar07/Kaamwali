import { Router, type IRouter } from "express";
import { and, asc, desc, eq, gte, ilike, lte, or, sql } from "drizzle-orm";
import {
  db,
  workersTable,
  reviewsTable,
  customersTable,
} from "@workspace/db";
import {
  CreateWorkerBody,
  ListWorkersQueryParams,
  ListWorkersResponse,
  GetWorkerParams,
  GetWorkerResponse,
  UpdateWorkerParams,
  UpdateWorkerBody,
  UpdateWorkerResponse,
  VerifyWorkerParams,
  VerifyWorkerBody,
  VerifyWorkerResponse,
  ListWorkerReviewsParams,
  ListWorkerReviewsResponse,
  ListFeaturedWorkersResponse,
} from "@workspace/api-zod";
import {
  serializeWorker,
  serializeReview,
  serializeCustomer,
} from "../lib/serializers";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/workers", async (req, res): Promise<void> => {
  const params = ListWorkersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const p = params.data;
  const conditions = [] as ReturnType<typeof eq>[];
  if (p.category) conditions.push(eq(workersTable.category, p.category));
  if (p.city) conditions.push(eq(workersTable.city, p.city));
  if (p.verificationStatus)
    conditions.push(
      eq(workersTable.verificationStatus, p.verificationStatus),
    );
  if (p.minExperience !== undefined)
    conditions.push(gte(workersTable.experienceYears, p.minExperience));
  if (p.maxMonthlySalary !== undefined)
    conditions.push(
      lte(workersTable.expectedMonthlySalary, p.maxMonthlySalary),
    );
  if (p.maxHourlyRate !== undefined)
    conditions.push(lte(workersTable.hourlyRate, p.maxHourlyRate));
  if (p.search) {
    const like = `%${p.search}%`;
    conditions.push(
      or(
        ilike(workersTable.fullName, like),
        ilike(workersTable.bio, like),
        ilike(workersTable.category, like),
      )!,
    );
  }
  const rows = await db
    .select()
    .from(workersTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(workersTable.averageRating), desc(workersTable.createdAt));
  res.json(ListWorkersResponse.parse(rows.map(serializeWorker)));
});

router.get("/workers/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.verificationStatus, "approved"))
    .orderBy(desc(workersTable.averageRating), desc(workersTable.completedJobs))
    .limit(6);
  res.json(ListFeaturedWorkersResponse.parse(rows.map(serializeWorker)));
});

router.post("/workers", async (req, res): Promise<void> => {
  const parsed = CreateWorkerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(workersTable)
    .values({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      photoUrl: parsed.data.photoUrl ?? null,
      category: parsed.data.category,
      skills: parsed.data.skills,
      bio: parsed.data.bio ?? null,
      experienceYears: parsed.data.experienceYears,
      expectedMonthlySalary: parsed.data.expectedMonthlySalary ?? null,
      hourlyRate: parsed.data.hourlyRate ?? null,
      city: parsed.data.city,
      serviceArea: parsed.data.serviceArea ?? null,
      cnicNumber: parsed.data.cnicNumber,
      cnicImageUrl: parsed.data.cnicImageUrl ?? null,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create worker" });
    return;
  }
  await logActivity({
    type: "worker_registered",
    title: "New worker registered",
    description: `${row.fullName} joined as ${row.category} in ${row.city}`,
    actorName: row.fullName,
  });
  res.status(201).json(serializeWorker(row));
});

router.get("/workers/:id", async (req, res): Promise<void> => {
  const params = GetWorkerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }
  res.json(GetWorkerResponse.parse(serializeWorker(row)));
});

router.patch("/workers/:id", async (req, res): Promise<void> => {
  const params = UpdateWorkerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateWorkerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) updateData[k] = v;
  }
  const [row] = await db
    .update(workersTable)
    .set(updateData)
    .where(eq(workersTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }
  res.json(UpdateWorkerResponse.parse(serializeWorker(row)));
});

router.post("/workers/:id/verify", async (req, res): Promise<void> => {
  const params = VerifyWorkerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = VerifyWorkerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(workersTable)
    .set({
      verificationStatus: parsed.data.decision,
      rejectionReason:
        parsed.data.decision === "rejected"
          ? parsed.data.rejectionReason ?? "Did not meet verification criteria"
          : null,
    })
    .where(eq(workersTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Worker not found" });
    return;
  }
  await logActivity({
    type:
      parsed.data.decision === "approved" ? "worker_verified" : "worker_rejected",
    title:
      parsed.data.decision === "approved"
        ? "Worker verified"
        : "Worker rejected",
    description:
      parsed.data.decision === "approved"
        ? `${row.fullName} is now a verified ${row.category}`
        : `${row.fullName}'s application was rejected`,
    actorName: "Admin",
  });
  res.json(VerifyWorkerResponse.parse(serializeWorker(row)));
});

router.get("/workers/:id/reviews", async (req, res): Promise<void> => {
  const params = ListWorkerReviewsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select({
      review: reviewsTable,
      customer: customersTable,
    })
    .from(reviewsTable)
    .leftJoin(customersTable, eq(reviewsTable.customerId, customersTable.id))
    .where(eq(reviewsTable.workerId, params.data.id))
    .orderBy(desc(reviewsTable.createdAt));
  const out = rows.map((r) =>
    serializeReview(r.review, r.customer ?? undefined),
  );
  res.json(ListWorkerReviewsResponse.parse(out));
});

export default router;
