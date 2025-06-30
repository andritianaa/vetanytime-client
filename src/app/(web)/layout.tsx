import { redirect } from 'next/navigation';

export default async function RouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return redirect("/auth/login");
}
