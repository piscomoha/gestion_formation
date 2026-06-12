import { useState } from "react";
import { Bell, Search } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/auth/AuthContext";
import { workflowsApi } from "@/api/workflows.api";

export function Header() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const notifications = useQuery({
    queryKey: ["notifications", user?.role, user?.email],
    queryFn: workflowsApi.notifications,
    enabled: Boolean(user),
    refetchInterval: 5000,
  });
  const unread = notifications.data?.filter((item) => !item.read_at).length ?? 0;
  const markRead = useMutation({
    mutationFn: workflowsApi.markNotificationsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  function toggleNotifications() {
    setOpen((current) => {
      const next = !current;
      if (next && unread > 0) {
        markRead.mutate();
      }
      return next;
    });
  }

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
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            aria-label="Notifications"
            className="relative"
            onClick={toggleNotifications}
          >
            <Bell className="h-4 w-4" />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 text-[10px] text-white">
                {unread}
              </span>
            ) : null}
          </Button>
          {open ? (
            <div className="animate-soft-pop absolute right-0 top-12 z-50 w-80 rounded-md border bg-card p-2 shadow-lg">
              <div className="border-b px-2 py-2">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto py-2">
                {notifications.data?.length ? (
                  notifications.data.map((notification) => (
                    <div
                      key={notification.id}
                      className="rounded-md px-2 py-2 transition-colors duration-200 hover:bg-muted"
                    >
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground">{notification.message}</p>
                      {notification.created_at ? (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString("fr-FR")}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="px-2 py-4 text-sm text-muted-foreground">Aucune notification.</p>
                )}
              </div>
            </div>
          ) : null}
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </header>
  );
}
