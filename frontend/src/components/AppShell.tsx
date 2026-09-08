"use client";

import {
  Building2,
  CalendarCheck2,
  ChartNoAxesCombined,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { User } from "../lib/types";
import { Modal } from "./Modal";

const navigation: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/dashboard", icon: ChartNoAxesCombined },
  { label: "Leads", href: "/leads", icon: UsersRound },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Bookings", href: "/bookings", icon: CalendarCheck2 },
];

export function AppShell({
  user,
  onLogout,
  children,
}: {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const confirmLogout = () => {
    setShowLogoutConfirmation(false);
    onLogout();
  };

  return (
    <>
      <main className="app-shell">
        <aside className="sidebar">
          <Link href="/dashboard" className="side-brand">
            <span className="brand-mark small">EF</span>
            <span>
              <strong>EstateFlow</strong>
              <small>Sales workspace</small>
            </span>
          </Link>
          <nav>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  className={
                    pathname === item.href ? "nav-item active" : "nav-item"
                  }
                  href={item.href}
                  key={item.href}
                >
                  <Icon aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-bottom -mb-3">
            <button
              className="profile"
              type="button"
              onClick={() => setShowLogoutConfirmation(true)}
            >
              <span className="avatar">{user.name[0]}</span>
              <span>
                <strong>{user.name}</strong>
                <small>
                  {user.role === "admin" ? "Administrator" : "Sales employee"}
                </small>
              </span>
              <span className="logout">↗</span>
            </button>
          </div>
        </aside>
        <section className="content">{children}</section>
      </main>
      {showLogoutConfirmation && (
        <Modal
          eyebrow="ACCOUNT"
          title="Sign out of EstateFlow?"
          onClose={() => setShowLogoutConfirmation(false)}
        >
          <p className="form-intro">
            You will need to sign in again to access your workspace.
          </p>
          <div className="form-actions">
            <button
              className="text-button"
              type="button"
              onClick={() => setShowLogoutConfirmation(false)}
            >
              Stay signed in
            </button>
            <button
              className="primary-button form-submit"
              type="button"
              onClick={confirmLogout}
            >
              Sign out
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
