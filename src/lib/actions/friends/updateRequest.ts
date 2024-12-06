'use server'

import { updateFriendRequest } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateFriendRequestAction(requestId: string, status: 'accepted' | 'rejected') {
  await updateFriendRequest(requestId, status);
  revalidatePath('/community');
}