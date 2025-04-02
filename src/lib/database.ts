
import { cacheData, getCachedData, UserData } from "./cache";
import { toast } from "sonner";

const API_URL = "http://localhost:4532/admingetall";
const API_TOKEN = "testinghard123";

// Fetch users data from the API endpoint
export const fetchUsers = async (): Promise<UserData[]> => {
  // First, check if we already have data in the cache
  const { data: cachedData } = getCachedData();
  
  // If we have cached data, return it without making an API call
  if (cachedData && cachedData.length > 0) {
    console.log('Using cached data instead of making API call');
    return cachedData;
  }
  
  try {
    console.log('Fetching users from API endpoint...');
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': API_TOKEN,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Data retrieved:', data);
    
    // Convert the API response to our UserData format
    const userData = data.map((row: any) => ({
      id: row.id,
      name: row.name || 'Unknown',
      age: row.age || 0,
      email: row.email || 'unknown@example.com',
      iq_score: row.iq_score || 0,
      paid: Boolean(row.paid),
      certificate: row.certificate || 'NONE',
      created_at: row.created_at || new Date().toISOString()
    }));
    
    // Cache the data
    cacheData(userData);
    
    toast.success('Data synchronized successfully');
    return userData;
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error(`Failed to fetch user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Return empty array instead of mock data
    return [];
  }
};
