import React from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="bg-[#070913] text-[#f1f5f9]">{children}</div>;
}
