
import { useState, useMemo } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ArrowUpDown,
  Check,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserData } from "@/lib/cache";

interface UserTableProps {
  data: UserData[];
  isLoading: boolean;
}

export function UserTable({ data, isLoading }: UserTableProps) {
  const [sortField, setSortField] = useState<keyof UserData>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  
  const handleSort = (field: keyof UserData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  
  const filteredData = useMemo(() => {
    return data.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.certificate.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);
  
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === "asc" 
        ? (aValue as number) - (bValue as number) 
        : (bValue as number) - (aValue as number);
    });
  }, [filteredData, sortField, sortDirection]);
  
  const SortIcon = ({ field }: { field: keyof UserData }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 ml-1" />;
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 ml-1" />
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Search users..."
            className="pl-8 max-w-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500">
          Showing {sortedData.length} of {data.length} users
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="w-[50px] cursor-pointer"
                onClick={() => handleSort("id")}
              >
                <div className="flex items-center">
                  ID
                  <SortIcon field="id" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Name
                  <SortIcon field="name" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("age")}
              >
                <div className="flex items-center">
                  Age
                  <SortIcon field="age" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("email")}
              >
                <div className="flex items-center">
                  Email
                  <SortIcon field="email" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("iq_score")}
              >
                <div className="flex items-center">
                  IQ Score
                  <SortIcon field="iq_score" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("paid")}
              >
                <div className="flex items-center">
                  Paid
                  <SortIcon field="paid" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("certificate")}
              >
                <div className="flex items-center">
                  Certificate
                  <SortIcon field="certificate" />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("created_at")}
              >
                <div className="flex items-center">
                  Created At
                  <SortIcon field="created_at" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                    <span>Loading data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  {searchTerm ? (
                    <span>No users match your search.</span>
                  ) : (
                    <span>No data available. Click "Sync Data" to fetch users.</span>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map(user => (
                <TableRow 
                  key={user.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedUser(user === selectedUser ? null : user)}
                >
                  <TableCell>{user.id}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.age}</TableCell>
                  <TableCell className="text-blue-600 hover:underline">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.iq_score > 120 ? "default" : "secondary"}>
                      {user.iq_score}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.paid ? (
                      <Check className="text-green-500" size={18} />
                    ) : (
                      <X className="text-red-500" size={18} />
                    )}
                  </TableCell>
                  <TableCell>
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                      {user.certificate}
                    </code>
                  </TableCell>
                  <TableCell className="text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedUser && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <div className="flex justify-between mb-2">
            <h3 className="font-bold">User Details</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedUser(null)}
            >
              Close
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{selectedUser.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p>{selectedUser.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p>{selectedUser.age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IQ Score</p>
              <p>{selectedUser.iq_score}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Status</p>
              <p>{selectedUser.paid ? "Paid" : "Unpaid"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Certificate</p>
              <p>{selectedUser.certificate}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Created At</p>
              <p>{new Date(selectedUser.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
