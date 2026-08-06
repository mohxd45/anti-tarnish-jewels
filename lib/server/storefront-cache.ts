import "server-only";
import { revalidatePath } from "next/cache";

export function invalidateStorefrontCache() {
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/bundles");
  revalidatePath("/product/[slug]", "page");
}
