import { create } from 'zustand'
import { persist, PersistOptions } from 'zustand/middleware'
import { DashboardStats } from '@/types/dashboard'
import { DossieData } from '@/types/dossie'

// Define interface for Análise Mensal data
export interface AnaliseMensalData {
  monthlyMetricsData: any[];
  bestMonths: any[];
  worstMonths: any[];
  highestVolumeMonths: any[];
  postBigWinStats: any;
  monthlyROIData: any[];
}

// Define the interface for calculated stats
export interface CalculatedStats {
  sortedMonthlyROI: Array<{ month: string; roi: number }>;
  roiByTypeData: Array<{ type: string; roi: number; profit: number; count: number }>;
  roiByBuyInData: Array<{ range: string; roi: number; profit: number; count: number }>;
  tournamentTypeStats: Array<{ 
    type: string;
    label: string;
    count: number;
    percentage: number;
    profit: number;
    roi: number;
  }>;
}

export interface Tournament {
  id?: string
  date?: string
  game?: string
  stake?: number
  prize?: number
  profit: number
  roi?: number
  position?: number
  entries?: number
  flags?: string
  buyInRange?: string
  type?: 'psko' | 'vanilla' | 'hyper' | 'other'
  
  // Additional fields needed for big-hits page
  data?: Date | string
  rede?: string
  tipoTorneio?: string
  buyIn?: number
  entradas?: number
  posicao?: number | null
}

interface StoreState {
  dashboardData: DashboardStats | null
  dossieData: DossieData | null
  analiseMensalData: AnaliseMensalData | null
  bigHitsData: Tournament[] | null
  calculatedStats: CalculatedStats | null  // New property for memoized calculations
  dataTimestamp: number | null
  setDashboardData: (data: DashboardStats) => void
  setDossieData: (data: DossieData) => void
  setAnaliseMensalData: (data: AnaliseMensalData) => void
  setBigHitsData: (data: Tournament[]) => void
  setCalculatedStats: (data: CalculatedStats) => void  // New method
  clearData: () => void
  isDataFresh: () => boolean
}

type StoreStateWithoutMethods = Omit<StoreState, 'setDashboardData' | 'setDossieData' | 'setAnaliseMensalData' | 'setBigHitsData' | 'setCalculatedStats' | 'clearData' | 'isDataFresh'>

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

// Create a basic Zustand store without persistence
export const useStore = create<StoreState>((set, get) => ({
  dashboardData: null,
  dossieData: null, 
  analiseMensalData: null,
  bigHitsData: null,
  calculatedStats: null,  // Initialize as null
  dataTimestamp: null,

  setDashboardData: (data: DashboardStats) => set({ 
    dashboardData: data, 
    dataTimestamp: data ? Date.now() : get().dataTimestamp 
  }),

  setDossieData: (data: DossieData) => set({ 
    dossieData: data,
    dataTimestamp: data ? Date.now() : get().dataTimestamp
  }),

  setAnaliseMensalData: (data: AnaliseMensalData) => set({ 
    analiseMensalData: data,
    dataTimestamp: data ? Date.now() : get().dataTimestamp
  }),

  setBigHitsData: (data: Tournament[]) => set({ 
    bigHitsData: data,
    dataTimestamp: data ? Date.now() : get().dataTimestamp
  }),

  setCalculatedStats: (data: CalculatedStats) => set({
    calculatedStats: data
  }),

  clearData: () => set({ 
    dashboardData: null, 
    dossieData: null, 
    analiseMensalData: null,
    bigHitsData: null,
    calculatedStats: null,  // Clear calculated stats as well
    dataTimestamp: null 
  }),

  isDataFresh: () => {
    const timestamp = get().dataTimestamp
    if (!timestamp) return false
    
    const now = Date.now()
    return now - timestamp < TWENTY_FOUR_HOURS
  }
})) 