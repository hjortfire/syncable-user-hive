
import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { UserTable } from "@/components/UserTable";
import { getCachedData, UserData } from "@/lib/cache";
import { fetchUsers } from "@/lib/database";
import { SidebarProvider } from "@/components/ui/sidebar";

const Dashboard = () => {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  // Decide what component to show based on the current route
  const currentPath = location.pathname;
  const isUsersPage = currentPath === "/dashboard" || currentPath === "/dashboard/users";

  useEffect(() => {
    const loadInitialData = async () => {
      if (isUsersPage) {
        setIsLoading(true);
        try {
          // Always try to fetch fresh data first
          const freshData = await fetchUsers();
          setUserData(freshData);
        } catch (error) {
          console.error("Error loading data:", error);
          
          // If API fetch fails, try to use cached data as fallback
          const { data } = getCachedData();
          if (data && data.length > 0) {
            setUserData(data);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadInitialData();
  }, [isUsersPage]);
  
  const handleDataRefresh = async () => {
    if (isUsersPage) {
      setIsLoading(true);
      try {
        const freshData = await fetchUsers();
        setUserData(freshData);
      } catch (error) {
        console.error("Error refreshing data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader 
            onDataRefresh={handleDataRefresh}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          
          <main className="flex-1 p-4 bg-gray-50">
            {isUsersPage ? (
              <UserTable data={userData} isLoading={isLoading} />
            ) : (
              <Outlet />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
