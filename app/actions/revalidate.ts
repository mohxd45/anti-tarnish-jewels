"use server";
import { revalidatePath } from "next/cache";

export async function clearNextCache() {
  revalidatePath("/", "layout");
  revalidatePath("/");
}
