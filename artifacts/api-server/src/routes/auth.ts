import { Router, type IRouter } from "express";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { db, customersTable, workersTable } from "@workspace/db";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const hashBuffer = Buffer.from(hash, "hex");
    const derived = scryptSync(password, salt, 64);
    return timingSafeEqual(hashBuffer, derived);
  } catch {
    return false;
  }
}

const router: IRouter = Router();

router.post("/auth/customer/register", async (req, res): Promise<void> => {
  const { email, password, fullName, phone, city } = req.body as Record<string, string>;
  if (!email || !password || !fullName || !phone || !city) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  const existing = await db.select({ id: customersTable.id })
    .from(customersTable).where(eq(customersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email is already registered" });
    return;
  }
  const passwordHash = hashPassword(password);
  const [row] = await db.insert(customersTable)
    .values({ fullName, phone, city, email, passwordHash })
    .returning();
  if (!row) { res.status(500).json({ error: "Registration failed" }); return; }
  res.status(201).json({ id: row.id, name: row.fullName, email: row.email, role: "customer" });
});

router.post("/auth/customer/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as Record<string, string>;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const [row] = await db.select().from(customersTable)
    .where(eq(customersTable.email, email)).limit(1);
  if (!row || !row.passwordHash || !verifyPassword(password, row.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  res.json({ id: row.id, name: row.fullName, email: row.email, role: "customer" });
});

router.post("/auth/worker/register", async (req, res): Promise<void> => {
  const { email, password, fullName, phone, city, category, cnicNumber } = req.body as Record<string, string>;
  if (!email || !password || !fullName || !phone || !city || !category || !cnicNumber) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }
  const existing = await db.select({ id: workersTable.id })
    .from(workersTable).where(eq(workersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email is already registered" });
    return;
  }
  const passwordHash = hashPassword(password);
  const [row] = await db.insert(workersTable)
    .values({ fullName, phone, city, category, cnicNumber, email, passwordHash, verificationStatus: "pending" })
    .returning();
  if (!row) { res.status(500).json({ error: "Registration failed" }); return; }
  res.status(201).json({ id: row.id, name: row.fullName, email: row.email, role: "worker" });
});

router.post("/auth/worker/login", async (req, res): Promise<void> => {
  const { email, password } = req.body as Record<string, string>;
  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const [row] = await db.select().from(workersTable)
    .where(eq(workersTable.email, email)).limit(1);
  if (!row || !row.passwordHash || !verifyPassword(password, row.passwordHash)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  res.json({ id: row.id, name: row.fullName, email: row.email, role: "worker" });
});

export default router;
