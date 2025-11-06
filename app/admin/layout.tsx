import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Carlos IA",
  description: "Área administrativa do Carlos IA",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
