import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";

const db = (table: string) => (supabase as any).from(table);

const NotificationBell = () => {
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["my-notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await db("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
  });

  const unread = notifications.filter((n: any) => !n.is_read).length;

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await db("notifications").update({ is_read: true }).eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await db("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-notifications"] }),
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase.channel("notifications-realtime").on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications" },
      () => { qc.invalidateQueries({ queryKey: ["my-notifications"] }); }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [qc]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 max-h-96 overflow-y-auto" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="font-semibold text-sm">Notifications</span>
          {unread > 0 && <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => markAllRead.mutate()}>Mark all read</Button>}
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground p-4 text-center">No notifications</p>
        ) : (
          notifications.map((n: any) => (
            <div key={n.id} onClick={() => { if (!n.is_read) markRead.mutate(n.id); if (n.link) window.location.href = n.link; }}
              className={`p-3 border-b border-border/50 cursor-pointer hover:bg-muted/50 transition-colors ${!n.is_read ? "bg-primary/5" : ""}`}>
              <div className="flex items-start gap-2">
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(n.created_at), "dd MMM, hh:mm a")}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
