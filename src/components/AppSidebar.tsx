import { TrendingUp, Search, MessageCircle } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Reel Analyzer", url: "/", icon: TrendingUp },
  { title: "SEO Optimizer", url: "/seo-optimizer", icon: Search },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const [whatsappNumber, setWhatsappNumber] = useState("");

  useEffect(() => {
    supabase
      .from("site_config" as any)
      .select("config_value")
      .eq("config_key", "whatsapp_number")
      .single()
      .then(({ data }) => {
        if (data && (data as any).config_value) setWhatsappNumber((data as any).config_value);
      });
  }, []);

  const handleWhatsApp = () => {
    const num = whatsappNumber || "919876543210";
    window.open(`https://wa.me/${num}?text=${encodeURIComponent("Hi! I need help with Reel Analyzer.")}`, "_blank");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground">
            {!collapsed && "Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <button
          onClick={handleWhatsApp}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors text-sm font-medium"
        >
          <MessageCircle className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>WhatsApp Help Center</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
