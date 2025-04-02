
import { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { UserData, getCachedData } from "@/lib/cache";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { 
  CalendarDays, 
  TrendingUp, 
  Users, 
  BrainCircuit, 
  BadgeCheck, 
  Filter, 
  CreditCard
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
  // Get cached data
  const { data: userData } = getCachedData();
  const [timeRange, setTimeRange] = useState<string>("7");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [iqRangeValue, setIqRangeValue] = useState<number[]>([0, 200]);

  // Calculate date ranges
  const getDateLimit = (daysAgo: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  // Filtered data based on selected criteria
  const filteredData = useMemo(() => {
    if (!userData) return [];
    
    const timeLimit = getDateLimit(parseInt(timeRange));
    
    return userData.filter(user => {
      const userDate = new Date(user.created_at);
      const matchesTimeRange = userDate >= timeLimit;
      
      const matchesPayment = 
        paymentFilter === "all" || 
        (paymentFilter === "paid" && user.paid) || 
        (paymentFilter === "unpaid" && !user.paid);
        
      const withinIqRange = 
        user.iq_score >= iqRangeValue[0] && 
        user.iq_score <= iqRangeValue[1];
        
      return matchesTimeRange && matchesPayment && withinIqRange;
    });
  }, [userData, timeRange, paymentFilter, iqRangeValue]);

  // Stats calculations
  const stats = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalUsers: 0,
        newUsersToday: 0,
        paidUsers: 0,
        avgIQ: 0,
        paidPercentage: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersToday = filteredData.filter(user => {
      const userDate = new Date(user.created_at);
      userDate.setHours(0, 0, 0, 0);
      return userDate.getTime() === today.getTime();
    }).length;
    
    const paidUsers = filteredData.filter(user => user.paid).length;
    const totalIQ = filteredData.reduce((sum, user) => sum + user.iq_score, 0);
    
    return {
      totalUsers: filteredData.length,
      newUsersToday,
      paidUsers,
      avgIQ: Math.round(totalIQ / filteredData.length),
      paidPercentage: Math.round((paidUsers / filteredData.length) * 100)
    };
  }, [filteredData]);

  // Chart data preparations
  const usersByDayData = useMemo(() => {
    if (!userData) return [];
    
    const days = parseInt(timeRange);
    const dateGroups: Record<string, number> = {};
    
    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dateGroups[dateStr] = 0;
    }
    
    // Fill with actual data
    filteredData.forEach(user => {
      const date = new Date(user.created_at);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dateGroups[dateStr] !== undefined) {
        dateGroups[dateStr]++;
      }
    });
    
    // Convert to array for chart
    return Object.entries(dateGroups)
      .map(([date, count]) => ({ date, users: count }))
      .reverse();
  }, [filteredData, timeRange, userData]);

  const iqDistributionData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const ranges = [
      { name: "< 90", range: [0, 89] },
      { name: "90-110", range: [90, 110] },
      { name: "111-130", range: [111, 130] },
      { name: "131-150", range: [131, 150] },
      { name: "150+", range: [151, 200] }
    ];
    
    return ranges.map(rangeItem => {
      const count = filteredData.filter(
        user => user.iq_score >= rangeItem.range[0] && user.iq_score <= rangeItem.range[1]
      ).length;
      
      return {
        name: rangeItem.name,
        value: count,
        percentage: Math.round((count / filteredData.length) * 100)
      };
    });
  }, [filteredData]);

  // New paid vs unpaid chart data
  const paidVsUnpaidData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const paidUsers = filteredData.filter(user => user.paid).length;
    const unpaidUsers = filteredData.length - paidUsers;
    
    return [
      { 
        name: "Paid", 
        value: paidUsers,
        percentage: Math.round((paidUsers / filteredData.length) * 100)
      },
      { 
        name: "Unpaid", 
        value: unpaidUsers,
        percentage: Math.round((unpaidUsers / filteredData.length) * 100)
      }
    ];
  }, [filteredData]);

  // If no data available
  if (!userData || userData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              Sync user data from the dashboard to view analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Viewing data for {filteredData.length} users over the past {timeRange} days
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={16} />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>
      
      <Collapsible open={showFilters} className="w-full">
        <CollapsibleContent>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Time Period</Label>
                  <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value)}>
                    <ToggleGroupItem value="1" aria-label="1 day">1D</ToggleGroupItem>
                    <ToggleGroupItem value="7" aria-label="7 days">7D</ToggleGroupItem>
                    <ToggleGroupItem value="30" aria-label="30 days">30D</ToggleGroupItem>
                    <ToggleGroupItem value="90" aria-label="90 days">90D</ToggleGroupItem>
                    <ToggleGroupItem value="365" aria-label="1 year">1Y</ToggleGroupItem>
                  </ToggleGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <RadioGroup 
                    value={paymentFilter} 
                    onValueChange={setPaymentFilter}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="all" id="all" />
                      <Label htmlFor="all">All</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="paid" id="paid" />
                      <Label htmlFor="paid">Paid Only</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unpaid" id="unpaid" />
                      <Label htmlFor="unpaid">Unpaid Only</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label>IQ Range: {iqRangeValue[0]} - {iqRangeValue[1]}</Label>
                  <Slider
                    min={0}
                    max={200}
                    step={5}
                    value={iqRangeValue}
                    onValueChange={setIqRangeValue}
                    className="py-4"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Stats Overview */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              In selected time period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersToday}</div>
            <p className="text-xs text-muted-foreground">
              Users registered today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average IQ</CardTitle>
            <BrainCircuit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgIQ}</div>
            <p className="text-xs text-muted-foreground">
              Points across all users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidPercentage}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.paidUsers} of {stats.totalUsers} users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>User Registrations</CardTitle>
            <CardDescription>
              New users over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={usersByDayData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" name="New Users" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>IQ Distribution</CardTitle>
            <CardDescription>
              Breakdown by IQ score ranges
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer 
              className="h-full" 
              config={{
                blue: { color: '#0088FE' },
                green: { color: '#00C49F' },
                yellow: { color: '#FFBB28' },
                orange: { color: '#FF8042' },
                purple: { color: '#8884d8' }
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={iqDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {iqDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>
              Paid vs Unpaid Users
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ChartContainer 
              className="h-full"
              config={{
                Paid: { color: '#22c55e' }, // Green color for paid
                Unpaid: { color: '#ef4444' } // Red color for unpaid
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paidVsUnpaidData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    <Cell key="cell-paid" fill="#22c55e" name="Paid" />
                    <Cell key="cell-unpaid" fill="#ef4444" name="Unpaid" />
                  </Pie>
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
