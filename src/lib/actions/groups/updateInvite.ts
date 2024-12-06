'use server'

import { respondToGroupInvite } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateGroupInviteAction(inviteId: string, status: 'accepted' | 'rejected') {
  await respondToGroupInvite(inviteId, status);
  revalidatePath('/community');
}