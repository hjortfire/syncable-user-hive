
import { toast } from "sonner";

const CACHE_KEY = 'crm_data_cache';
const CACHE_TIMESTAMP_KEY = 'crm_data_timestamp';

export type UserData = {
  id: number;
  name: string;
  age: number;
  email: string;
  iq_score: number;
  paid: boolean;
  certificate: string;
  created_at: string;
};

// Save data to local cache
export const cacheData = (data: UserData[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    return true;
  } catch (error) {
    console.error('Error caching data:', error);
    toast.error('Failed to cache data');
    return false;
  }
};

// Get data from local cache
export const getCachedData = (): { data: UserData[] | null; timestamp: Date | null } => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !timestamp) {
      return { data: null, timestamp: null };
    }
    
    return { 
      data: JSON.parse(cachedData), 
      timestamp: new Date(parseInt(timestamp))
    };
  } catch (error) {
    console.error('Error retrieving cached data:', error);
    return { data: null, timestamp: null };
  }
};

// Clear cached data
export const clearCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing cache:', error);
    return false;
  }
};
