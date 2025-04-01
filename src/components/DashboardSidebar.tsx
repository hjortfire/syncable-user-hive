
import { Home, Users, Settings, BarChart, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";

export function DashboardSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      url: "/dashboard",
    },
    {
      title: "Users",
      icon: Users,
      url: "/dashboard/users",
    },
    {
      title: "Analytics",
      icon: BarChart,
      url: "/dashboard/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      url: "/dashboard/settings",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="text-center py-4 border-b">
        <div className="font-bold text-xl">CRM Dashboard</div>
        <div className="text-xs text-muted-foreground mt-1">User Management</div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      className={cn(
                        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}
                      onClick={() => navigate(item.url)}
                    >
                      <item.icon className="w-5 h-5 mr-2" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <button
          onClick={handleLogout}
          className="flex items-center text-gray-600 hover:text-gray-900 w-full"
        >
          <LogOut className="w-5 h-5 mr-2" />
          <span>Logout</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
