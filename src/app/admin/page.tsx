import { redirect } from 'next/navigation';

export default async function RoutePage() {
  return redirect("/admin/users");
}
