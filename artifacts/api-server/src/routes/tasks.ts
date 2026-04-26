import { Router, type IRouter } from "express";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  db,
  tasksTable,
  customersTable,
  workersTable,
} from "@workspace/db";
import {
  CreateTaskBody,
  GetTaskParams,
  GetTaskResponse,
  ListTasksQueryParams,
  ListTasksResponse,
  AcceptTaskParams,
  AcceptTaskBody,
  AcceptTaskResponse,
  UpdateTaskStatusParams,
  UpdateTaskStatusBody,
  UpdateTaskStatusResponse,
} from "@workspace/api-zod";
import { serializeTask } from "../lib/serializers";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/tasks", async (req, res): Promise<void> => {
  const params = ListTasksQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const p = params.data;
  const conditions = [] as ReturnType<typeof eq>[];
  if (p.status) conditions.push(eq(tasksTable.status, p.status));
  if (p.category) conditions.push(eq(tasksTable.category, p.category));
  if (p.city) conditions.push(eq(tasksTable.city, p.city));
  if (p.customerId !== undefined)
    conditions.push(eq(tasksTable.customerId, p.customerId));
  if (p.workerId !== undefined)
    conditions.push(eq(tasksTable.acceptedByWorkerId, p.workerId));

  const rows = await db
    .select({
      task: tasksTable,
      customer: customersTable,
      worker: workersTable,
    })
    .from(tasksTable)
    .leftJoin(customersTable, eq(tasksTable.customerId, customersTable.id))
    .leftJoin(workersTable, eq(tasksTable.acceptedByWorkerId, workersTable.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(tasksTable.createdAt));

  const out = rows.map((r) =>
    serializeTask(r.task, r.customer ?? undefined, r.worker ?? undefined),
  );
  res.json(ListTasksResponse.parse(out));
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(tasksTable)
    .values({
      customerId: parsed.data.customerId,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      durationHours: parsed.data.durationHours,
      location: parsed.data.location,
      city: parsed.data.city,
      budget: parsed.data.budget,
      scheduledFor: parsed.data.scheduledFor
        ? new Date(parsed.data.scheduledFor)
        : null,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create task" });
    return;
  }
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, row.customerId));
  await logActivity({
    type: "task_created",
    title: "New task posted",
    description: `${customer?.fullName ?? "Customer"} posted "${row.title}" in ${row.city} for PKR ${row.budget.toLocaleString()}`,
    actorName: customer?.fullName ?? null,
  });
  res.status(201).json(serializeTask(row, customer ?? undefined));
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({
      task: tasksTable,
      customer: customersTable,
      worker: workersTable,
    })
    .from(tasksTable)
    .leftJoin(customersTable, eq(tasksTable.customerId, customersTable.id))
    .leftJoin(workersTable, eq(tasksTable.acceptedByWorkerId, workersTable.id))
    .where(eq(tasksTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  res.json(
    GetTaskResponse.parse(
      serializeTask(
        row.task,
        row.customer ?? undefined,
        row.worker ?? undefined,
      ),
    ),
  );
});

router.post("/tasks/:id/accept", async (req, res): Promise<void> => {
  const params = AcceptTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = AcceptTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(tasksTable)
    .set({
      status: "accepted",
      acceptedByWorkerId: parsed.data.workerId,
      acceptedAt: new Date(),
    })
    .where(
      and(
        eq(tasksTable.id, params.data.id),
        eq(tasksTable.status, "open"),
      ),
    )
    .returning();
  if (!row) {
    res.status(409).json({ error: "Task not available" });
    return;
  }
  const [worker] = await db
    .select()
    .from(workersTable)
    .where(eq(workersTable.id, parsed.data.workerId));
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, row.customerId));
  await logActivity({
    type: "task_accepted",
    title: "Task accepted",
    description: `${worker?.fullName ?? "A worker"} accepted "${row.title}"`,
    actorName: worker?.fullName ?? null,
  });
  res.json(
    AcceptTaskResponse.parse(
      serializeTask(row, customer ?? undefined, worker ?? undefined),
    ),
  );
});

router.patch("/tasks/:id/status", async (req, res): Promise<void> => {
  const params = UpdateTaskStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateTaskStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updateData: Record<string, unknown> = { status: parsed.data.status };
  if (parsed.data.status === "completed") {
    updateData["completedAt"] = new Date();
  }
  const [row] = await db
    .update(tasksTable)
    .set(updateData)
    .where(eq(tasksTable.id, params.data.id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  if (parsed.data.status === "completed" && row.acceptedByWorkerId) {
    await db
      .update(workersTable)
      .set({ completedJobs: sql`${workersTable.completedJobs} + 1` })
      .where(eq(workersTable.id, row.acceptedByWorkerId));
  }
  const [worker] = row.acceptedByWorkerId
    ? await db
        .select()
        .from(workersTable)
        .where(eq(workersTable.id, row.acceptedByWorkerId))
    : [undefined];
  const [customer] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, row.customerId));
  if (parsed.data.status === "completed") {
    await logActivity({
      type: "task_completed",
      title: "Task completed",
      description: `"${row.title}" was marked complete`,
      actorName: worker?.fullName ?? null,
    });
  }
  res.json(
    UpdateTaskStatusResponse.parse(
      serializeTask(row, customer ?? undefined, worker ?? undefined),
    ),
  );
});

export default router;
