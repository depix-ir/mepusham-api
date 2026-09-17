import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default async function OrderDetailRedirectPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  redirect(routes.account.orders.detail(orderId));
}
