"use client"

import React, { useState, useMemo } from 'react'
import { mockData, BernardoPerformanceData } from '@/lib/mock-data'
import { formatCurrency, formatPercentage, parseNumber } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  ChevronDown,
  SortAsc,
  SortDesc,
  Filter,
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { motion } from "framer-motion"
import PlayerSummaryCard from '@/components/dashboard/PlayerSummaryCard'
import PaginatedTable from '@/components/dashboard/PaginatedTable'
import { Badge } from '@/components/ui/badge'

// Helper to format date ranges for display
const formatDateRange = (dateRange: string) => {
  const [startDate, endDate] = dateRange.split('-');
  
  // Convert MM/DD/YYYY to DD/MM/YYYY
  const formatDate = (date: string) => {
    if (!date) return '';
    const [month, day, year] = date.split('/');
    return `${day}/${month}/${year}`;
  };
  
  return `${formatDate(startDate)} - ${formatDate(endDate || startDate)}`;
};

// Format date for graphs (24 Mai 2022)
const formatDateForGraph = (dateRange: string) => {
  const [startDate] = dateRange.split('-');
  if (!startDate) return '';
  
  const [month, day, year] = startDate.split('/');
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  return `${day} ${monthNames[parseInt(month) - 1]} ${year}`;
};

// Global constants
const TOTAL_PLAYER_TOURNAMENTS = 29571;
const TOTAL_PLAYER_ENTRIES = 36529;
const TOTAL_PLAYER_PROFIT = 126276;
const TOTAL_PLAYER_ROI = 5.2;
const TOTAL_PLAYER_ITM = 17.9;
const TOTAL_PLAYER_PROFIT_PER_HOUR = 66.53;
const TOTAL_PLAYER_ABILITY = 92;
const TOTAL_PLAYER_FINAL_TABLES = 874;
const TOTAL_PLAYER_AVG_STAKE = 61.33;
const TOTAL_PLAYER_AVG_PROFIT = 3.46;
const TOTAL_PLAYER_AVG_ROI = 4.3;
const PLAYER_START_DATE = "09/15/2021";
const PLAYER_END_DATE = "04/06/2040";
const PERIOD_134K_START = "05/24/2022";
const PERIOD_134K_END = "11/24/2022";
const PERIOD_BSOP_START = "04/07/2023";
const PERIOD_BSOP_END = "10/07/2023";

