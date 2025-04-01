import { cacheData, UserData } from "./cache";
import { toast } from "sonner";
import { Client } from "ssh2";
import mysql from "mysql2/promise";

// SSH and Database configuration
export const SSH_CONFIG = {
  host: "thisismeserver",
  port: 22,
  username: "iamthenewuser",
  password: "thisisjustatempapasword1"
};

export const DB_CONFIG = {
  database: "new_iq_database",
  user: "metheuserofthedatabase",
  password: "secretbig123",
  port: 3306,
  host: '127.0.0.1' // We'll connect to MySQL through the SSH tunnel
};

let sshClient: Client | null = null;
let dbConnection: mysql.Connection | null = null;

// Create an SSH tunnel and connect to the database
export const connectToDatabase = async (): Promise<boolean> => {
  console.log('Connecting to database via SSH tunnel...');
  
  // Close any existing connections
  await closeConnections();
  
  return new Promise((resolve) => {
    try {
      console.log(`Connecting to SSH: ${SSH_CONFIG.host}:${SSH_CONFIG.port} as ${SSH_CONFIG.username}`);
      
      sshClient = new Client();
      
      sshClient.on('ready', async () => {
        console.log('SSH connection established. Creating database connection...');
        
        // Create a tunnel to the database server
        sshClient!.forwardOut(
          '127.0.0.1',
          0,
          '127.0.0.1', // The MySQL server is on the same machine 
          DB_CONFIG.port,
          async (err, stream) => {
            if (err) {
              console.error('SSH tunnel error:', err);
              sshClient!.end();
              toast.error('Failed to create SSH tunnel');
              resolve(false);
              return;
            }
            
            try {
              console.log(`Connecting to DB: ${DB_CONFIG.database} as ${DB_CONFIG.user}`);
              
              // Connect to the MySQL server through the SSH tunnel
              dbConnection = await mysql.createConnection({
                user: DB_CONFIG.user,
                password: DB_CONFIG.password,
                database: DB_CONFIG.database,
                stream: stream, // This is the SSH tunnel stream
                ssl: false
              });
              
              console.log('Database connection established successfully');
              toast.success('Connected to database via SSH');
              resolve(true);
            } catch (dbError) {
              console.error('Database connection error:', dbError);
              toast.error('Failed to connect to database');
              if (sshClient) sshClient.end();
              resolve(false);
            }
          }
        );
      });
      
      sshClient.on('error', (err) => {
        console.error('SSH connection error:', err);
        toast.error('SSH connection failed');
        resolve(false);
      });
      
      // Connect to the SSH server
      sshClient.connect(SSH_CONFIG);
      
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to establish connection');
      resolve(false);
    }
  });
};

// Close SSH and database connections
const closeConnections = async () => {
  if (dbConnection) {
    try {
      await dbConnection.end();
      console.log('Database connection closed');
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
    dbConnection = null;
  }
  
  if (sshClient) {
    sshClient.end();
    console.log('SSH connection closed');
    sshClient = null;
  }
};

// Fetch users data from the actual database
export const fetchUsers = async (): Promise<UserData[]> => {
  try {
    // Connect to database via SSH tunnel
    const connected = await connectToDatabase();
    if (!connected || !dbConnection) {
      throw new Error('Could not connect to database');
    }
    
    // Query the actual database
    console.log('Fetching users from database...');
    const [rows] = await dbConnection.execute('SELECT * FROM users');
    console.log('Data retrieved:', rows);
    
    // Convert the rows to our UserData format
    // Adjust field names as needed based on your actual database schema
    const userData = (rows as any[]).map(row => ({
      id: row.id,
      name: row.name || row.full_name || 'Unknown',
      age: row.age || 0,
      email: row.email || 'unknown@example.com',
      iq_score: row.iq_score || row.score || 0,
      paid: Boolean(row.paid),
      certificate: row.certificate || row.cert_id || 'NONE',
      created_at: row.created_at || row.createdAt || new Date().toISOString()
    }));
    
    // Cache the data
    cacheData(userData);
    
    toast.success('Data synchronized successfully from database');
    return userData;
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch user data from database');
    
    // Fall back to mock data if there's an error connecting to the real database
    console.log('Falling back to mock data');
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
    
    // Cache the mock data
    cacheData(mockData);
    
    toast.warning('Using mock data (failed to connect to database)');
    return mockData;
  } finally {
    // Don't close the connection here to keep it for subsequent queries
    // We'll let the app close it when needed
  }
};
