import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, customersTable } from "@workspace/db";
import {
  CreateCustomerBody,
  GetCustomerParams,
  GetCustomerResponse,
  ListCustomersResponse,
} from "@workspace/api-zod";
import { serializeCustomer } from "../lib/serializers";

const router: IRouter = Router();

router.get("/customers", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(customersTable)
    .orderBy(desc(customersTable.createdAt));
  res.json(ListCustomersResponse.parse(rows.map(serializeCustomer)));
});

router.post("/customers", async (req, res): Promise<void> => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .insert(customersTable)
    .values({
      fullName: parsed.data.fullName,
      phone: parsed.data.phone,
      city: parsed.data.city,
      photoUrl: parsed.data.photoUrl ?? null,
    })
    .returning();
  if (!row) {
    res.status(500).json({ error: "Failed to create customer" });
    return;
  }
  res.status(201).json(serializeCustomer(row));
});

router.get("/customers/:id", async (req, res): Promise<void> => {
  const params = GetCustomerParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(customersTable)
    .where(eq(customersTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Customer not found" });
    return;
  }
  res.json(GetCustomerResponse.parse(serializeCustomer(row)));
});

export default router;
