
import { BarChart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: "analytics" | "settings";
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  const navigate = useNavigate();
  
  const Icon = icon === "analytics" ? BarChart : Settings;
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] text-center p-4">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <Icon className="h-12 w-12 text-gray-500" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      <Button onClick={() => navigate("/dashboard")}>
        View User Data
      </Button>
    </div>
  );
}