// COLORS
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function DossiePage() {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = useState<string>('');
  const [buyInRangeFilter, setBuyInRangeFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');

  // Get unique date ranges and buy-in ranges for filters
  const uniqueDateRanges = useMemo(() => 
    ['all', ...new Set(mockData.map(item => item.dateRange))],
    []
  );
  
  const uniqueBuyInRanges = useMemo(() => 
    ['all', ...new Set(mockData.map(item => item.buyInRange).filter(Boolean) as string[])],
    []
  );

  // Sort and filter the data
  const filteredData = useMemo(() => {
    let filtered = [...mockData];
    
    // Apply text filter
    if (filter) {
      const lowerFilter = filter.toLowerCase();
      filtered = filtered.filter(item => 
        (item.dateRange && item.dateRange.toLowerCase().includes(lowerFilter)) ||
        (item.buyInRange && item.buyInRange.toLowerCase().includes(lowerFilter)) ||
        (item.tournamentType && item.tournamentType.toLowerCase().includes(lowerFilter))
      );
    }
    
    // Apply buy-in range filter
    if (buyInRangeFilter !== 'all') {
      filtered = filtered.filter(item => item.buyInRange === buyInRangeFilter);
    }
    
    // Apply date range filter
    if (dateRangeFilter !== 'all') {
      filtered = filtered.filter(item => item.dateRange === dateRangeFilter);
    }
    
    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let valueA = a[sortField as keyof typeof a] || 0;
        let valueB = b[sortField as keyof typeof b] || 0;
        
        // Parse string values to numbers where needed
        if (typeof valueA === 'string' && valueA.includes('%')) {
          valueA = parseNumber(valueA);
        }
        if (typeof valueB === 'string' && valueB.includes('%')) {
          valueB = parseNumber(valueB);
        }
        
        if (sortDirection === 'asc') {
          return valueA > valueB ? 1 : -1;
        } else {
          return valueA < valueB ? 1 : -1;
        }
      });
    }
    
    return filtered;
  }, [mockData, sortField, sortDirection, filter, buyInRangeFilter, dateRangeFilter]);

  // Calculate summary stats from filtered data
  const summaryStats = useMemo(() => {
    // Use filtered data for calculations
    const data = filteredData;
    const totalTournaments = data.reduce((sum, item) => sum + item.count, 0);
    const totalProfit = data.reduce((sum, item) => sum + (typeof item.profit === 'number' ? item.profit : parseNumber(item.profit)), 0);
    
    // Calculate weighted average ROI
    let totalWeightedROI = 0;
    let totalWeight = 0;
    data.forEach(item => {
      const count = item.count;
      const roi = typeof item.totalROI === 'string' ? parseNumber(item.totalROI) : item.totalROI;
      totalWeightedROI += roi * count;
      totalWeight += count;
    });
    
    const avgROI = totalWeight > 0 ? totalWeightedROI / totalWeight : 0;
    
    // ITM average
    let totalITM = 0;
    data.forEach(item => {
      totalITM += parseNumber(item.itm) * item.count;
    });
    const avgITM = totalWeight > 0 ? totalITM / totalWeight : 0;
    
    // Final tables
    const totalFinalTables = data.reduce((sum, item) => sum + item.finalTables, 0);
    
    // Average buy-in (stake)
    const totalStake = data.reduce((sum, item) => {
      const stake = typeof item.avgStake === 'number' ? item.avgStake : parseNumber(item.avgStake);
      return sum + stake * item.count;
    }, 0);
    const avgStake = totalWeight > 0 ? totalStake / totalWeight : 0;

    return {
      totalTournaments,
      totalProfit,
      avgROI,
      avgITM,
      totalFinalTables,
      avgStake
    };
  }, [filteredData]);

  // Calculate stats for 134k period (May 2022 - Nov 2022)
  const period134kStats = useMemo(() => {
    const data = mockData.filter(item => item.dateRange === PERIOD_134K_START + "-" + PERIOD_134K_END);
    
    // Find the entry where buyInRange is All and tournamentType is All
    const allEntry = data.find(item => 
      item.dateRange === PERIOD_134K_START + "-" + PERIOD_134K_END && 
      item.buyInRange === "All" && 
      item.tournamentType === "All"
    );
    
    if (allEntry) {
      return {
        tournaments: allEntry.count,
        entries: allEntry.entries,
        profit: typeof allEntry.profit === 'number' ? allEntry.profit : parseNumber(allEntry.profit),
        roi: parseNumber(allEntry.totalROI),
        avgTournamentsPerMonth: allEntry.count / 6,
        ability: allEntry.ability,
        finalTables: allEntry.finalTables,
        profitPerHour: typeof allEntry.profitPerHour === 'number' ? allEntry.profitPerHour : parseNumber(allEntry.profitPerHour),
        earlyFinishes: allEntry.earlyFinishes,
        lateFinishes: allEntry.lateFinishes,
        avgStake: typeof allEntry.avgStake === 'number' ? allEntry.avgStake : parseNumber(allEntry.avgStake),
        avgProfit: typeof allEntry.avgProfit === 'number' ? allEntry.avgProfit : parseNumber(allEntry.avgProfit),
        itm: allEntry.itm,
        avgEntrants: allEntry.avgEntrants,
        avgROI: parseNumber(allEntry.avgROI)
      };
    }
    
    // Fallback to the first entry that is for All tournament type
    const allTypeEntry = data.find(item => item.tournamentType === "All");
    
    return {
      tournaments: 5594,
      entries: 6809,
      profit: -59435,
      roi: -11.1,
      avgTournamentsPerMonth: 5594 / 6,
      ability: 73,
      finalTables: 224,
      profitPerHour: -58.37,
      earlyFinishes: "2.3%",
      lateFinishes: "8.4%",
      avgStake: 72.93,
      avgProfit: -8.73,
      itm: "16.7%",
      avgEntrants: 410,
      avgROI: -10.2
    };
  }, []);

  // Calculate stats for BSOP period (Apr 2023 - Oct 2023)
  const periodBSOPStats = useMemo(() => {
    const data = mockData.filter(item => item.dateRange === PERIOD_BSOP_START + "-" + PERIOD_BSOP_END);
    
    // Find the entry where buyInRange is All and tournamentType is All
    const allEntry = data.find(item => 
      item.dateRange === PERIOD_BSOP_START + "-" + PERIOD_BSOP_END && 
      item.buyInRange === "All" && 
      item.tournamentType === "All"
    );
    
    if (allEntry) {
      return {
        tournaments: allEntry.count,
        entries: allEntry.entries,
        profit: typeof allEntry.profit === 'number' ? allEntry.profit : parseNumber(allEntry.profit),
        roi: parseNumber(allEntry.totalROI),
        avgTournamentsPerMonth: allEntry.count / 6,
        ability: allEntry.ability,
        finalTables: allEntry.finalTables,
        profitPerHour: typeof allEntry.profitPerHour === 'number' ? allEntry.profitPerHour : parseNumber(allEntry.profitPerHour),
        earlyFinishes: allEntry.earlyFinishes,
        lateFinishes: allEntry.lateFinishes,
        avgStake: typeof allEntry.avgStake === 'number' ? allEntry.avgStake : parseNumber(allEntry.avgStake),
        avgProfit: typeof allEntry.avgProfit === 'number' ? allEntry.avgProfit : parseNumber(allEntry.avgProfit),
        itm: allEntry.itm,
        avgEntrants: allEntry.avgEntrants,
        avgROI: parseNumber(allEntry.avgROI)
      };
    }
    
    // For BSOP period, we don't have an All entry with tournamentType All, so we'll use the one with just buyInRange All
    return {
      tournaments: 3566,
      entries: 4292,
      profit: -22083,
      roi: -6.7,
      avgTournamentsPerMonth: 3566 / 6,
      ability: 74,
      finalTables: 128,
      profitPerHour: -21.27,
      earlyFinishes: "5.5%",
      lateFinishes: "8.4%",
      avgStake: 71.07,
      avgProfit: -5.15,
      itm: "15.6%",
      avgEntrants: 518,
      avgROI: -5.9
    };
  }, []);

  // Prepare data for charts
  const profitByDateRange = useMemo(() => {
    interface DateRangeData {
      dateRange: string;
      profit: number;
      tournaments: number;
      entries: number;
      avgROI: number;
    }
    
    const data: DateRangeData[] = [];
    const groupedByDate: Record<string, DateRangeData> = {};
    
    // Log para depuração
    console.log("Preparando dados para gráficos...");
    
    // Usar dados filtrados se houver filtros aplicados, caso contrário usar dados completos
    const dataToUse = 
      (dateRangeFilter !== 'all' || buyInRangeFilter !== 'all' || filter !== '') 
      ? filteredData 
      : mockData.filter(item => item.tournamentType === "All" && item.buyInRange === "All");
    
    console.log("Dados usados para gráficos:", dataToUse.length);
    
    dataToUse.forEach(item => {
      console.log(`Data range: ${item.dateRange}, Entries: ${item.entries}, Total ROI: ${item.totalROI}, Avg ROI: ${item.avgROI}`);
      
      if (!groupedByDate[item.dateRange]) {
        groupedByDate[item.dateRange] = {
          dateRange: item.dateRange,
          profit: typeof item.profit === 'number' ? item.profit : parseNumber(item.profit),
          tournaments: item.count,
          entries: item.entries,
          avgROI: parseNumber(item.avgROI)
        };
      }
    });
    
    // Converter o objeto agrupado em array
    Object.values(groupedByDate).forEach(group => {
      data.push(group);
    });
    
    console.log("Dados processados para gráficos:", data);
    
    return data;
  }, [filteredData, dateRangeFilter, buyInRangeFilter, filter]);
  
  const buyInRangeData = useMemo(() => {
    interface BuyInData {
      range: string;
      profit: number;
      tournaments: number;
      entries: number;
      roi: number;
    }
    
    const data: BuyInData[] = [];
    const grouped: Record<string, BuyInData> = {};
    
    // Log para depuração
    console.log("Preparando dados para gráfico de Buy-in Range...");
    
    // Usar dados filtrados se houver filtro de data aplicado
    const dataToUse = 
      (dateRangeFilter !== 'all' || filter !== '') 
      ? filteredData.filter(item => item.tournamentType === "All")
      : mockData.filter(item => item.tournamentType === "All");
    
    console.log("Entradas por faixa de buy-in (após filtros):", dataToUse.length);
    
    dataToUse.forEach(item => {
      const range = item.buyInRange || 'Não especificado';
      
      console.log(`Buy-in: ${range}, Count: ${item.count}, Entries: ${item.entries}, ROI: ${item.totalROI}`);
      
      if (!grouped[range]) {
        grouped[range] = {
          range,
          profit: 0,
          tournaments: 0,
          entries: 0,
          roi: 0
        };
      }
      
      grouped[range].profit += typeof item.profit === 'number' ? item.profit : parseNumber(item.profit);
      grouped[range].tournaments += item.count;
      grouped[range].entries += item.entries;
      grouped[range].roi = parseNumber(item.totalROI);
    });
    
    // Converter o objeto agrupado em array
    Object.values(grouped).forEach((group) => {
      data.push(group);
    });
    
    console.log("Dados processados para gráfico de Buy-in Range:", data);
    
    return data;
  }, [filteredData, dateRangeFilter, filter]);
  
  // Para o gráfico de pizza com tipos de torneio
  const getTournamentTypeDistribution = useMemo(() => {
    // Usar dados filtrados se houver filtro aplicado
    const dataToUse = 
      (dateRangeFilter !== 'all' || buyInRangeFilter !== 'all' || filter !== '') 
      ? filteredData
      : mockData.filter(item => item.dateRange === PLAYER_START_DATE + "-" + PLAYER_END_DATE && item.buyInRange === "All");
    
    console.log("Dados para gráfico de pizza (após filtros):", dataToUse.length);
    
    const result = dataToUse
      .filter(item => item.tournamentType && item.tournamentType !== "All")
      .reduce((acc, curr) => {
        const existing = acc.find(x => x.name === curr.tournamentType);
        if (existing) {
          existing.value += curr.entries;
          existing.profit += typeof curr.profit === 'number' ? curr.profit : parseNumber(curr.profit);
        } else {
          acc.push({ 
            name: curr.tournamentType as string, 
            value: curr.entries,
            profit: typeof curr.profit === 'number' ? curr.profit : parseNumber(curr.profit),
            roi: parseNumber(curr.totalROI)
          });
        }
        return acc;
      }, [] as { name: string, value: number, profit: number, roi: number }[]);
    
    console.log("Resultado processado para gráfico de pizza:", result);
    return result;
  }, [filteredData, dateRangeFilter, buyInRangeFilter, filter]);
  
  // Para o gráfico de ROI por tipo de torneio
  const getTournamentTypeROI = useMemo(() => {
    // Usar dados filtrados se houver filtro aplicado
    const dataToUse = 
      (dateRangeFilter !== 'all' || buyInRangeFilter !== 'all' || filter !== '') 
      ? filteredData
      : mockData.filter(item => item.dateRange === PLAYER_START_DATE + "-" + PLAYER_END_DATE && item.buyInRange === "All");
    
    console.log("Dados para gráfico de ROI por tipo (após filtros):", dataToUse.length);
    
    const result = dataToUse
      .filter(item => item.tournamentType && item.tournamentType !== "All")
      .reduce((acc, curr) => {
        const existing = acc.find(x => x.name === curr.tournamentType);
        if (existing) {
          existing.profit += typeof curr.profit === 'number' ? curr.profit : parseNumber(curr.profit);
          existing.tournaments += curr.count;
          existing.entries += curr.entries;
          // Recalcular ROI total
          existing.roi = (existing.profit / (existing.entries * parseNumber(curr.avgStake as string))) * 100;
        } else {
          acc.push({ 
            name: curr.tournamentType as string, 
            roi: parseNumber(curr.totalROI), 
            profit: typeof curr.profit === 'number' ? curr.profit : parseNumber(curr.profit),
            tournaments: curr.count,
            entries: curr.entries
          });
        }
        return acc;
      }, [] as { name: string, roi: number, profit: number, tournaments: number, entries: number }[])
      .sort((a, b) => b.roi - a.roi);
    
    console.log("Resultado processado para gráfico de ROI por tipo:", result);
    return result;
  }, [filteredData, dateRangeFilter, buyInRangeFilter, filter]);
  
  // Para análise cruzada de Buy-in Range x Tipo de Torneio
  const getBuyInVsTournamentType = useMemo(() => {
    // Usar dados filtrados se houver filtro aplicado
    const dataToUse = 
      (dateRangeFilter !== 'all' || filter !== '') 
      ? filteredData
      : mockData;
    
    console.log("Preparando dados para análise cruzada...");
    
    // Obter tipos de torneio únicos exceto "All"
    const uniqueTournamentTypes = Array.from(
      new Set(
        dataToUse
          .filter(item => item.tournamentType)
          .map(item => item.tournamentType)
      )
    ).sort((a, b) => {
      // Garantir que "All" fique por último
      if (a === "All") return 1;
      if (b === "All") return -1;
      return String(a).localeCompare(String(b));
    });
    
    // Obter faixas de buy-in únicas
    const uniqueBuyInRanges = Array.from(
      new Set(
        dataToUse
          .filter(item => item.buyInRange)
          .map(item => item.buyInRange)
      )
    ).sort((a, b) => {
      // Garantir que "All" fique por último
      if (a === "All") return 1;
      if (b === "All") return -1;
      
      // Para valores de faixas de buy-in, tentar ordenar numericamente
      const aNum = a?.toString().replace(/[^\d]/g, '') || '0';
      const bNum = b?.toString().replace(/[^\d]/g, '') || '0';
      return parseInt(aNum) - parseInt(bNum);
    });
    
    console.log("Tipos de torneio únicos:", uniqueTournamentTypes);
    console.log("Faixas de buy-in únicas:", uniqueBuyInRanges);
    
    // Criar matriz de dados
    const result = uniqueBuyInRanges.map(buyIn => {
      const row: any = { buyInRange: buyIn };
      
      uniqueTournamentTypes.forEach(type => {
        // Filtrar por buy-in e tipo
        const filteredItems = dataToUse.filter(
          item => item.buyInRange === buyIn && item.tournamentType === type
        );
        
        if (filteredItems.length > 0) {
          // Calcular totais para esta combinação
          const totalEntries = filteredItems.reduce((sum, item) => sum + item.entries, 0);
          const totalProfit = filteredItems.reduce(
            (sum, item) => sum + (typeof item.profit === 'number' ? item.profit : parseNumber(item.profit)), 
            0
          );
          const avgAbility = filteredItems.reduce((sum, item) => sum + (item.ability || 0), 0) / filteredItems.length;
          const avgEarly = filteredItems.reduce((sum, item) => {
            const earlyStr = item.earlyFinishes?.toString() || '0%';
            return sum + parseNumber(earlyStr);
          }, 0) / filteredItems.length;
          const avgLate = filteredItems.reduce((sum, item) => {
            const lateStr = item.lateFinishes?.toString() || '0%';
            return sum + parseNumber(lateStr);
          }, 0) / filteredItems.length;
          
          // Verificar valores específicos para debug
          if (buyIn === "$60 a 130" && String(type) === "SixMax") {
            console.log("Valores para 6 Max, $60 a 130:", filteredItems.map(i => i.entries));
            console.log("Total entries calculado:", totalEntries);
          }
          
          // Armazenar os dados calculados
          row[`${type}_entries`] = totalEntries;
          row[`${type}_roi`] = filteredItems.length > 0 
            ? parseNumber(filteredItems[0].totalROI)
            : 0;
          row[`${type}_profit`] = totalProfit;
          row[`${type}_ability`] = avgAbility;
          row[`${type}_early`] = avgEarly;
          row[`${type}_late`] = avgLate;
        } else {
          // Valor padrão se não houver dados para esta combinação
          row[`${type}_entries`] = 0;
          row[`${type}_roi`] = 0;
          row[`${type}_profit`] = 0;
          row[`${type}_ability`] = 0;
          row[`${type}_early`] = 0;
          row[`${type}_late`] = 0;
        }
      });
      
      return row;
    });
    
    console.log("Dados processados para análise cruzada:", result);
    return {
      data: result,
      tournamentTypes: uniqueTournamentTypes
    };
  }, [filteredData, dateRangeFilter, filter]);

  // Handle sorting column click
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Modified to ensure consistent number formatting
  const formatNumberWithLocale = (num: number) => {
    return num.toLocaleString('en-US');
  };

  // Reset all filters
  const resetFilters = () => {
    setFilter('');
    setBuyInRangeFilter('all');
    setDateRangeFilter('all');
    setSortField(null);
  };

  // Variantes para animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 10
      }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="flex flex-col gap-4 p-4 md:p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        variants={itemVariants}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Dossiê Completo</h1>
          <p className="text-muted-foreground">Análise detalhada de desempenho em torneios de poker (Bernardo)</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
        <Button variant="outline" onClick={resetFilters} className="shrink-0">
          <Filter className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
        </motion.div>
      </motion.div>

      <Separator />
      
      {/* Player Summary Card com animação */}
      <motion.div variants={itemVariants}>
      <PlayerSummaryCard
        totalTournaments={TOTAL_PLAYER_TOURNAMENTS}
        totalEntries={TOTAL_PLAYER_ENTRIES}
        totalProfit={TOTAL_PLAYER_PROFIT}
          avgStake={TOTAL_PLAYER_AVG_STAKE}
          totalROI={TOTAL_PLAYER_ROI}
          avgROI={TOTAL_PLAYER_AVG_ROI}
          avgITM={TOTAL_PLAYER_ITM}
        startDate={PLAYER_START_DATE}
        endDate={PLAYER_END_DATE}
          ability={TOTAL_PLAYER_ABILITY}
          finalTables={TOTAL_PLAYER_FINAL_TABLES}
          profitPerHour={TOTAL_PLAYER_PROFIT_PER_HOUR}
          avgProfit={TOTAL_PLAYER_AVG_PROFIT}
          earlyFinishes="2.2%"
          lateFinishes="9.7%"
          avgEntrants={TOTAL_PLAYER_ENTRIES}
        period134k={period134kStats}
        periodBSOP={periodBSOPStats}
      />
      </motion.div>
      
      {/* Seção de Análise Detalhada */}
      <motion.div 
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 variants={itemVariants} className="text-2xl font-bold text-[#FFB612] mt-8">
          Análise Detalhada de Performance
        </motion.h2>
        
        {/* Filtros Avançados */}
        <motion.div variants={itemVariants}>
          <Card className="bg-transparent border-[#FFB612] border-2">
            <CardHeader className="bg-[#141414] text-[#FFB612] rounded-t-lg">
              <CardTitle>Filtros Avançados</CardTitle>
              <CardDescription className="text-gray-400">
                Combine diferentes filtros para análise personalizada
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
                    <SelectTrigger className="bg-[#141414] text-yellow-500 border-[#FFB612]">
                      <SelectValue className="text-yellow-500" placeholder="Selecione um período" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] text-yellow-500">
                      {uniqueDateRanges.map(date => (
                        <SelectItem key={date} value={date} className="text-yellow-500 hover:bg-[#e6a310]">
                          {date === 'all' ? 'Todos os períodos' : formatDateRange(date)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Faixa de Buy-in</label>
                <Select value={buyInRangeFilter} onValueChange={setBuyInRangeFilter}>
                    <SelectTrigger className="bg-[#141414] text-yellow-500 border-[#FFB612]">
                      <SelectValue className="text-yellow-500" placeholder="Selecione uma faixa" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#141414] text-yellow-500">
                      {uniqueBuyInRanges.map(range => (
                      <SelectItem key={range} value={range} className="text-yellow-500 hover:bg-[#e6a310]">
                          {range === 'all' ? 'Todas as faixas' : range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Pesquisa</label>
                  <Input
                    type="text"
                    placeholder="Pesquisar por tipo de torneio..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full bg-[#141414] text-yellow-500 border-[#FFB612]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Layout de dois gráficos lado a lado */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          variants={containerVariants}
        >
          {/* Estatísticas Gerais por Faixa de Buy-in */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="bg-transparent border-[#FFB612] border-2 hover:shadow-[0_0_15px_rgba(255,182,18,0.3)] transition-shadow duration-300">
              <CardHeader className="bg-[#141414] text-[#FFB612] rounded-t-lg">
                <CardTitle>Performance por Faixa de Buy-in</CardTitle>
                <CardDescription className="text-gray-400">
                  Comparativo de ROI, Profit e Count por faixa
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <motion.div
                  className="h-[400px] w-full"
                  variants={chartVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={buyInRangeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="range" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          if (name === 'profit') return formatCurrency(value as number);
                          if (name === 'roi') return `${(value as number).toFixed(1)}%`;
                          if (name === 'entries') return formatNumberWithLocale(value as number);
                          return value;
                        }}
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          borderColor: '#FFB612', 
                          borderRadius: '4px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                        }}
                        labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                      <Bar yAxisId="left" dataKey="profit" name="Profit" fill="#FFB612" animationDuration={1500} animationEasing="ease-out" />
                      <Bar yAxisId="left" dataKey="entries" name="Entradas" fill="#7C4B96" animationDuration={1500} animationEasing="ease-out" animationBegin={300} />
                      <Bar yAxisId="right" dataKey="roi" name="ROI (%)" fill="#004D40" animationDuration={1500} animationEasing="ease-out" animationBegin={600} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Evolução de Profit ao Longo do Tempo */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="bg-transparent border-[#FFB612] border-2 hover:shadow-[0_0_15px_rgba(255,182,18,0.3)] transition-shadow duration-300">
              <CardHeader className="bg-[#141414] text-[#FFB612] rounded-t-lg">
                <CardTitle>Evolução de Performance</CardTitle>
                <CardDescription className="text-gray-400">
                  Tendências de profit e ROI por período
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="profit">
                  <TabsList className="mb-4">
                    <TabsTrigger value="profit">Profit</TabsTrigger>
                    <TabsTrigger value="roi">ROI</TabsTrigger>
                    <TabsTrigger value="entries">Volume</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profit">
                    <motion.div 
                      className="h-[320px] w-full"
                      variants={chartVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                  <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={profitByDateRange.sort((a, b) => {
                            const dateA = new Date(a.dateRange.split('-')[0]);
                            const dateB = new Date(b.dateRange.split('-')[0]);
                            return dateA.getTime() - dateB.getTime();
                          })}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis 
                            dataKey="dateRange" 
                            tickFormatter={(value) => formatDateForGraph(value)}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                      <YAxis />
                      <Tooltip 
                            formatter={(value) => formatCurrency(value as number)}
                            labelFormatter={(label) => formatDateRange(label as string)}
                            contentStyle={{ 
                              backgroundColor: '#1a1a1a', 
                              borderColor: '#FFB612', 
                              borderRadius: '4px',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                            labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                            itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                          <Bar dataKey="profit" name="Profit" fill="#FFB612" animationDuration={1200}>
                            {profitByDateRange.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#FFB612' : '#ef4444'} />
                            ))}
                          </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                    </motion.div>
        </TabsContent>

                  <TabsContent value="roi">
                    <motion.div 
                       className="h-[320px] w-full"
                       variants={chartVariants}
                       initial="hidden"
                       whileInView="visible"
                       viewport={{ once: true }}
                     >
                  <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={profitByDateRange.sort((a, b) => {
                            const dateA = new Date(a.dateRange.split('-')[0]);
                            const dateB = new Date(b.dateRange.split('-')[0]);
                            return dateA.getTime() - dateB.getTime();
                          })}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis 
                            dataKey="dateRange" 
                            tickFormatter={(value) => formatDateForGraph(value)}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                      <YAxis />
                      <Tooltip 
                            formatter={(value) => `${(value as number).toFixed(1)}%`}
                            labelFormatter={(label) => formatDateRange(label as string)}
                            contentStyle={{ 
                              backgroundColor: '#1a1a1a', 
                              borderColor: '#FFB612', 
                              borderRadius: '4px',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                            labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                            itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                          <Bar dataKey="avgROI" name="ROI Médio (%)" fill="#004D40" animationDuration={1200}>
                            {profitByDateRange.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.avgROI >= 0 ? '#004D40' : '#ef4444'} />
                            ))}
                          </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                    </motion.div>
                  </TabsContent>
                  
                  <TabsContent value="entries">
                    <motion.div 
                      className="h-[320px] w-full"
                      variants={chartVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                  <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={profitByDateRange.sort((a, b) => {
                            const dateA = new Date(a.dateRange.split('-')[0]);
                            const dateB = new Date(b.dateRange.split('-')[0]);
                            return dateA.getTime() - dateB.getTime();
                          })}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <XAxis 
                            dataKey="dateRange" 
                            tickFormatter={(value) => formatDateForGraph(value)}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                          />
                      <YAxis />
                      <Tooltip 
                            formatter={(value) => formatNumberWithLocale(value as number)}
                            labelFormatter={(label) => formatDateRange(label as string)}
                            contentStyle={{ 
                              backgroundColor: '#1a1a1a', 
                              borderColor: '#FFB612', 
                              borderRadius: '4px',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                            }}
                            labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                            itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                          <Bar dataKey="entries" name="Torneios" fill="#7C4B96" animationDuration={1200} />
                    </BarChart>
                  </ResponsiveContainer>
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Distribuição por Tipo de Torneio */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-transparent border-[#FFB612] border-2 hover:shadow-[0_0_15px_rgba(255,182,18,0.3)] transition-shadow duration-300">
            <CardHeader className="bg-[#141414] text-[#FFB612] rounded-t-lg">
              <CardTitle>Distribuição por Tipo de Torneio</CardTitle>
              <CardDescription className="text-gray-400">
                Análise da performance em diferentes modalidades
              </CardDescription>
              </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <motion.div 
                  className="md:col-span-5"
                  variants={chartVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  <div className="h-[360px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                          data={[
                              { name: 'PSKO', value: 21496, profit: 183151, roi: 12.5 },
                              { name: 'Hyper', value: 6740, profit: 14589, roi: 4.5 },
                              { name: 'All', value: 36529, profit: 126276, roi: 12.4 }
                          ]}
                        cx="50%"
                        cy="50%"
                          labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          animationBegin={0}
                          animationDuration={1200}
                          animationEasing="ease-out"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                              { name: 'PSKO', value: 21496, profit: 183151, roi: 12.5 },
                              { name: 'Hyper', value: 6740, profit: 14589, roi: 4.5 },
                              { name: 'All', value: 36529, profit: 126276, roi: 12.4 }
                          ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === 'value') return `${formatNumberWithLocale(value as number)} entradas`;
                            if (name === 'profit') return formatCurrency(value as number);
                            if (name === 'roi') return `${(value as number).toFixed(1)}%`;
                            return value;
                          }}
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#FFB612', 
                            borderRadius: '4px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                          }}
                          labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend 
                          formatter={(value, entry) => <span style={{ color: '#fff' }}>{value}</span>}
                        />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                </motion.div>
                
                <motion.div 
                  className="md:col-span-3"
                  variants={itemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-[#141414]/60 p-4 rounded-lg border border-[#FFB612]/20 h-[360px] overflow-auto">
                    <h3 className="text-lg font-semibold text-[#FFB612] mb-3">Legenda</h3>
                    <div className="space-y-2">
                      {[
                          { name: 'PSKO', value: 21496, count: 16086, profit: 183151, roi: 12.5, avgROI: 4.6, itm: "17.9%", ability: 95, earlyFinishes: "4.7%", lateFinishes: "8.7%" },
                          { name: 'Hyper', value: 6740, count: 6009, profit: 14589, roi: 4.5, avgROI: 15.7, itm: "17.2%", ability: 89, earlyFinishes: "4.5%", lateFinishes: "8.6%" },
                          { name: 'All', value: 36529, count: 29571, profit: 126276, roi: 12.4, avgROI: 4.5, itm: "17.9%", ability: 92, earlyFinishes: "3.7%", lateFinishes: "8.6%" }
                      ].map((entry, index) => (
                        <motion.div 
                          key={`legend-${index}`} 
                          className="flex flex-col bg-[#1a1a1a]/40 p-3 rounded border border-[#FFB612]/10"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 mr-2 rounded-sm" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span className="text-sm font-bold text-gray-200">{entry.name}</span>
                            </div>
                            <span className="text-sm font-medium text-yellow-500">
                              {formatNumberWithLocale(entry.value)} entradas
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            <div><span className="text-gray-400">Torneios: </span><span className="text-white">{formatNumberWithLocale(entry.count)}</span></div>
                            <div><span className="text-gray-400">Profit: </span><span className="text-white">{formatCurrency(entry.profit)}</span></div>
                            <div><span className="text-gray-400">ROI: </span><span className="text-white">{entry.roi}%</span></div>
                            <div><span className="text-gray-400">ITM: </span><span className="text-white">{entry.itm}</span></div>
                            <div><span className="text-gray-400">Ability: </span><span className="text-white">{entry.ability}</span></div>
                            <div><span className="text-gray-400">Early: </span><span className="text-white">{entry.earlyFinishes}</span></div>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="md:col-span-4"
                  variants={chartVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="h-[360px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={[
                          { name: 'PSKO', roi: 12.5, profit: 183151, tournaments: 16086, entries: 21496, avgROI: 4.6 },
                          { name: 'Hyper', roi: 4.5, profit: 14589, tournaments: 6009, entries: 6740, avgROI: 15.7 },
                          { name: 'All', roi: 12.4, profit: 126276, tournaments: 29571, entries: 36529, avgROI: 4.5 }
                        ]}
                        margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                      >
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const nameStr = String(name);
                            if (nameStr === 'name') return value;
                            if (nameStr === 'roi') return `${(value as number).toFixed(1)}%`;
                            if (nameStr === 'avgROI') return `${(value as number).toFixed(1)}%`;
                            if (nameStr === 'profit') return formatCurrency(value as number);
                            if (nameStr === 'entries') return `${formatNumberWithLocale(value as number)} entradas`;
                            if (nameStr === 'tournaments') return `${formatNumberWithLocale(value as number)} torneios`;
                            return [value, name];
                          }}
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#FFB612', 
                            borderRadius: '4px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                          }}
                          labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar dataKey="roi" name="ROI Total (%)" fill="#FFB612" animationDuration={1200} />
                        <Bar dataKey="avgROI" name="ROI Médio (%)" fill="#3b82f6" animationDuration={1200} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
                </div>
              </CardContent>
            </Card>
        </motion.div>
        
        {/* Nova seção - Análise Cruzada Buy-in x Tipo de Torneio */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-transparent border-[#FFB612] border-2 hover:shadow-[0_0_15px_rgba(255,182,18,0.3)] transition-shadow duration-300">
            <CardHeader className="bg-[#141414] text-[#FFB612] rounded-t-lg">
              <CardTitle>Análise Multivariada: Buy-in × Tipo de Torneio</CardTitle>
              <CardDescription className="text-gray-400">
                Performance comparativa entre diferentes combinações de buy-in e modalidades
              </CardDescription>
              </CardHeader>
            <CardContent className="pt-6">
              {/* Legenda para tipos de torneio */}
              <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                <div className="flex items-center bg-zinc-900/60 p-2 rounded-md">
                  <Badge className="bg-amber-600 mr-2">B</Badge>
                  <span className="text-sm ">Bounty</span>
                      </div>
                <div className="flex items-center bg-zinc-900/60 p-2 rounded-md">
                  <Badge className="bg-purple-600 mr-2">6M</Badge>
                  <span className="text-sm">6 Max</span>
                      </div>
                <div className="flex items-center bg-zinc-900/60 p-2 rounded-md">
                  <Badge className="bg-blue-600 mr-2">ST</Badge>
                  <span className="text-sm">Super Turbo</span>
                      </div>
                <div className="flex items-center bg-zinc-900/60 p-2 rounded-md">
                  <Badge className="bg-green-600 mr-2">BST</Badge>
                  <span className="text-sm">Bounty e Super Turbo</span>
                      </div>
                <div className="flex items-center bg-zinc-900/60 p-2 rounded-md">
                  <Badge className="bg-red-600 mr-2">6MB</Badge>
                  <span className="text-sm">6 Max , Bounty</span>
                </div>
                <div className="flex items-center bg-zinc-900/60 p-2 rounded-md">
                  <Badge className="bg-pink-600 mr-2">6MST</Badge>
                  <span className="text-sm">6 Max e Super Turbo</span>
                </div>
                <div className="flex items-center bg-zinc-900/60 p-2 rounded-md">
                  <Badge className="bg-indigo-600 mr-2">6MBST</Badge>
                  <span className="text-sm">6 Max , Bounty e Super Turbo</span>
                </div>
                <div className="flex items-center bg-zinc-900/60 p-2 rounded-md">
                  <Badge className="bg-gray-500 mr-2">A</Badge>
                  <span className="text-sm">All (Todos)</span>
                    </div>
                  </div>
                  
              {/* Legenda para valores nas células */}
              <div className="mb-6 p-3 bg-zinc-900/60 rounded-md">
                <h4 className="text-[#FFB612] font-semibold mb-2">Legenda de Valores</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <span className="text-green-400 text-xs mr-2">VERDE</span>
                    <span className="text-sm text-gray-300">ROI médio</span>
                      </div>
                  <div className="flex items-center">
                    <span className="text-blue-400 text-xs mr-2">AZUL</span>
                    <span className="text-sm text-gray-300">Ability (habilidade)</span>
                      </div>
                  <div className="flex items-center">
                    <span className="text-amber-400 text-xs mr-2">AMARELO</span>
                    <span className="text-sm text-gray-300">Early Finishes</span>
                      </div>
                  <div className="flex items-center">
                    <span className="text-purple-400 text-xs mr-2">ROXO</span>
                    <span className="text-sm text-gray-300">Late Finishes</span>
                    </div>
                  <div className="flex items-center">
                    <span className="border-l-2 border-green-500 mr-2" style={{height: '16px'}}></span>
                    <span className="text-sm text-gray-300">ROI positivo</span>
                  </div>
                  <div className="flex items-center">
                    <span className="border-l-2 border-red-500 mr-2" style={{height: '16px'}}></span>
                    <span className="text-sm text-gray-300">ROI negativo</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zinc-900">
                    <TableRow>
                      <TableHead className="text-[#FFB612] font-bold">Faixa de Buy-in</TableHead>
                      {getBuyInVsTournamentType.tournamentTypes.map((type, index) => (
                        <TableHead key={index} className="text-[#FFB612] font-bold text-center">
                          {(() => {
                            // Retorna o badge apropriado para cada tipo de torneio
                            let badgeColor = "bg-gray-500";
                            let letter = "?";
                            
                            const typeStr = String(type);
                            if (typeStr === "Bounty") {
                              badgeColor = "bg-amber-600";
                              letter = "B";
                            } else if (typeStr === "6 Max") {
                              badgeColor = "bg-purple-600";
                              letter = "6M";
                            } else if (typeStr === "Super Turbo") {
                              badgeColor = "bg-blue-600";
                              letter = "ST";
                            } else if (typeStr === "Bounty e Super Turbo") {
                              badgeColor = "bg-green-600";
                              letter = "BST";
                            } else if (typeStr === "6 Max , Bounty") {
                              badgeColor = "bg-red-600";
                              letter = "6MB";
                            } else if (typeStr === "6 Max e Super Turbo") {
                              badgeColor = "bg-pink-600";
                              letter = "6MST";
                            } else if (typeStr === "6 Max , Bounty e Super Turbo") {
                              badgeColor = "bg-indigo-600";
                              letter = "6MBST";
                            } else if (typeStr === "All") {
                              badgeColor = "bg-gray-500";
                              letter = "A";
                            }
                            
                            return (
                              <Badge className={`${badgeColor} mb-1`}>{letter}</Badge>
                            );
                          })()}
                          <span className="block text-xs">{type as string}</span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getBuyInVsTournamentType.data.map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-zinc-900/60">
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="bg-slate-900 text-white border-slate-700">
                            {row.buyInRange}
                          </Badge>
                        </TableCell>
                        {getBuyInVsTournamentType.tournamentTypes.map((type, colIndex) => {
                          const entries = row[`${type}_entries`] as number;
                          const roi = row[`${type}_roi`] as number;
                          const profit = row[`${type}_profit`] as number;
                          const ability = row[`${type}_ability`] as number;
                          const early = row[`${type}_early`] as number;
                          const late = row[`${type}_late`] as number;
                          
                          return (
                            <TableCell key={colIndex} className="p-1 text-center">
                              {entries ? (
                                <motion.div
                                  initial={{ scale: 0.95, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ delay: 0.05 * (rowIndex + colIndex) }}
                                  className="flex flex-col items-center p-2 rounded-md"
                                  style={{ 
                                    backgroundColor: roi >= 0 ? 'rgba(255, 182, 18, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                    borderLeft: `3px solid ${roi >= 0 ? '#FFB612' : '#ef4444'}`
                                  }}
                                >
                                  <span className="font-bold text-sm">
                                    {formatNumberWithLocale(entries)}
                                  </span>
                                  <span className={roi >= 0 ? 'text-green-400 text-xs' : 'text-red-400 text-xs'}>
                                    {roi.toFixed(1)}%
                                  </span>
                                  <div className="grid grid-cols-3 gap-1 mt-1 w-full">
                                    <span className="text-blue-400 text-xs">
                                      A: {ability.toFixed(0)}
                                    </span>
                                    <span className="text-amber-400 text-xs">
                                      E: {early.toFixed(1)}%
                                    </span>
                                    <span className="text-purple-400 text-xs">
                                      L: {late.toFixed(1)}%
                                    </span>
                                  </div>
                                </motion.div>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[#FFB612] mb-4">Visualização em Gráfico</h3>
                <div className="h-[500px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getBuyInVsTournamentType.data}
                      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="buyInRange" 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                        tick={{ fill: '#ccc' }}
                      />
                      <YAxis tick={{ fill: '#ccc' }} />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const nameStr = String(name);
                          if (nameStr.includes('entries')) {
                            const tournamentType = nameStr.split('_')[0];
                            return [`${formatNumberWithLocale(value as number)} entradas`, tournamentType];
                          }
                          if (nameStr.includes('roi')) {
                            const tournamentType = nameStr.split('_')[0];
                            return [`${(value as number).toFixed(1)}%`, `${tournamentType} ROI`];
                          }
                          if (nameStr.includes('ability')) {
                            const tournamentType = nameStr.split('_')[0];
                            return [`${(value as number).toFixed(0)}`, `${tournamentType} Ability`];
                          }
                          if (nameStr.includes('early')) {
                            const tournamentType = nameStr.split('_')[0];
                            return [`${(value as number).toFixed(1)}%`, `${tournamentType} Early Finishes`];
                          }
                          if (nameStr.includes('late')) {
                            const tournamentType = nameStr.split('_')[0];
                            return [`${(value as number).toFixed(1)}%`, `${tournamentType} Late Finishes`];
                          }
                          return [value, name];
                        }}
                        contentStyle={{ 
                          backgroundColor: '#1a1a1a', 
                          borderColor: '#FFB612', 
                          borderRadius: '4px',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                        }}
                        labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: 20 }}
                        formatter={(value, entry) => {
                          if (typeof value === 'string' && value.includes('_entries')) {
                            const type = value.split('_')[0];
                            // Mapeamento de tipo para badge (similar ao header da tabela)
                            let badge = "?";
                            if (type === "Bounty") badge = "B";
                            else if (type === "6 Max") badge = "6M";
                            else if (type === "Super Turbo") badge = "ST";
                            else if (type === "Bounty e Super Turbo") badge = "BST";
                            else if (type === "6 Max , Bounty") badge = "6MB";
                            else if (type === "6 Max e Super Turbo") badge = "6MST";
                            else if (type === "6 Max , Bounty e Super Turbo") badge = "6MBST";
                            else if (type === "All") badge = "A";
                            
                            return <span>{badge} {type}</span>;
                          }
                          return null;
                        }}
                      />
                      {getBuyInVsTournamentType.tournamentTypes.map((type, index) => (
                        <Bar 
                          key={index} 
                          dataKey={`${type}_entries`} 
                          name={`${type}_entries`}
                          fill={COLORS[index % COLORS.length]} 
                          animationDuration={1200} 
                          animationBegin={index * 150}
                          stackId="a"
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
        </motion.div>
        
        {/* Tabela detalhada com todos os resultados */}
        <Card className="bg-transparent border-[#FFB612] border-2">
          <CardHeader className="bg-[#141414] text-[#FFB612] rounded-t-lg">
            <CardTitle>Resultados Detalhados</CardTitle>
            <CardDescription className="text-gray-400">
              Tabela completa com todos os dados filtrados
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <PaginatedTable 
              data={filteredData} 
              sortField={sortField} 
              sortDirection={sortDirection} 
              onSort={handleSort} 
            />
          </CardContent>
        </Card>
        
        {/* Estatísticas Multivariadas */}
        <motion.div 
          variants={itemVariants}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-transparent border-[#FFB612] border-2 hover:shadow-[0_0_15px_rgba(255,182,18,0.3)] transition-shadow duration-300">
            <CardHeader className="bg-[#141414] text-[#FFB612] rounded-t-lg">
              <CardTitle>Análise Correlacionada</CardTitle>
              <CardDescription className="text-gray-400">
                Relações entre diferentes métricas de desempenho
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Período Completo</TabsTrigger>
                  <TabsTrigger value="134k">Pós Forra 134k</TabsTrigger>
                  <TabsTrigger value="bsop">Pós BSOP Main Event</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { range: "All", profit: 126276, entries: 36529, roi: 12.4 },
                          { range: "PSKO", profit: 183151, entries: 21496, roi: 12.5 },
                          { range: "Hyper", profit: 14589, entries: 6740, roi: 4.5 },
                          { range: "$0 a 33", profit: 41872, entries: 14611, roi: 8.7 },
                          { range: "$33 a 60", profit: 32981, entries: 9132, roi: 6.0 },
                          { range: "$60 a 130", profit: 26518, entries: 7306, roi: 3.9 },
                          { range: "$130 a 450", profit: 19204, entries: 4383, roi: 2.1 },
                          { range: "$500 a 990", profit: 5701, entries: 918, roi: 1.9 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="range" />
                        <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => formatNumberWithLocale(value >= 1000 ? value/1000 : value) + (value >= 1000 ? 'k' : '')} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} domain={[0, 15]} />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === 'profit') return formatCurrency(value as number);
                            if (name === 'entries') return `${formatNumberWithLocale(value as number)} entradas`;
                            if (name === 'roi') return `${(value as number).toFixed(1)}%`;
                            return value;
                          }}
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#FFB612', 
                            borderRadius: '4px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                          }}
                          labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="entries" name="Entradas" fill="#3b82f6" animationDuration={1200} />
                        <Bar yAxisId="right" dataKey="roi" name="ROI (%)" fill="#FFB612" animationDuration={1200} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="134k">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { range: "All", profit: -59435, entries: 6809, roi: -11.1 },
                          { range: "PSKO", profit: -32187, entries: 4123, roi: -10.8 },
                          { range: "Hyper", profit: -12567, entries: 1345, roi: -12.6 },
                          { range: "$0 a 33", profit: -15832, entries: 2724, roi: -9.2 },
                          { range: "$33 a 60", profit: -18543, entries: 1771, roi: -13.6 },
                          { range: "$60 a 130", profit: -17326, entries: 1498, roi: -15.4 },
                          { range: "$130 a 450", profit: -7734, entries: 816, roi: -7.8 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="range" />
                        <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => formatNumberWithLocale(Math.abs(value) >= 1000 ? Math.abs(value)/1000 : Math.abs(value)) + (Math.abs(value) >= 1000 ? 'k' : '')} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} domain={[-20, 5]} />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === 'profit') return formatCurrency(value as number);
                            if (name === 'entries') return `${formatNumberWithLocale(value as number)} entradas`;
                            if (name === 'roi') return `${(value as number).toFixed(1)}%`;
                            return value;
                          }}
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#FFB612', 
                            borderRadius: '4px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                          }}
                          labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="entries" name="Entradas" fill="#3b82f6" animationDuration={1200} />
                        <Bar yAxisId="right" dataKey="roi" name="ROI (%)" fill="#ef4444" animationDuration={1200} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 p-4 bg-zinc-800/40 rounded-md">
                    <h4 className="text-[#FFB612] text-lg mb-2">Período Pós Forra 134k (Mai-Nov 2022)</h4>
                    <p className="text-gray-300">Análise dos resultados nos 6 meses após a forra de $134.000 ocorrida em 23/05/2022.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="bsop">
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { range: "All", profit: -22083, entries: 4292, roi: -6.7 },
                          { range: "PSKO", profit: -11456, entries: 2354, roi: -6.2 },
                          { range: "Hyper", profit: -6721, entries: 984, roi: -8.1 },
                          { range: "$0 a 33", profit: -7521, entries: 1717, roi: -4.9 },
                          { range: "$33 a 60", profit: -6624, entries: 1073, roi: -7.9 },
                          { range: "$60 a 130", profit: -5521, entries: 944, roi: -8.4 },
                          { range: "$130 a 450", profit: -2417, entries: 558, roi: -5.2 }
                        ]}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="range" />
                        <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => formatNumberWithLocale(Math.abs(value) >= 1000 ? Math.abs(value)/1000 : Math.abs(value)) + (Math.abs(value) >= 1000 ? 'k' : '')} />
                        <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} domain={[-10, 2]} />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === 'profit') return formatCurrency(value as number);
                            if (name === 'entries') return `${formatNumberWithLocale(value as number)} entradas`;
                            if (name === 'roi') return `${(value as number).toFixed(1)}%`;
                            return value;
                          }}
                          contentStyle={{ 
                            backgroundColor: '#1a1a1a', 
                            borderColor: '#FFB612', 
                            borderRadius: '4px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
                          }}
                          labelStyle={{ color: '#FFB612', fontWeight: 'bold' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="entries" name="Entradas" fill="#3b82f6" animationDuration={1200} />
                        <Bar yAxisId="right" dataKey="roi" name="ROI (%)" fill="#ef4444" animationDuration={1200} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 p-4 bg-zinc-800/40 rounded-md">
                    <h4 className="text-[#FFB612] text-lg mb-2">Período Pós BSOP Main Event (Abr-Out 2023)</h4>
                    <p className="text-gray-300">Análise dos resultados nos 6 meses após a vitória no BSOP Main Event em 06/04/2023.</p>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 p-4 bg-zinc-800/40 rounded-md">
                <h3 className="text-lg font-semibold text-white mb-2">Insights Principais</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>No período completo, PSKO apresenta o melhor ROI (12.5%) e o maior profit total ($183,151)</li>
                  <li>Nos períodos pós forra, o ROI foi negativo em todas as modalidades, indicando possível regressão à média após grandes vitórias</li>
                  <li>PSKO representa a maior quantidade de entradas entre as modalidades específicas (21,496 entradas)</li>
                  <li>Hyper apresenta um ROI positivo (4.5%) no período geral, mas com performance inferior ao PSKO</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

