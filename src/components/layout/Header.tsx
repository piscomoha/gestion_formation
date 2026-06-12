import { Bell, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { workflowsApi } from "@/api/workflows.api";

export function Header() {
  const { user, logout } = useAuth();
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: workflowsApi.notifications,
    enabled: Boolean(user),
  });
  const unread = notifications.data?.filter((item) => !item.read_at).length ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
      <div>
        <p className="text-sm text-muted-foreground">Bienvenue</p>
        <p className="font-semibold">{user?.name ?? "Console de gestion des formations"}</p>
      </div>
      <div className="hidden w-full max-w-sm items-center gap-2 md:flex">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." className="h-9" />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 ? (
            <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 text-[10px] text-white">
              {unread}
            </span>
          ) : null}
        </Button>
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
