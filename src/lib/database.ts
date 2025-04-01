
import { cacheData, UserData } from "./cache";
import { toast } from "sonner";

// SSH and Database configuration
const SSH_CONFIG = {
  host: "thisismeserver",
  port: 22,
  username: "iamthenewuser",
  password: "thisisjustatempapasword1"
};

const DB_CONFIG = {
  database: "new_iq_database",
  user: "metheuserofthedatabase",
  password: "secretbig123",
  port: 3306
};

// Mock function for simulating SSH connection
// In production, this would connect to your actual server via an API
export const connectToDatabase = async (): Promise<boolean> => {
  console.log('Connecting to database...');
  
  try {
    console.log(`Connecting to SSH: ${SSH_CONFIG.host}:${SSH_CONFIG.port} as ${SSH_CONFIG.username}`);
    console.log(`Connecting to DB: ${DB_CONFIG.database} as ${DB_CONFIG.user} on port ${DB_CONFIG.port}`);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful connection
    console.log('Connected to database successfully');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    toast.error('Failed to connect to database');
    return false;
  }
};

// Fetch users data
export const fetchUsers = async (): Promise<UserData[]> => {
  try {
    // Connect to database
    const connected = await connectToDatabase();
    if (!connected) {
      throw new Error('Could not connect to database');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock data for demonstration purposes
    // In a real app, this would query your actual database
    const mockData: UserData[] = [
      {
        id: 1,
        name: "Jane Smith",
        age: 28,
        email: "jane.smith@example.com",
        iq_score: 125,
        paid: true,
        certificate: "CERT1234",
        created_at: "2023-06-15T10:30:00Z"
      },
      {
        id: 2,
        name: "John Doe",
        age: 35,
        email: "john.doe@example.com",
        iq_score: 118,
        paid: false,
        certificate: "CERT5678",
        created_at: "2023-05-20T14:45:00Z"
      },
      {
        id: 3,
        name: "Alice Johnson",
        age: 42,
        email: "alice.johnson@example.com",
        iq_score: 132,
        paid: true,
        certificate: "CERT9012",
        created_at: "2023-04-10T09:15:00Z"
      },
      {
        id: 4,
        name: "Robert Chen",
        age: 23,
        email: "robert.chen@example.com",
        iq_score: 129,
        paid: false,
        certificate: "CERT3456",
        created_at: "2023-07-05T16:20:00Z"
      },
      {
        id: 5,
        name: "Maria Garcia",
        age: 31,
        email: "maria.garcia@example.com",
        iq_score: 124,
        paid: true,
        certificate: "CERT7890",
        created_at: "2023-03-25T11:50:00Z"
      }
    ];
    
    // Cache the data
    cacheData(mockData);
    
    toast.success('Data synchronized successfully');
    return mockData;
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch user data');
    throw error;
  }
};
