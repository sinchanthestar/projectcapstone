import React from "react";

export const metadata = {
  title: "System Setup - Shift Manager",
  description: "Initialize your shift scheduling system",
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
