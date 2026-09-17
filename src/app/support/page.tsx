import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

export default function SupportRedirectPage() {
  redirect(routes.account.support.list());
}
