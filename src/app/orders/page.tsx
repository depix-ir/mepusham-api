import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function OrdersRedirectPage() {
  redirect(routes.account.orders.list);
}
