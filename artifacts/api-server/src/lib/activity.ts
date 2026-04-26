import { db, activityTable } from "@workspace/db";

export async function logActivity(entry: {
  type: string;
  title: string;
  description: string;
  actorName?: string | null;
}): Promise<void> {
  await db.insert(activityTable).values({
    type: entry.type,
    title: entry.title,
    description: entry.description,
    actorName: entry.actorName ?? null,
  });
}
