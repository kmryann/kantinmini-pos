import { getMenuPayload } from "@/lib/server/menu";
import { OrderClient } from "./OrderClient";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const initialMenu = await getMenuPayload();
  return <OrderClient initialMenu={initialMenu} />;
}
