'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  open: boolean;
}

export function SidebarItem({ icon: Icon, label, href, open }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + '/');

  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-4 px-6 py-3 mx-2 rounded-lg transition-all duration-200 group ${
          isActive
            ? 'bg-sidebar-primary/20 text-sidebar-primary shadow-md'
            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/10'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-sidebar-primary' : 'group-hover:translate-x-1 transition-transform'} />
        <span className={`text-sm font-medium transition-opacity ${open ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
          {label}
        </span>
        {isActive && open && (
          <div className="ml-auto w-2 h-2 bg-sidebar-primary rounded-full"></div>
        )}
      </div>
    </Link>
  );
}
