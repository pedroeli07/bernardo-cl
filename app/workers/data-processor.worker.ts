// This file contains the web worker logic for processing tournament data
// The worker handles heavy computation to keep the main thread responsive

// Define the message type for worker communication
interface WorkerMessage {
  type: 'PROCESS_DASHBOARD_DATA' | 'PROCESS_DOSSIE_DATA' | 'PROCESS_ROI_DATA' | 'PROCESS_ALISE_MENSAL_DATA' | 'PROCESS_BIG_HIT_DATA';
  data: any;
}

// Handler function for processing events
self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;
  
  try {
    let result;

    switch (type) {
      case 'PROCESS_DASHBOARD_DATA':
        result = processDashboardData(data);
        break;
      case 'PROCESS_DOSSIE_DATA':
        result = processDossieData(data);
        break;
      case 'PROCESS_ROI_DATA':
        result = processRoiData(data);
        break;
      case 'PROCESS_ALISE_MENSAL_DATA':
        result = processAnaliseMensalData(data);
        break;
      case 'PROCESS_BIG_HIT_DATA':
        result = processBigHitData(data);
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
    
    // Send the processed data back to the main thread
    self.postMessage({
      type: `${type}_RESULT`,
      data: result,
      error: null
    });
  } catch (error) {
    // Send error back to main thread
    self.postMessage({
      type: `${type}_ERROR`,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Process dashboard data
function processDashboardData(rawData: any) {
  console.log('Worker: Processing dashboard data');
  
  // Calculate total statistics
  const totalTournaments = rawData.length;
  const totalProfit = rawData.reduce((sum: number, t: any) => sum + t.profit, 0);
  const totalBuyIn = rawData.reduce((sum: number, t: any) => sum + (t.buyIn || 0), 0);
  const roi = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0;
  const avgBuyIn = totalBuyIn / totalTournaments;
  
  // Calculate ITM (In The Money) rate - tournaments where player cashed
  const itmTournaments = rawData.filter((t: any) => 
    (t.prize && t.prize > 0) || (t.posicao && t.entradas && t.posicao <= t.entradas * 0.15)
  );
  const itmRate = (itmTournaments.length / totalTournaments) * 100;
  
  // Find highest prize
  const highestPrize = rawData.reduce(
    (max: any, t: any) => (t.prize && t.prize > max.prize ? { prize: t.prize, date: t.data } : max),
    { prize: 0, date: new Date() }
  );
  
  // Group tournaments by type
  const tournamentsByType: Record<string, any[]> = {};
  for (const tournament of rawData) {
    const type = tournament.tipoTorneio || 'other';
    
    if (!tournamentsByType[type]) {
      tournamentsByType[type] = [];
    }
    
    tournamentsByType[type].push(tournament);
  }
  
  // Group tournaments by buy-in range
  const tournamentsByBuyInRange: Record<string, any[]> = {};
  const buyInRanges = [
    { name: "$0~33", min: 0, max: 33 },
    { name: "$33~60", min: 33, max: 60 },
    { name: "$60~130", min: 60, max: 130 },
    { name: "$130~450", min: 130, max: 450 },
    { name: "$500~990", min: 500, max: 990 },
    { name: "$1k+", min: 1000, max: Infinity }
  ];
  
  for (const tournament of rawData) {
    const buyIn = tournament.buyIn || 0;
    let range = '$0~33';
    
    for (const { name, min, max } of buyInRanges) {
      if (buyIn >= min && buyIn < max) {
        range = name;
        break;
      }
    }
    
    if (!tournamentsByBuyInRange[range]) {
      tournamentsByBuyInRange[range] = [];
    }
    
    tournamentsByBuyInRange[range].push(tournament);
  }
  
  // Process monthly data
  const monthlyData = processMonthlyData(rawData);
  
  // Create the final dashboard data object
  return {
    totalTournaments,
    totalProfit,
    roi,
    itmRate,
    avgBuyIn,
    highestPrize,
    bestMonthlyRoi: monthlyData.bestMonthlyRoi,
    cumulativeProfitData: monthlyData.cumulativeProfitData,
    monthlyROIData: monthlyData.monthlyROIData,
    tournamentsByType,
    tournamentsByBuyInRange,
    postBigWinStats: monthlyData.postBigWinStats,
    monthlyStats: monthlyData.monthlyStats
  };
}

// Process ROI data - used by ROI medio page
function processRoiData(rawData: any) {
  console.log('Worker: Processing ROI data');
  
  // This is essentially a subset of the dashboard data, focusing on ROI metrics
  // Process monthly data
  const monthlyData = processMonthlyData(rawData);
  
  // Group tournaments by type
  const tournamentsByType: Record<string, any[]> = {};
  for (const tournament of rawData) {
    const type = tournament.tipoTorneio || 'other';
    
    if (!tournamentsByType[type]) {
      tournamentsByType[type] = [];
    }
    
    tournamentsByType[type].push(tournament);
  }
  
  // Group tournaments by buy-in range
  const tournamentsByBuyInRange: Record<string, any[]> = {};
  const buyInRanges = [
    { name: "$0~33", min: 0, max: 33 },
    { name: "$33~60", min: 33, max: 60 },
    { name: "$60~130", min: 60, max: 130 },
    { name: "$130~450", min: 130, max: 450 },
    { name: "$500~990", min: 500, max: 990 },
    { name: "$1k+", min: 1000, max: Infinity }
  ];
  
  for (const tournament of rawData) {
    const buyIn = tournament.buyIn || 0;
    let range = '$0~33';
    
    for (const { name, min, max } of buyInRanges) {
      if (buyIn >= min && buyIn < max) {
        range = name;
        break;
      }
    }
    
    if (!tournamentsByBuyInRange[range]) {
      tournamentsByBuyInRange[range] = [];
    }
    
    tournamentsByBuyInRange[range].push(tournament);
  }
  
  // Calculate total stats
  const totalTournaments = rawData.length;
  const totalProfit = rawData.reduce((sum: number, t: any) => sum + t.profit, 0);
  const totalBuyIn = rawData.reduce((sum: number, t: any) => sum + (t.buyIn || 0), 0);
  const roi = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0;
  const avgBuyIn = totalBuyIn / totalTournaments;
  
  // Calculate ITM (In The Money) rate - tournaments where player cashed
  const itmTournaments = rawData.filter((t: any) => 
    (t.prize && t.prize > 0) || (t.posicao && t.entradas && t.posicao <= t.entradas * 0.15)
  );
  const itmRate = (itmTournaments.length / totalTournaments) * 100;

  return {
    totalTournaments,
    totalProfit,
    roi,
    itmRate,
    avgBuyIn,
    monthlyROIData: monthlyData.monthlyROIData,
    tournamentsByType,
    tournamentsByBuyInRange,
    postBigWinStats: monthlyData.postBigWinStats,
    monthlyStats: monthlyData.monthlyStats
  };
}

// Process Análise Mensal data
function processAnaliseMensalData(rawData: any) {
  console.log('Worker: Processing Análise Mensal data');
  
  // Process monthly data
  const monthlyData = processMonthlyData(rawData);
  
  // Calculate metrics for each month
  const monthlyMetricsData = monthlyData.monthlyROIData.map((item: any) => {
    const monthStats = 
      monthlyData.postBigWinStats.firstBigWin.find((s: any) => s.month === item.month) ||
      monthlyData.postBigWinStats.secondBigWin.find((s: any) => s.month === item.month) ||
      { count: 0, profit: 0, totalBuyIn: 0 };
    
    return {
      month: item.month,
      tournamentCount: monthStats.count || 0,
      avgBuyIn: monthStats.count ? monthStats.totalBuyIn / monthStats.count : 0,
      avgROI: item.roi,
      profit: monthStats.profit || 0,
    };
  });
  
  // Identify best and worst months
  const bestMonths = [...monthlyMetricsData].sort((a, b) => b.avgROI - a.avgROI).slice(0, 5);
  const worstMonths = [...monthlyMetricsData].sort((a, b) => a.avgROI - b.avgROI).slice(0, 5);
  
  // Identify months with highest volume
  const highestVolumeMonths = [...monthlyMetricsData].sort((a, b) => b.tournamentCount - a.tournamentCount).slice(0, 5);
  
  return {
    monthlyMetricsData,
    bestMonths,
    worstMonths,
    highestVolumeMonths,
    postBigWinStats: monthlyData.postBigWinStats,
    monthlyROIData: monthlyData.monthlyROIData
  };
}

// Process big hits data
function processBigHitData(rawData: any) {
  console.log('Worker: Processing big hits data');
  
  // Sort tournaments by prize in descending order
  const sortedByPrize = [...rawData]
    .filter((t: any) => t.prize && t.prize > 0)
    .sort((a: any, b: any) => (b.prize || 0) - (a.prize || 0))
    .slice(0, 20);  // Get top 20
  
  // Calculate stats for these top tournaments
  const totalPrize = sortedByPrize.reduce((sum: number, t: any) => sum + (t.prize || 0), 0);
  const totalProfit = sortedByPrize.reduce((sum: number, t: any) => sum + t.profit, 0);
  const totalBuyIn = sortedByPrize.reduce((sum: number, t: any) => sum + (t.buyIn || 0), 0);
  const bigHitsROI = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0;
  
  // Group big hits by year
  const byYear: Record<string, any[]> = {};
  for (const tournament of sortedByPrize) {
    const date = new Date(tournament.data);
    const year = date.getFullYear().toString();
    
    if (!byYear[year]) {
      byYear[year] = [];
    }
    
    byYear[year].push(tournament);
  }
  
  // Calculate yearly stats
  const yearlyStats = Object.entries(byYear).map(([year, tournaments]) => {
    const count = tournaments.length;
    const totalPrize = tournaments.reduce((sum, t) => sum + (t.prize || 0), 0);
    const totalProfit = tournaments.reduce((sum, t) => sum + t.profit, 0);
    const totalBuyIn = tournaments.reduce((sum, t) => sum + (t.buyIn || 0), 0);
    const roi = totalBuyIn > 0 ? (totalProfit / totalBuyIn) * 100 : 0;
    
    return {
      year,
      count,
      totalPrize,
      totalProfit,
      roi
    };
  });
  
  return {
    bigHits: sortedByPrize,
    totalPrize,
    totalProfit,
    bigHitsROI,
    yearlyStats
  };
}

// Process dossie data
function processDossieData(rawData: any) {
  console.log('Worker: Processing dossie data');
  
  // Process monthly data (shared with dashboard)
  const monthlyData = processMonthlyData(rawData);
  
  // Further process monthly stats into detailed data
  const monthlyStats = monthlyData.monthlyStats;
  
  // Process buy-in range stats
  const buyInRangeStats = processBuyInRangeStats(rawData);
  
  // Process tournament type stats
  const typeStats = processTournamentTypeStats(rawData);
  
  // Process ITM (In The Money) stats
  const itmStats = processITMStats(rawData);
  
  // Process elimination phases
  const eliminationPhases = processEliminationPhases(rawData);
  
  // Return the complete dossie data
  return {
    monthlyStats,
    postBigWinStats: monthlyData.postBigWinStats,
    buyInRangeStats,
    typeStats,
    itmStats,
    eliminationPhases
  };
}

// Process monthly data (shared between dashboard and dossie)
function processMonthlyData(tournaments: any[]) {
  // Group tournaments by month
  const tournamentsByMonth: Record<string, any[]> = {};
  let cumulativeProfit = 0;
  const cumulativeProfitData: Array<{date: string, profit: number}> = [];
  
  // Sort tournaments by date
  const sortedTournaments = [...tournaments].sort((a, b) => {
    const dateA = new Date(a.data).getTime();
    const dateB = new Date(b.data).getTime();
    return dateA - dateB;
  });
  
  // Process each tournament
  for (const tournament of sortedTournaments) {
    const date = new Date(tournament.data);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = getMonthLabel(month);
    
    // Add to monthly grouping
    if (!tournamentsByMonth[monthLabel]) {
      tournamentsByMonth[monthLabel] = [];
    }
    tournamentsByMonth[monthLabel].push(tournament);
    
    // Update cumulative profit
    cumulativeProfit += tournament.profit;
    cumulativeProfitData.push({
      date: date.toISOString().split('T')[0],
      profit: cumulativeProfit
    });
  }
  
  // Calculate monthly stats
  const monthlyStats = Object.entries(tournamentsByMonth).map(([month, tourns]) => {
    const count = tourns.length;
    const profit = tourns.reduce((sum, t) => sum + t.profit, 0);
    const totalBuyIn = tourns.reduce((sum, t) => sum + (t.buyIn || 0), 0);
    const avgROI = totalBuyIn > 0 ? (profit / totalBuyIn) * 100 : 0;
    
    return {
      month,
      count,
      profit,
      totalBuyIn,
      avgROI
    };
  });
  
  // Create monthly ROI data
  const monthlyROIData = monthlyStats.map(stats => ({
    month: stats.month,
    roi: stats.avgROI
  }));
  
  // Find best monthly ROI
  const bestMonthlyRoi = monthlyStats.reduce(
    (max, stats) => (stats.avgROI > max.roi ? { roi: stats.avgROI, month: stats.month } : max),
    { roi: 0, month: "" }
  );
  
  // Determine post-big win stats
  // For simplicity, we'll consider the first big win to be May 2022 and the second April 2023
  const firstBigWinDate = new Date('2022-05-23');
  const secondBigWinDate = new Date('2023-04-06');
  
  // Calculate 6 months from each big win
  const firstBigWinEndDate = new Date(firstBigWinDate);
  firstBigWinEndDate.setMonth(firstBigWinEndDate.getMonth() + 6);
  
  const secondBigWinEndDate = new Date(secondBigWinDate);
  secondBigWinEndDate.setMonth(secondBigWinEndDate.getMonth() + 6);
  
  console.log(`First big win period: ${firstBigWinDate.toISOString()} to ${firstBigWinEndDate.toISOString()}`);
  console.log(`Second big win period: ${secondBigWinDate.toISOString()} to ${secondBigWinEndDate.toISOString()}`);
  
  // Filter for first big win period (6 months after May 23, 2022)
  const firstBigWin = monthlyStats.filter(stats => {
    const [monthName, yearStr] = stats.month.split('/');
    const monthIndex = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].indexOf(monthName);
    const year = parseInt(yearStr);
    
    if (monthIndex === -1) {
      console.log(`Invalid month in stats: ${stats.month}`);
      return false;
    }
    
    const statsDate = new Date(year, monthIndex, 15); // Middle of month
    const isInPeriod = statsDate >= firstBigWinDate && statsDate <= firstBigWinEndDate;
    
    console.log(`Stats date: ${statsDate.toISOString()}, in first period: ${isInPeriod}`);
    return isInPeriod;
  });
  
  // Filter for second big win period (6 months after April 6, 2023)
  const secondBigWin = monthlyStats.filter(stats => {
    const [monthName, yearStr] = stats.month.split('/');
    const monthIndex = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'].indexOf(monthName);
    const year = parseInt(yearStr);
    
    if (monthIndex === -1) {
      console.log(`Invalid month in stats: ${stats.month}`);
      return false;
    }
    
    const statsDate = new Date(year, monthIndex, 15); // Middle of month
    const isInPeriod = statsDate >= secondBigWinDate && statsDate <= secondBigWinEndDate;
    
    console.log(`Stats date: ${statsDate.toISOString()}, in second period: ${isInPeriod}`);
    return isInPeriod;
  });
  
  console.log(`First big win stats: ${firstBigWin.length} months of data`);
  console.log(`Second big win stats: ${secondBigWin.length} months of data`);
  
  // Add entries information to monthly stats
  const updatedMonthlyStats = monthlyStats.map(monthStat => {
    const monthTournaments = tournamentsByMonth[monthStat.month] || [];
    const entries = monthTournaments.reduce((sum, t) => sum + (t.entradas || 0), 0);
    return {
      ...monthStat,
      entries
    };
  });
  
  // Also add entries to the period-specific data
  const firstBigWinWithEntries = firstBigWin.map(monthStat => {
    const monthTournaments = tournamentsByMonth[monthStat.month] || [];
    const entries = monthTournaments.reduce((sum, t) => sum + (t.entradas || 0), 0);
    return {
      ...monthStat,
      entries
    };
  });
  
  const secondBigWinWithEntries = secondBigWin.map(monthStat => {
    const monthTournaments = tournamentsByMonth[monthStat.month] || [];
    const entries = monthTournaments.reduce((sum, t) => sum + (t.entradas || 0), 0);
    return {
      ...monthStat,
      entries
    };
  });
  
  return {
    monthlyStats: updatedMonthlyStats,
    bestMonthlyRoi,
    cumulativeProfitData,
    monthlyROIData,
    postBigWinStats: {
      firstBigWin: firstBigWinWithEntries,
      secondBigWin: secondBigWinWithEntries
    }
  };
}

// Process buy-in range stats
function processBuyInRangeStats(tournaments: any[]) {
  const buyInRanges = [
    { name: "$0~33", min: 0, max: 33 },
    { name: "$33~60", min: 33, max: 60 },
    { name: "$60~130", min: 60, max: 130 },
    { name: "$130~450", min: 130, max: 450 },
    { name: "$500~990", min: 500, max: 990 },
    { name: "$1k+", min: 1000, max: Infinity }
  ];
  
  const rangeStats: Record<string, { count: number, profit: number, totalBuyIn: number }> = {};
  
  // Initialize ranges
  for (const range of buyInRanges) {
    rangeStats[range.name] = { count: 0, profit: 0, totalBuyIn: 0 };
  }
  
  // Process each tournament
  for (const tournament of tournaments) {
    const buyIn = tournament.buyIn || 0;
    let rangeName = '$0~33';
    
    for (const { name, min, max } of buyInRanges) {
      if (buyIn >= min && buyIn < max) {
        rangeName = name;
        break;
      }
    }
    
    rangeStats[rangeName].count++;
    rangeStats[rangeName].profit += tournament.profit;
    rangeStats[rangeName].totalBuyIn += buyIn;
  }
  
  // Calculate ROI and format results
  return Object.entries(rangeStats).map(([range, stats]) => ({
    range,
    count: stats.count,
    profit: stats.profit,
    roi: stats.totalBuyIn > 0 ? (stats.profit / stats.totalBuyIn) * 100 : 0
  }));
}

// Process tournament type stats
function processTournamentTypeStats(tournaments: any[]) {
  const typeMap: Record<string, string> = {
    "Bounty Hyper": "Bounty Hyper",
    "Bounty Normal": "Bounty Normal", 
    "Satellite Hyper": "Satellite Hyper",
    "Satellite Normal": "Satellite Normal",
    "Vanilla Hyper": "Vanilla Hyper",
    "Vanilla Normal": "Vanilla Normal",
    "psko": "psko",
    "vanilla": "vanilla",
    "hyper": "hyper"
  };
  
  const typeStats: Record<string, { count: number, profit: number, totalBuyIn: number }> = {};
  
  // Initialize types
  for (const type of Object.values(typeMap)) {
    typeStats[type] = { count: 0, profit: 0, totalBuyIn: 0 };
  }
  typeStats["other"] = { count: 0, profit: 0, totalBuyIn: 0 };
  
  // Process each tournament
  for (const tournament of tournaments) {
    const type = tournament.tipoTorneio || 'other';
    const mappedType = typeMap[type] || 'other';
    
    typeStats[mappedType].count++;
    typeStats[mappedType].profit += tournament.profit;
    typeStats[mappedType].totalBuyIn += tournament.buyIn || 0;
  }
  
  // Calculate ROI and format results
  return Object.entries(typeStats)
    .filter(([, stats]) => stats.count > 0) // Only include types with data
    .map(([type, stats]) => ({
      type,
      count: stats.count,
      profit: stats.profit,
      roi: stats.totalBuyIn > 0 ? (stats.profit / stats.totalBuyIn) * 100 : 0
    }));
}

// Process ITM (In The Money) stats
function processITMStats(tournaments: any[]) {
  // A tournament is considered ITM (In The Money) if it has a prize or position is in the money
  const itmTournaments = tournaments.filter(t => 
    (t.prize && t.prize > 0) || (t.posicao && t.posicao <= (t.entradas || 0) * 0.15)
  );
  
  const totalTournaments = tournaments.length;
  const itmCount = itmTournaments.length;
  const itmPercentage = (itmCount / totalTournaments) * 100;
  
  // First big win period (May 2022 to March 2023)
  const firstPeriodStart = new Date('2022-05-01');
  const firstPeriodEnd = new Date('2023-03-31');
  
  // Second big win period (April 2023 onward)
  const secondPeriodStart = new Date('2023-04-01');
  const secondPeriodEnd = new Date();
  
  // Filter tournaments by period
  const firstPeriodTournaments = tournaments.filter(t => {
    const date = new Date(t.data);
    return date >= firstPeriodStart && date <= firstPeriodEnd;
  });
  
  const secondPeriodTournaments = tournaments.filter(t => {
    const date = new Date(t.data);
    return date >= secondPeriodStart && date <= secondPeriodEnd;
  });
  
  // Calculate ITM stats for each period
  const firstPeriodITM = firstPeriodTournaments.filter(t => 
    (t.prize && t.prize > 0) || (t.posicao && t.posicao <= (t.entradas || 0) * 0.15)
  );
  
  const secondPeriodITM = secondPeriodTournaments.filter(t => 
    (t.prize && t.prize > 0) || (t.posicao && t.posicao <= (t.entradas || 0) * 0.15)
  );
  
  return {
    overall: {
      totalTournaments,
      itmTournaments: itmCount,
      itmPercentage
    },
    postBigWins: {
      firstPeriod: {
        totalTournaments: firstPeriodTournaments.length,
        itmTournaments: firstPeriodITM.length,
        itmPercentage: (firstPeriodITM.length / firstPeriodTournaments.length) * 100,
        startDate: firstPeriodStart,
        endDate: firstPeriodEnd
      },
      secondPeriod: {
        totalTournaments: secondPeriodTournaments.length,
        itmTournaments: secondPeriodITM.length,
        itmPercentage: (secondPeriodITM.length / secondPeriodTournaments.length) * 100,
        startDate: secondPeriodStart,
        endDate: secondPeriodEnd
      }
    }
  };
}

// Process elimination phases
function processEliminationPhases(tournaments: any[]) {
  // Only consider tournaments with position and entries data
  const validTournaments = tournaments.filter(t => 
    t.posicao !== null && t.posicao !== undefined && t.entradas && t.entradas > 0
  );
  
  // Define elimination phases
  const phases: Record<string, { count: number, description: string }> = {
    early: { count: 0, description: "Eliminação precoce (85%+ do field)" },
    middle: { count: 0, description: "Fase média (85-50% do field)" },
    late: { count: 0, description: "Fase tardia (50-15% do field)" },
    finalTable: { count: 0, description: "Mesa final (15% do field)" },
    thirdPlace: { count: 0, description: "Top 3 (posições 1-3)" },
    winner: { count: 0, description: "Campeão (posição 1)" }
  };
  
  // Count tournaments by phase
  for (const tournament of validTournaments) {
    const position = Number(tournament.posicao);
    const entries = tournament.entradas;
    
    // Check for winner and top3 positions first
    if (position === 1) {
      phases.winner.count++;
    }
    
    if (position <= 3) {
      phases.thirdPlace.count++;
    }
    
    // Then check for other elimination phases
    const percentile = (position / entries) * 100;
    
    if (percentile <= 15) {
      phases.finalTable.count++;
    } else if (percentile <= 50) {
      phases.late.count++;
    } else if (percentile <= 85) {
      phases.middle.count++;
    } else {
      phases.early.count++;
    }
  }
  
  // Calculate percentages
  const overallPhases = Object.entries(phases).reduce((result, [key, data]) => {
    result[key] = {
      ...data,
      percentage: (data.count / validTournaments.length) * 100
    };
    return result;
  }, {} as Record<string, any>);
  
  // First big win period (May 2022 to March 2023)
  const firstPeriodStart = new Date('2022-05-01');
  const firstPeriodEnd = new Date('2023-03-31');
  
  // Second big win period (April 2023 onward)
  const secondPeriodStart = new Date('2023-04-01');
  const secondPeriodEnd = new Date();
  
  // Filter tournaments by period
  const firstPeriodTournaments = validTournaments.filter(t => {
    const date = new Date(t.data);
    return date >= firstPeriodStart && date <= firstPeriodEnd;
  });
  
  const secondPeriodTournaments = validTournaments.filter(t => {
    const date = new Date(t.data);
    return date >= secondPeriodStart && date <= secondPeriodEnd;
  });
  
  // Process each period
  const firstPeriodPhases = processPhases(firstPeriodTournaments);
  const secondPeriodPhases = processPhases(secondPeriodTournaments);
  
  return {
    overall: overallPhases,
    validTournaments: validTournaments.length,
    postBigWins: {
      firstPeriod: {
        phases: firstPeriodPhases,
        validTournaments: firstPeriodTournaments.length,
        startDate: firstPeriodStart,
        endDate: firstPeriodEnd
      },
      secondPeriod: {
        phases: secondPeriodPhases,
        validTournaments: secondPeriodTournaments.length,
        startDate: secondPeriodStart,
        endDate: secondPeriodEnd
      }
    }
  };
}

// Helper function to process phases for a set of tournaments
function processPhases(tournaments: any[]) {
  const phases: Record<string, { count: number, description: string }> = {
    early: { count: 0, description: "Eliminação precoce (85%+ do field)" },
    middle: { count: 0, description: "Fase média (85-50% do field)" },
    late: { count: 0, description: "Fase tardia (50-15% do field)" },
    finalTable: { count: 0, description: "Mesa final (15% do field)" },
    thirdPlace: { count: 0, description: "Top 3 (posições 1-3)" },
    winner: { count: 0, description: "Campeão (posição 1)" }
  };
  
  console.log(`Processing ${tournaments.length} tournaments for phases`);
  
  // Count tournaments by phase
  for (const tournament of tournaments) {
    const position = Number(tournament.posicao);
    const entries = tournament.entradas;
    
    console.log(`Tournament position: ${position}, entries: ${entries}`);
    
    // Check for top positions
    if (position === 1) {
      phases.winner.count++;
      console.log("Counted as Winner");
    }
    
    if (position <= 3) {
      phases.thirdPlace.count++;
      console.log("Counted as Top 3");
    }
    
    // Calculate percentile for regular phases
    if (entries > 0) {
      const percentile = (position / entries) * 100;
      
      if (percentile <= 15) {
        phases.finalTable.count++;
        console.log("Counted as Final Table");
      } else if (percentile <= 50) {
        phases.late.count++;
        console.log("Counted as Late Phase");
      } else if (percentile <= 85) {
        phases.middle.count++;
        console.log("Counted as Middle Phase");
      } else {
        phases.early.count++;
        console.log("Counted as Early Phase");
      }
    } else {
      console.log("Invalid entries value (zero or undefined)");
    }
  }
  
  // Calculate percentages
  return Object.entries(phases).reduce((result, [key, data]) => {
    const percentage = tournaments.length > 0 ? (data.count / tournaments.length) * 100 : 0;
    console.log(`${key}: ${data.count} tournaments, ${percentage.toFixed(2)}%`);
    
    result[key] = {
      ...data,
      percentage: percentage
    };
    return result;
  }, {} as Record<string, any>);
}

// Helper function to get formatted month label
function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const monthNames = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];
  
  return `${monthNames[parseInt(month) - 1]}/${year}`;
}

// Tell TypeScript that this is a worker context
export {}; 