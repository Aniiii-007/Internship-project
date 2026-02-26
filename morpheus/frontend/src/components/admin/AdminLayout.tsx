import { ReactNode, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, GraduationCap, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import { useAuthStore } from "../../../src/store/auth.store";  //../store/auth.store
import { authApi } from "../../../src/api/auth.api";      //   ../api/auth.api
import { cn } from "../../../src/lib/utils";   //     ../lib/utils

const navItems = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/tutors", icon: GraduationCap, label: "Tutors" },
  { to: "/admin/students", icon: Users, label: "Students" },
];

export default function AdminLayout({ children, pendingCount }: { children: ReactNode; pendingCount?: number }) {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    clearAuth();
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 border-b border-morpheus-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <span className="font-display text-base font-semibold text-morpheus-text block">Morpheus</span>
            <span className="text-xs text-red-400 font-medium">Admin Panel</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin/dashboard"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-red-500/15 text-red-400 border border-red-500/20"
                  : "text-morpheus-muted hover:text-morpheus-text hover:bg-morpheus-surface"
              )
            }
          >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            {item.to === "/admin/tutors" && pendingCount && pendingCount > 0 ? (
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                {pendingCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-morpheus-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck size={14} className="text-red-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-morpheus-text truncate">{user?.name}</p>
            <p className="text-xs text-red-400">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-morpheus-muted hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-morpheus-bg flex">
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-morpheus-border bg-morpheus-bg fixed inset-y-0 left-0 z-20">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-50 w-60 bg-morpheus-bg border-r border-morpheus-border flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-morpheus-muted">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-morpheus-border bg-morpheus-bg sticky top-0 z-10">
          <button onClick={() => setMobileOpen(true)} className="text-morpheus-muted">
            <Menu size={22} />
          </button>
          <span className="font-display font-semibold text-morpheus-text">Admin</span>
        </div>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
