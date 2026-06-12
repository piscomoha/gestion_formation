import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  GraduationCap,
  Home,
  Layers,
  Library,
  NotebookPen,
  School,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Dashboard", href: "/", icon: Home, roles: ["admin", "formateur", "stagiaire"] },
  { label: "Admin Notes", href: "/admin/notes", icon: NotebookPen, roles: ["admin"] },
  { label: "Admin Presences", href: "/admin/presences", icon: ClipboardCheck, roles: ["admin"] },
  { label: "Import Excel", href: "/admin/import", icon: Library, roles: ["admin"] },
  { label: "Filieres", href: "/filieres", icon: Library, roles: ["admin"] },
  { label: "Groupes", href: "/groupes", icon: Users, roles: ["admin"] },
  { label: "Annees scolaires", href: "/annees-scolaires", icon: CalendarDays, roles: ["admin"] },
  { label: "Formateurs", href: "/formateurs", icon: School, roles: ["admin"] },
  { label: "Modules", href: "/modules", icon: BookOpen, roles: ["admin"] },
  { label: "Stagiaires", href: "/stagiaires", icon: GraduationCap, roles: ["admin"] },
  { label: "Affectations", href: "/affectations", icon: Layers, roles: ["admin"] },
  { label: "Espace Formateur", href: "/formateur", icon: School, roles: ["formateur"] },
  { label: "Mon bulletin", href: "/stagiaire", icon: GraduationCap, roles: ["stagiaire"] },
];

export function Sidebar() {
  const { user } = useAuth();
  const items = navigation.filter((item) => user && item.roles.includes(user.role));

  return (
    <aside className="hidden min-h-screen w-72 border-r bg-card lg:block">
      <div className="flex h-20 items-center gap-3 border-b px-6">
        <div className="rounded-lg bg-white p-2 shadow-sm ring-1 ring-border">
          <img src="/logoo-ofppt.png" alt="OFPPT" className="h-10 w-14 object-contain" />
        </div>
        <div>
          <p className="font-semibold">OFPPT</p>
          <p className="text-xs text-muted-foreground">Gestion formation</p>
        </div>
      </div>
      <nav className="space-y-1 p-4">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
