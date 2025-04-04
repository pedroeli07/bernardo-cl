import { DashboardStats } from "@/types/dashboard";
import { DossieData } from "@/types/dossie";
import { useStore } from "./store";

// Define return types for the new processor functions
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

// Singleton instance to manage the worker and its state
class WorkerManager {
  private static instance: WorkerManager;
  private worker: Worker | null = null;
  private isProcessing = false;
  private dataPromises: Map<string, { 
    resolve: (data: any) => void, 
    reject: (error: Error) => void 
  }> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  // Get the singleton instance
  public static getInstance(): WorkerManager {
    if (!WorkerManager.instance) {
      WorkerManager.instance = new WorkerManager();
    }
    return WorkerManager.instance;
  }

  // Initialize the worker if it hasn't been created yet
  private initWorker(): Worker {
    if (!this.worker) {
      // Create the worker
      this.worker = new Worker(new URL('../app/workers/data-processor.worker.ts', import.meta.url));
      
      // Set up the message handler
      this.worker.onmessage = (event: MessageEvent<any>) => {
        const { type, data, error } = event.data;
        
        // If there's an error, reject the promise
        if (error) {
          const promiseKey = type.replace('_ERROR', '');
          const promise = this.dataPromises.get(promiseKey);
          if (promise) {
            promise.reject(new Error(error));
            this.dataPromises.delete(promiseKey);
          }
          return;
        }
        
        // If there's a result, resolve the promise
        const promiseKey = type.replace('_RESULT', '');
        const promise = this.dataPromises.get(promiseKey);
        if (promise) {
          promise.resolve(data);
          this.dataPromises.delete(promiseKey);
        }
        
        // Mark processing as complete if there are no more promises
        if (this.dataPromises.size === 0) {
          this.isProcessing = false;
        }
      };
      
      // Handle errors
      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
        // Reject all pending promises
        this.dataPromises.forEach(promise => {
          promise.reject(new Error('Worker error'));
        });
        this.dataPromises.clear();
        this.isProcessing = false;
      };
    }
    
    return this.worker;
  }

  // Process raw tournament data and return dashboard stats
  public async processDashboardData(rawData: any[]): Promise<DashboardStats> {
    try {
      // First check if we already have this data in the store
      const { dashboardData, isDataFresh } = useStore.getState();
      if (dashboardData && isDataFresh()) {
        console.log("Using stored dashboard data");
        return dashboardData;
      }
      
      // If we don't have stored data, process it with the worker
      console.log("Processing dashboard data with worker");
      
      const worker = this.initWorker();
      
      // Create a promise to handle the async worker communication
      return new Promise<DashboardStats>((resolve, reject) => {
        // Store the promise handlers
        this.dataPromises.set('PROCESS_DASHBOARD_DATA', { resolve, reject });
        
        // Post the data to the worker
        worker.postMessage({
          type: 'PROCESS_DASHBOARD_DATA',
          data: rawData
        });
        
        this.isProcessing = true;
      });
    } catch (error) {
      console.error("Error processing dashboard data:", error);
      throw error;
    }
  }

  // Process raw tournament data and return dossie data
  public async processDossieData(rawData: any[]): Promise<DossieData> {
    try {
      // First check if we already have this data in the store
      const { dossieData, isDataFresh } = useStore.getState();
      if (dossieData && isDataFresh()) {
        console.log("Using stored dossie data");
        return dossieData;
      }
      
      // If we don't have stored data, process it with the worker
      console.log("Processing dossie data with worker");
      
      const worker = this.initWorker();
      
      // Create a promise to handle the async worker communication
      return new Promise<DossieData>((resolve, reject) => {
        // Store the promise handlers
        this.dataPromises.set('PROCESS_DOSSIE_DATA', { resolve, reject });
        
        // Post the data to the worker
        worker.postMessage({
          type: 'PROCESS_DOSSIE_DATA',
          data: rawData
        });
        
        this.isProcessing = true;
      });
    } catch (error) {
      console.error("Error processing dossie data:", error);
      throw error;
    }
  }

  // Process raw tournament data for ROI page
  public async processRoiData(rawData: any[]): Promise<RoiData> {
    try {
      // Check if we already have dashboard data in the store, which contains ROI data
      const { dashboardData, isDataFresh } = useStore.getState();
      if (dashboardData && isDataFresh()) {
        console.log("Using stored dashboard data for ROI");
        return dashboardData;
      }
      
      // If we don't have stored data, process it with the worker
      console.log("Processing ROI data with worker");
      
      const worker = this.initWorker();
      
      // Create a promise to handle the async worker communication
      return new Promise<RoiData>((resolve, reject) => {
        // Store the promise handlers
        this.dataPromises.set('PROCESS_ROI_DATA', { resolve, reject });
        
        // Post the data to the worker
        worker.postMessage({
          type: 'PROCESS_ROI_DATA',
          data: rawData
        });
        
        this.isProcessing = true;
      });
    } catch (error) {
      console.error("Error processing ROI data:", error);
      throw error;
    }
  }

  // Process raw tournament data for Análise Mensal page
  public async processAnaliseMensalData(rawData: any[]): Promise<AnaliseMensalData> {
    try {
      console.log("Processing Análise Mensal data with worker");
      
      const worker = this.initWorker();
      
      // Create a promise to handle the async worker communication
      return new Promise<AnaliseMensalData>((resolve, reject) => {
        // Store the promise handlers
        this.dataPromises.set('PROCESS_ALISE_MENSAL_DATA', { resolve, reject });
        
        // Post the data to the worker
        worker.postMessage({
          type: 'PROCESS_ALISE_MENSAL_DATA',
          data: rawData
        });
        
        this.isProcessing = true;
      });
    } catch (error) {
      console.error("Error processing Análise Mensal data:", error);
      throw error;
    }
  }

  // Process raw tournament data for Big Hits page
  public async processBigHitData(rawData: any[]): Promise<BigHitData> {
    try {
      // Check if we already have this data in the store
      const { bigHitsData, isDataFresh } = useStore.getState();
      if (bigHitsData && isDataFresh()) {
        console.log("Using stored big hits data");
        return {
          bigHits: bigHitsData,
          totalPrize: bigHitsData.reduce((sum: number, t: any) => sum + (t.prize || 0), 0),
          totalProfit: bigHitsData.reduce((sum: number, t: any) => sum + t.profit, 0),
          bigHitsROI: 0, // Calculate this properly
          yearlyStats: [] // Calculate this properly
        };
      }
      
      // If we don't have stored data, process it with the worker
      console.log("Processing Big Hits data with worker");
      
      const worker = this.initWorker();
      
      // Create a promise to handle the async worker communication
      return new Promise<BigHitData>((resolve, reject) => {
        // Store the promise handlers
        this.dataPromises.set('PROCESS_BIG_HIT_DATA', { resolve, reject });
        
        // Post the data to the worker
        worker.postMessage({
          type: 'PROCESS_BIG_HIT_DATA',
          data: rawData
        });
        
        this.isProcessing = true;
      });
    } catch (error) {
      console.error("Error processing Big Hits data:", error);
      throw error;
    }
  }

  // Check if the worker is currently processing data
  public isWorkerProcessing(): boolean {
    return this.isProcessing;
  }

  // Terminate the worker when it's no longer needed
  public terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.isProcessing = false;
      this.dataPromises.clear();
    }
  }
}

export default WorkerManager.getInstance(); 