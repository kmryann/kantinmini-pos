import { redirect } from "next/navigation";

export default function CartRedirect() {
  redirect("/order?cart=open");
}
