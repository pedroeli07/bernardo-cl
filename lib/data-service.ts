import { DashboardStats } from "@/types/dashboard";
import { DossieData } from "@/types/dossie";
import { useStore } from "./store";
import workerManager from "./worker-manager";

// Define interfaces for new data types
interface RoiData extends DashboardStats {}

interface AnaliseMensalData {
  monthlyMetricsData: any[];
  bestMonths: any[];
  worstMonths: any[];
  highestVolumeMonths: any[];
  postBigWinStats: any;
  monthlyROIData: any[];
}

interface BigHitData {
  bigHits: any[];
  totalPrize: number;
  totalProfit: number;
  bigHitsROI: number;
  yearlyStats: any[];
}

// Singleton class to manage data fetching and processing
class DataService {
  private static instance: DataService;
  private rawData: any[] | null = null;
  private dataFetchPromise: Promise<any[]> | null = null;
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private constructor() {
    // Private constructor for singleton pattern
  }

  // Get the singleton instance
  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  // Fetch raw tournament data
  private async fetchRawData(): Promise<any[]> {
    try {
      // If we're already fetching, return the promise
      if (this.dataFetchPromise) {
        return this.dataFetchPromise;
      }

      // Create a new fetch promise
      this.dataFetchPromise = new Promise<any[]>(async (resolve, reject) => {
        try {
          console.log("Fetching raw tournament data");
          const response = await fetch('/api/tournaments?limit=100000');
          
          if (!response.ok) {
            throw new Error(`Failed to fetch tournaments: ${response.status} ${response.statusText}`);
          }
          
          const responseJson = await response.json();
          const data = responseJson.data || []; // Extract the data array from the response
          
          // Process and store the raw data
          this.rawData = data.map((item: any) => ({
            ...item,
            data: new Date(item.data),
            profit: Number(item.profit),
            buyIn: item.buyIn ? Number(item.buyIn) : 0,
            prize: item.prize ? Number(item.prize) : 0,
            entradas: item.entradas || 0,
            posicao: item.posicao || null
          }));
          
          this.lastFetchTime = Date.now();
          resolve(this.rawData!);
        } catch (error) {
          console.error("Error fetching tournament data:", error);
          reject(error);
        } finally {
          // Clear the promise reference
          this.dataFetchPromise = null;
        }
      });
      
      return this.dataFetchPromise;
    } catch (error) {
      console.error("Error in fetchRawData:", error);
      throw error;
    }
  }

  // Get the raw tournament data, fetching if necessary
  public async getRawData(): Promise<any[]> {
    try {
      // If data is in memory and fresh, use it
      if (this.rawData && (Date.now() - this.lastFetchTime < this.CACHE_DURATION)) {
        return this.rawData;
      }
      
      // Otherwise fetch fresh data
      return await this.fetchRawData();
    } catch (error) {
      console.error("Error getting raw data:", error);
      throw error;
    }
  }

  // Get dashboard stats, processing in worker if necessary
  public async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Check if data is already in the store
      const { dashboardData, isDataFresh } = useStore.getState();
      if (dashboardData && isDataFresh()) {
        console.log("Using dashboard data from store");
        return dashboardData;
      }
      
      // Get the raw data
      const rawData = await this.getRawData();
      
      // Process the data in the worker
      const processedData = await workerManager.processDashboardData(rawData);
      
      // Store the processed data
      useStore.getState().setDashboardData(processedData);
      
      return processedData;
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      throw error;
    }
  }

  // Get dossie data, processing in worker if necessary
  public async getDossieData(): Promise<DossieData> {
    try {
      // Check if data is already in the store
      const { dossieData, isDataFresh } = useStore.getState();
      if (dossieData && isDataFresh()) {
        console.log("Using dossie data from store");
        return dossieData;
      }
      
      // Get the raw data
      const rawData = await this.getRawData();
      
      // Process the data in the worker
      const processedData = await workerManager.processDossieData(rawData);
      
      // Store the processed data
      useStore.getState().setDossieData(processedData);
      
      return processedData;
    } catch (error) {
      console.error("Error getting dossie data:", error);
      throw error;
    }
  }
  
  // Get ROI data, processing in worker if necessary
  public async getRoiData(): Promise<RoiData> {
    try {
      // ROI data is the same as dashboard data in this implementation
      return await this.getDashboardStats();
    } catch (error) {
      console.error("Error getting ROI data:", error);
      throw error;
    }
  }
  
  // Get Análise Mensal data, processing in worker if necessary
  public async getAnaliseMensalData(): Promise<AnaliseMensalData> {
    try {
      // Check if data is already in the store
      const { analiseMensalData, isDataFresh } = useStore.getState();
      if (analiseMensalData && isDataFresh()) {
        console.log("Using Análise Mensal data from store");
        return analiseMensalData;
      }
      
      // Get the raw data
      const rawData = await this.getRawData();
      
      // Process the data in the worker
      const processedData = await workerManager.processAnaliseMensalData(rawData);
      
      // Store the processed data
      useStore.getState().setAnaliseMensalData(processedData);
      
      return processedData;
    } catch (error) {
      console.error("Error getting Análise Mensal data:", error);
      throw error;
    }
  }
  
  // Get Big Hits data, processing in worker if necessary
  public async getBigHitData(): Promise<BigHitData> {
    try {
      // Check if data is already in the store
      const { bigHitsData, isDataFresh } = useStore.getState();
      if (bigHitsData && isDataFresh()) {
        console.log("Using Big Hits data from store");
        const totalPrize = bigHitsData.reduce((sum: number, t: any) => sum + (t.prize || 0), 0);
        const totalProfit = bigHitsData.reduce((sum: number, t: any) => sum + t.profit, 0);
        return {
          bigHits: bigHitsData,
          totalPrize,
          totalProfit,
          bigHitsROI: 0, // Need to calculate this if needed
          yearlyStats: [] // Need to calculate this if needed
        };
      }
      
      // Get the raw data
      const rawData = await this.getRawData();
      
      // Process the data in the worker
      const processedData = await workerManager.processBigHitData(rawData);
      
      // Store the processed data
      useStore.getState().setBigHitsData(processedData.bigHits);
      
      return processedData;
    } catch (error) {
      console.error("Error getting Big Hits data:", error);
      throw error;
    }
  }
}

// Export the singleton instance
export default DataService.getInstance(); 