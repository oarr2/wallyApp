import { CalendarPlus, ClipboardList, Home, LogOut, Shield, Trophy } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { isAdminRole, type AppRole } from "@/lib/auth/authorization";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppNavigation({
  role,
  currentPath = "/"
}: {
  role?: AppRole | null;
  currentPath?: string;
}) {
  const items = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/reservar", label: "Reservar", icon: CalendarPlus },
    { href: "/reservas", label: "Mis reservas", icon: ClipboardList },
    { href: "/torneos", label: "Torneos", icon: Trophy },
    ...(role && isAdminRole(role)
      ? [{ href: "/admin/reservas", label: "Administración", icon: Shield }]
      : [])
  ];

  return (
    <nav className="sticky top-0 z-20 border-b border-lime-300/15 bg-slate-950/95 px-4 py-3 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 overflow-x-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            currentPath === item.href ||
            (item.href !== "/" && currentPath.startsWith(item.href));

          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-300",
                active && "bg-lime-300 text-slate-950"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </a>
          );
        })}
        <form action={signOutAction} className="ml-auto shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-slate-900 hover:text-white"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </nav>
  );
}
