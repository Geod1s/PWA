"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinkProps = {
  href: string;
  label: string;
};

function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm transition
        ${isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}
      `}
    >
      {label}
    </Link>
  );
}

export default function TopNav() {
  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3 gap-4">
        <span className="font-semibold text-lg">POS Control Panel</span>
        <div className="flex items-center gap-2">
          <NavLink href="/pos" label="POS" />
          <NavLink href="/products" label="Products" />
          <NavLink href="/products/new" label="Add Product" />
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/staff" label="Staff" /> 
          <NavLink href="/sales" label="Sales" />
          <NavLink href="/settings" label="Settings" />

          
        </div>
      </div>
    </nav>
  );
}
