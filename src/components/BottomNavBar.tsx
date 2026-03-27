"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Trophy, FastForward, User } from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";

export function BottomNavBar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: "/dashboard", icon: Dumbbell, label: t("nav.dashboard"), strokeWidth: 2.5 },
    { href: "/benchmarks", icon: Trophy, label: t("nav.benchmarks"), strokeWidth: 2 },
    { href: "/pacing", icon: FastForward, label: t("nav.pacing"), strokeWidth: 2 },
    { href: "/profile", icon: User, label: t("nav.profile"), strokeWidth: 2 },
  ];

  // Do not show nav bar on onboarding, login, register, or workout details
  if (
    pathname?.startsWith("/login") || 
    pathname?.startsWith("/register") || 
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/workout/") ||
    pathname === "/"
  ) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 w-full h-20 bg-[#131313]/90 backdrop-blur-xl flex justify-around items-center px-4 pb-safe z-50 rounded-t-2xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] border-t border-outline/20">
      {navItems.map((item) => {
        const isActive = pathname?.startsWith(item.href);
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex flex-col items-center justify-center transition-all cursor-pointer ${
              isActive 
                ? "text-primary scale-110" 
                : "text-on-surface/40 hover:text-primary active:scale-90 duration-200"
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'mb-1' : 'mb-1 w-5 h-5'}`} strokeWidth={isActive ? item.strokeWidth : 2} />
            <span className={`font-display text-[9px] font-bold tracking-widest uppercase mt-1 ${
              isActive ? "text-primary" : ""
            }`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
