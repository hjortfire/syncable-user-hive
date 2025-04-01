
import { RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchUsers } from "@/lib/database";
import { clearCache, getCachedData } from "@/lib/cache";
import { toast } from "sonner";

interface DashboardHeaderProps {
  onDataRefresh: (newData: any[]) => void;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

export function DashboardHeader({ onDataRefresh, isLoading, setIsLoading }: DashboardHeaderProps) {
  const { timestamp } = getCachedData();
  
  const handleRefreshData = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const data = await fetchUsers();
      onDataRefresh(data);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearCache = () => {
    const cleared = clearCache();
    if (cleared) {
      toast.success("Cache cleared successfully");
      onDataRefresh([]);
    } else {
      toast.error("Failed to clear cache");
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-gray-500">
          {timestamp 
            ? `Last synced: ${timestamp.toLocaleString()}`
            : "No data synced yet"}
        </p>
      </div>
      
      <div className="flex space-x-2 mt-4 sm:mt-0">
        <Button
          size="sm"
          variant="outline"
          onClick={handleClearCache}
          disabled={isLoading}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Cache
        </Button>
        
        <Button
          size="sm"
          onClick={handleRefreshData}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Syncing..." : "Sync Data"}
        </Button>
      </div>
    </div>
  );
}
