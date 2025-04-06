import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Badge } from "@/components/ui/badge";

interface PlayerSummaryCardProps {
  totalTournaments: number;
  totalEntries: number;
  totalProfit: number;
  avgStake: number;
  totalROI: number;
  avgROI: number;
  avgITM: number;
  startDate: string;
  endDate: string;
  ability?: number;
  finalTables?: number;
  earlyFinishes?: string;
  lateFinishes?: string;
  profitPerHour?: number;
  avgProfit?: number;
  avgEntrants?: number;
  period134k: {
    tournaments: number;
    entries: number;
    profit: number;
    roi: number;
    avgTournamentsPerMonth: number;
    ability?: number;
    finalTables?: number;
    earlyFinishes?: string;
    lateFinishes?: string;
    profitPerHour?: number | string;
    avgProfit?: number | string;
    avgEntrants?: number;
    avgStake?: number | string;
    itm?: string;
    avgROI?: number;
  };
  periodBSOP: {
    tournaments: number;
    entries: number;
    profit: number;
    roi: number;
    avgTournamentsPerMonth: number;
    ability?: number;
    finalTables?: number;
    earlyFinishes?: string;
    lateFinishes?: string;
    profitPerHour?: number | string;
    avgProfit?: number | string;
    avgEntrants?: number;
    avgStake?: number | string;
    itm?: string;
    avgROI?: number;
  };
}

const calculateMonthsBetween = (start: string, end: string) => {
  // Format is MM/DD/YYYY
  const [startMonth, startDay, startYear] = start.split('/').map(Number);
  const [endMonth, endDay, endYear] = end.split('/').map(Number);
  
  return (endYear - startYear) * 12 + (endMonth - startMonth);
};

// Function to format numbers consistently across server and client
const formatNumber = (num: number): string => {
  // Use a fixed locale and formatting options
  return num.toLocaleString('en-US');
};

// Helper to safely parse string values to numbers
const safeParseNumber = (value: string | number | undefined): number => {
  if (typeof value === 'undefined') return 0;
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
};

export function PlayerSummaryCard({
  totalTournaments,
  totalEntries,
  totalProfit,
  avgStake,
  totalROI,
  avgROI,
  avgITM,
  startDate,
  endDate,
  ability,
  finalTables,
  earlyFinishes,
  lateFinishes,
  profitPerHour,
  avgProfit,
  avgEntrants,
  period134k,
  periodBSOP
}: PlayerSummaryCardProps) {
  // Calculate months between September 2021 and March 2025
  const monthsTotal = calculateMonthsBetween("09/15/2021", "03/31/2025");
  const avgTournamentsPerMonth = totalTournaments / monthsTotal;
  
  // Define CSS classes for the Steelers theme
  const steelersHeaderClass = "bg-[#141414] text-[#FFB612] rounded-t-lg";
  const steelersBadgeClass = "bg-[#FFB612] text-[#141414] hover:bg-[#FFB612]";
  const steelersGeneralBadgeClass = "bg-[#141414] text-[#FFB612] hover:bg-[#141414] border-[#FFB612]";
  const steelers134kBadgeClass = "bg-[#7C4B96] text-white hover:bg-[#7C4B96]"; // Purple for 134k
  const steelersBSOPBadgeClass = "bg-[#004D40] text-white hover:bg-[#004D40]"; // Dark teal for BSOP
  const steelersCardClass = "border-[#FFB612] border-2 bg-transparent";
  const positiveClass = "text-[#FFB612] font-medium";
  const negativeClass = "text-red-500 font-medium";
  
  const renderComparisonArrow = (value: number, benchmark: number) => {
    if (value > benchmark) return <span className={positiveClass}> ↑</span>;
    if (value < benchmark) return <span className={negativeClass}> ↓</span>;
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-[#FFB612]">Dashboard de Performance</h1>
        <p className="text-gray-300">Análise comparativa detalhada do jogador entre períodos chave</p>
      </div>
      
      {/* Period cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* General Period Card */}
        <Card className={steelersCardClass}>
          <CardHeader className={steelersHeaderClass}>
            <CardTitle className="flex justify-between items-center">
              <span>Período Geral</span>
              <Badge className={steelersGeneralBadgeClass}>
                {formatDateRange(startDate)} - {formatDateRange(endDate)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#FFB612] mb-2">Volume</h3>
                <div className="space-y-3">
                  <MetricItem label="Torneios" value={formatNumber(totalTournaments)} />
                  <MetricItem label="Entradas" value={formatNumber(totalEntries)} />
                  <MetricItem label="Média Mensal" value={formatNumber(Math.round(avgTournamentsPerMonth))} />
                  <MetricItem label="Entradas/Torneio" value={(totalEntries / totalTournaments).toFixed(2)} />
                  <MetricItem label="Entrants Médio" value={avgEntrants ? formatNumber(avgEntrants) : "N/A"} />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-[#FFB612] mb-2">Resultados</h3>
                <div className="space-y-3">
                  <MetricItem 
                    label="Profit" 
                    value={formatCurrency(totalProfit)} 
                    valueClass={totalProfit >= 0 ? positiveClass : negativeClass}
                  />
                  <MetricItem 
                    label="ROI" 
                    value={formatPercentage(totalROI)} 
                    valueClass={totalROI >= 0 ? positiveClass : negativeClass}
                  />
                  <MetricItem 
                    label="ROI Médio" 
                    value={formatPercentage(avgROI)} 
                    valueClass={avgROI >= 0 ? positiveClass : negativeClass}
                  />
                  <MetricItem label="ITM" value={formatPercentage(avgITM)} />
                  <MetricItem label="Buy-in Médio" value={formatCurrency(avgStake)} />
                  <MetricItem 
                    label="Profit/Torneio" 
                    value={avgProfit ? formatCurrency(avgProfit) : "N/A"} 
                    valueClass={avgProfit && avgProfit >= 0 ? positiveClass : negativeClass}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#FFB612] mb-2">Métricas Avançadas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <MetricItem label="Ability Score" value={ability ? `${ability}/100` : "N/A"} />
                  <MetricItem label="Mesas Finais" value={finalTables ? formatNumber(finalTables) : "N/A"} />
                  <MetricItem label="Profit/Hora" value={profitPerHour ? formatCurrency(profitPerHour) : "N/A"} />
                </div>
                <div className="space-y-3">
                  <MetricItem label="Early Finishes" value={earlyFinishes || "N/A"} />
                  <MetricItem label="Late Finishes" value={lateFinishes || "N/A"} />
                  <MetricItem label="Total Investido" value={formatCurrency(avgStake * totalEntries)} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Post $134k Period Card */}
        <Card className={steelersCardClass}>
          <CardHeader className={steelersHeaderClass}>
            <CardTitle className="flex justify-between items-center">
              <span>Pós $134k</span>
              <Badge className={steelers134kBadgeClass}>
                Mai-Nov 2022
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#FFB612] mb-2">Volume</h3>
                <div className="space-y-3">
                  <MetricItem 
                    label="Torneios" 
                    value={formatNumber(period134k.tournaments)} 
                   
                  />
                  <MetricItem 
                    label="Entradas" 
                    value={formatNumber(period134k.entries)} 
                  
                  />
                  <MetricItem 
                    label="Média Mensal" 
                    value={formatNumber(Math.round(period134k.avgTournamentsPerMonth))} 
                    comparison={renderComparisonArrow(period134k.avgTournamentsPerMonth, avgTournamentsPerMonth)}
                  />
                  <MetricItem 
                    label="Entradas/Torneio" 
                    value={(period134k.entries / period134k.tournaments).toFixed(2)} 
                    comparison={renderComparisonArrow(
                      period134k.entries / period134k.tournaments, 
                      totalEntries / totalTournaments
                    )}
                  />
                  <MetricItem 
                    label="Entrants Médio" 
                    value={period134k.avgEntrants ? formatNumber(period134k.avgEntrants) : "N/A"}
                    comparison={avgEntrants && period134k.avgEntrants ? 
                      renderComparisonArrow(period134k.avgEntrants, avgEntrants) : null}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-[#FFB612] mb-2">Resultados</h3>
                <div className="space-y-3">
                  <MetricItem 
                    label="Profit" 
                    value={formatCurrency(period134k.profit)} 
                    valueClass={period134k.profit >= 0 ? positiveClass : negativeClass}
                  />
                  <MetricItem 
                    label="ROI" 
                    value={formatPercentage(period134k.roi)} 
                    valueClass={period134k.roi >= 0 ? positiveClass : negativeClass}
                    comparison={renderComparisonArrow(period134k.roi, totalROI)}
                  />
                  <MetricItem 
                    label="ROI Médio" 
                    value={period134k.avgROI ? formatPercentage(period134k.avgROI) : "N/A"}
                    valueClass={period134k.avgROI && period134k.avgROI >= 0 ? positiveClass : negativeClass}
                    comparison={period134k.avgROI ? renderComparisonArrow(period134k.avgROI, avgROI) : null}
                  />
                  <MetricItem 
                    label="ITM" 
                    value={period134k.itm || "N/A"} 
                    comparison={period134k.itm ? 
                      renderComparisonArrow(
                        parseFloat(period134k.itm.replace('%', '')), 
                        avgITM
                      ) : null}
                  />
                  <MetricItem 
                    label="Buy-in Médio" 
                    value={typeof period134k.avgStake === 'number' ? 
                      formatCurrency(period134k.avgStake) : 
                      (period134k.avgStake || "N/A")}
                    comparison={typeof period134k.avgStake === 'number' && avgStake ? 
                      renderComparisonArrow(period134k.avgStake, avgStake) : null}
                  />
                  <MetricItem 
                    label="Profit/Torneio" 
                    value={period134k.avgProfit ? 
                      (typeof period134k.avgProfit === 'number' ? 
                        formatCurrency(period134k.avgProfit) : 
                        period134k.avgProfit) : 
                      "N/A"} 
                    valueClass={period134k.avgProfit && 
                      (typeof period134k.avgProfit === 'number' ? 
                        period134k.avgProfit >= 0 : 
                        parseFloat(period134k.avgProfit.toString()) >= 0) ? 
                      positiveClass : negativeClass}
                    comparison={period134k.avgProfit && avgProfit ? 
                      renderComparisonArrow(
                        safeParseNumber(period134k.avgProfit),
                        safeParseNumber(avgProfit)
                      ) : null}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#FFB612] mb-2">Métricas Avançadas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <MetricItem 
                    label="Ability Score" 
                    value={period134k.ability ? `${period134k.ability}/100` : "N/A"} 
                    comparison={period134k.ability && ability ? 
                      renderComparisonArrow(period134k.ability, ability) : null}
                  />
                  <MetricItem 
                    label="Mesas Finais" 
                    value={period134k.finalTables ? formatNumber(period134k.finalTables) : "N/A"}
                    comparison={period134k.finalTables && finalTables ? 
                      renderComparisonArrow(period134k.finalTables, finalTables) : null}
                  />
                  <MetricItem 
                    label="Profit/Hora" 
                    value={period134k.profitPerHour ? 
                      (typeof period134k.profitPerHour === 'number' ? 
                        formatCurrency(period134k.profitPerHour) : 
                        period134k.profitPerHour) : 
                      "N/A"}
                    valueClass={period134k.profitPerHour && 
                      (typeof period134k.profitPerHour === 'number' ? 
                        period134k.profitPerHour >= 0 : 
                        parseFloat(period134k.profitPerHour.toString()) >= 0) ? 
                      positiveClass : negativeClass}
                  />
                </div>
                <div className="space-y-3">
                  <MetricItem 
                    label="Early Finishes" 
                    value={period134k.earlyFinishes || "N/A"} 
                    comparison={period134k.earlyFinishes && earlyFinishes ? 
                      renderComparisonArrow(
                        parseFloat(period134k.earlyFinishes.replace('%', '')), 
                        parseFloat(earlyFinishes.replace('%', ''))
                      ) : null}
                  />
                  <MetricItem 
                    label="Late Finishes" 
                    value={period134k.lateFinishes || "N/A"} 
                    comparison={period134k.lateFinishes && lateFinishes ? 
                      renderComparisonArrow(
                        parseFloat(period134k.lateFinishes.replace('%', '')), 
                        parseFloat(lateFinishes.replace('%', ''))
                      ) : null}
                  />
                  <MetricItem 
                    label="Total Investido" 
                    value={typeof period134k.avgStake === 'number' ? 
                      formatCurrency(period134k.avgStake * period134k.entries) : 
                      "N/A"}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Post BSOP Period Card */}
        <Card className={steelersCardClass}>
          <CardHeader className={steelersHeaderClass}>
            <CardTitle className="flex justify-between items-center">
              <span>Pós BSOP</span>
              <Badge className={steelersBSOPBadgeClass}>
                Abr-Out 2023
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#FFB612] mb-2">Volume</h3>
                <div className="space-y-3">
                  <MetricItem 
                    label="Torneios" 
                    value={formatNumber(periodBSOP.tournaments)} 
                   
                  />
                  <MetricItem 
                    label="Entradas" 
                    value={formatNumber(periodBSOP.entries)} 
                  
                  />
                  <MetricItem 
                    label="Média Mensal" 
                    value={formatNumber(Math.round(periodBSOP.avgTournamentsPerMonth))} 
                    comparison={renderComparisonArrow(periodBSOP.avgTournamentsPerMonth, avgTournamentsPerMonth)}
                  />
                  <MetricItem 
                    label="Entradas/Torneio" 
                    value={(periodBSOP.entries / periodBSOP.tournaments).toFixed(2)} 
                    comparison={renderComparisonArrow(
                      periodBSOP.entries / periodBSOP.tournaments, 
                      totalEntries / totalTournaments
                    )}
                  />
                  <MetricItem 
                    label="Entrants Médio" 
                    value={periodBSOP.avgEntrants ? formatNumber(periodBSOP.avgEntrants) : "N/A"}
                    comparison={avgEntrants && periodBSOP.avgEntrants ? 
                      renderComparisonArrow(periodBSOP.avgEntrants, avgEntrants) : null}
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-[#FFB612] mb-2">Resultados</h3>
                <div className="space-y-3">
                  <MetricItem 
                    label="Profit" 
                    value={formatCurrency(periodBSOP.profit)} 
                    valueClass={periodBSOP.profit >= 0 ? positiveClass : negativeClass}
                  />
                  <MetricItem 
                    label="ROI" 
                    value={formatPercentage(periodBSOP.roi)} 
                    valueClass={periodBSOP.roi >= 0 ? positiveClass : negativeClass}
                    comparison={renderComparisonArrow(periodBSOP.roi, totalROI)}
                  />
                  <MetricItem 
                    label="ROI Médio" 
                    value={periodBSOP.avgROI ? formatPercentage(periodBSOP.avgROI) : "N/A"}
                    valueClass={periodBSOP.avgROI && periodBSOP.avgROI >= 0 ? positiveClass : negativeClass}
                    comparison={periodBSOP.avgROI ? renderComparisonArrow(periodBSOP.avgROI, avgROI) : null}
                  />
                  <MetricItem 
                    label="ITM" 
                    value={periodBSOP.itm || "N/A"} 
                    comparison={periodBSOP.itm ? 
                      renderComparisonArrow(
                        parseFloat(periodBSOP.itm.replace('%', '')), 
                        avgITM
                      ) : null}
                  />
                  <MetricItem 
                    label="Buy-in Médio" 
                    value={typeof periodBSOP.avgStake === 'number' ? 
                      formatCurrency(periodBSOP.avgStake) : 
                      (periodBSOP.avgStake || "N/A")}
                    comparison={typeof periodBSOP.avgStake === 'number' && avgStake ? 
                      renderComparisonArrow(periodBSOP.avgStake, avgStake) : null}
                  />
                  <MetricItem 
                    label="Profit/Torneio" 
                    value={periodBSOP.avgProfit ? 
                      (typeof periodBSOP.avgProfit === 'number' ? 
                        formatCurrency(periodBSOP.avgProfit) : 
                        periodBSOP.avgProfit) : 
                      "N/A"} 
                    valueClass={periodBSOP.avgProfit && 
                      (typeof periodBSOP.avgProfit === 'number' ? 
                        periodBSOP.avgProfit >= 0 : 
                        parseFloat(periodBSOP.avgProfit.toString()) >= 0) ? 
                      positiveClass : negativeClass}
                    comparison={periodBSOP.avgProfit && avgProfit ? 
                      renderComparisonArrow(
                        safeParseNumber(periodBSOP.avgProfit),
                        safeParseNumber(avgProfit)
                      ) : null}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-[#FFB612] mb-2">Métricas Avançadas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <MetricItem 
                    label="Ability Score" 
                    value={periodBSOP.ability ? `${periodBSOP.ability}/100` : "N/A"} 
                    comparison={periodBSOP.ability && ability ? 
                      renderComparisonArrow(periodBSOP.ability, ability) : null}
                  />
                  <MetricItem 
                    label="Mesas Finais" 
                    value={periodBSOP.finalTables ? formatNumber(periodBSOP.finalTables) : "N/A"}
                    comparison={periodBSOP.finalTables && finalTables ? 
                      renderComparisonArrow(periodBSOP.finalTables, finalTables) : null}
                  />
                  <MetricItem 
                    label="Profit/Hora" 
                    value={periodBSOP.profitPerHour ? 
                      (typeof periodBSOP.profitPerHour === 'number' ? 
                        formatCurrency(periodBSOP.profitPerHour) : 
                        periodBSOP.profitPerHour) : 
                      "N/A"}
                    valueClass={periodBSOP.profitPerHour && 
                      (typeof periodBSOP.profitPerHour === 'number' ? 
                        periodBSOP.profitPerHour >= 0 : 
                        parseFloat(periodBSOP.profitPerHour.toString()) >= 0) ? 
                      positiveClass : negativeClass}
                  />
                </div>
                <div className="space-y-3">
                  <MetricItem 
                    label="Early Finishes" 
                    value={periodBSOP.earlyFinishes || "N/A"} 
                    comparison={periodBSOP.earlyFinishes && earlyFinishes ? 
                      renderComparisonArrow(
                        parseFloat(periodBSOP.earlyFinishes.replace('%', '')), 
                        parseFloat(earlyFinishes.replace('%', ''))
                      ) : null}
                  />
                  <MetricItem 
                    label="Late Finishes" 
                    value={periodBSOP.lateFinishes || "N/A"} 
                    comparison={periodBSOP.lateFinishes && lateFinishes ? 
                      renderComparisonArrow(
                        parseFloat(periodBSOP.lateFinishes.replace('%', '')), 
                        parseFloat(lateFinishes.replace('%', ''))
                      ) : null}
                  />
                  <MetricItem 
                    label="Total Investido" 
                    value={typeof periodBSOP.avgStake === 'number' ? 
                      formatCurrency(periodBSOP.avgStake * periodBSOP.entries) : 
                      "N/A"}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Comparison cards */}
      <Card className={steelersCardClass}>
        <CardHeader className={steelersHeaderClass}>
          <CardTitle>Comparativo de Desempenho</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="md:col-span-1 lg:col-span-2">
              <h3 className="text-xl font-bold text-[#FFB612] mb-4">ROI por Período</h3>
              <div className="space-y-4">
                <ProgressBar 
                  label="Geral" 
                  value={totalROI} 
                  color="#FFB612" 
                  badgeClass={steelersGeneralBadgeClass}
                  isPercentage
                />
                <ProgressBar 
                  label="Pós $134k" 
                  value={period134k.roi} 
                  color="#7C4B96" 
                  badgeClass={steelers134kBadgeClass}
                  isPercentage
                />
                <ProgressBar 
                  label="Pós BSOP" 
                  value={periodBSOP.roi} 
                  color="#004D40" 
                  badgeClass={steelersBSOPBadgeClass}
                  isPercentage
                />
              </div>
            </div>
            
            <div className="md:col-span-1 lg:col-span-2">
              <h3 className="text-xl font-bold text-[#FFB612] mb-4">ITM por Período</h3>
              <div className="space-y-4">
                <ProgressBar 
                  label="Geral" 
                  value={avgITM} 
                  maxValue={100} 
                  color="#FFB612" 
                  badgeClass={steelersGeneralBadgeClass}
                  isPercentage
                />
                <ProgressBar 
                  label="Pós $134k" 
                  value={period134k.itm ? parseFloat(period134k.itm.replace('%', '')) : 0} 
                  maxValue={100} 
                  color="#7C4B96" 
                  badgeClass={steelers134kBadgeClass}
                  isPercentage
                />
                <ProgressBar 
                  label="Pós BSOP" 
                  value={periodBSOP.itm ? parseFloat(periodBSOP.itm.replace('%', '')) : 0} 
                  maxValue={100} 
                  color="#004D40" 
                  badgeClass={steelersBSOPBadgeClass}
                  isPercentage
                />
              </div>
            </div>
            
            <div className="md:col-span-1 lg:col-span-2">
              <h3 className="text-xl font-bold text-[#FFB612] mb-4">Ability Score</h3>
              <div className="space-y-4">
                <ProgressBar 
                  label="Geral" 
                  value={ability || 0} 
                  maxValue={100} 
                  color="#FFB612" 
                  badgeClass={steelersGeneralBadgeClass}
                />
                <ProgressBar 
                  label="Pós $134k" 
                  value={period134k.ability || 0} 
                  maxValue={100} 
                  color="#7C4B96" 
                  badgeClass={steelers134kBadgeClass}
                />
                <ProgressBar 
                  label="Pós BSOP" 
                  value={periodBSOP.ability || 0} 
                  maxValue={100} 
                  color="#004D40" 
                  badgeClass={steelersBSOPBadgeClass}
                />
              </div>
            </div>
            
            <div className="md:col-span-1 lg:col-span-2">
              <h3 className="text-xl font-bold text-[#FFB612] mb-4">Early Finishes</h3>
              <div className="space-y-4">
                <ProgressBar 
                  label="Geral" 
                  value={earlyFinishes ? parseFloat(earlyFinishes.replace('%', '')) : 0} 
                  maxValue={50} 
                  color="#FFB612" 
                  badgeClass={steelersGeneralBadgeClass}
                  isPercentage
                />
                <ProgressBar 
                  label="Pós $134k" 
                  value={period134k.earlyFinishes ? parseFloat(period134k.earlyFinishes.replace('%', '')) : 0} 
                  maxValue={50} 
                  color="#7C4B96" 
                  badgeClass={steelers134kBadgeClass}
                  isPercentage
                />
                <ProgressBar 
                  label="Pós BSOP" 
                  value={periodBSOP.earlyFinishes ? parseFloat(periodBSOP.earlyFinishes.replace('%', '')) : 0} 
                  maxValue={50} 
                  color="#004D40" 
                  badgeClass={steelersBSOPBadgeClass}
                  isPercentage
                />
              </div>
            </div>
            
            <div className="md:col-span-1 lg:col-span-2">
              <h3 className="text-xl font-bold text-[#FFB612] mb-4">Late Finishes</h3>
              <div className="space-y-4">
                <ProgressBar 
                  label="Geral" 
                  value={lateFinishes ? parseFloat(lateFinishes.replace('%', '')) : 0} 
                  maxValue={50} 
                  color="#FFB612" 
                  badgeClass={steelersGeneralBadgeClass}
                  isPercentage
                />
                <ProgressBar 
                  label="Pós $134k" 
                  value={period134k.lateFinishes ? parseFloat(period134k.lateFinishes.replace('%', '')) : 0} 
                  maxValue={50} 
                  color="#7C4B96" 
                  badgeClass={steelers134kBadgeClass}
                  isPercentage
                />
                <ProgressBar 
                  label="Pós BSOP" 
                  value={periodBSOP.lateFinishes ? parseFloat(periodBSOP.lateFinishes.replace('%', '')) : 0} 
                  maxValue={50} 
                  color="#004D40" 
                  badgeClass={steelersBSOPBadgeClass}
                  isPercentage
                />
              </div>
            </div>
            
            <div className="md:col-span-1 lg:col-span-2">
              <h3 className="text-xl font-bold text-[#FFB612] mb-4">Profit/Torneio</h3>
              <div className="space-y-4">
                <ProgressBar 
                  label="Geral" 
                  value={avgProfit || 0} 
                  maxValue={10}
                  color="#FFB612" 
                  badgeClass={steelersGeneralBadgeClass}
                  isCurrency
                />
                <ProgressBar 
                  label="Pós $134k" 
                  value={safeParseNumber(period134k.avgProfit)} 
                  maxValue={10}
                  color="#7C4B96" 
                  badgeClass={steelers134kBadgeClass}
                  isCurrency
                />
                <ProgressBar 
                  label="Pós BSOP" 
                  value={safeParseNumber(periodBSOP.avgProfit)} 
                  maxValue={10}
                  color="#004D40" 
                  badgeClass={steelersBSOPBadgeClass}
                  isCurrency
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Metric item component
const MetricItem = ({ 
  label, 
  value, 
  comparison = null, 
  valueClass = "" 
}: { 
  label: string, 
  value: string | number, 
  comparison?: React.ReactNode, 
  valueClass?: string 
}) => (
  <div className="flex justify-between items-center">
    <span className="text-sm text-gray-400">{label}:</span>
    <div className="flex items-center">
      <span className={valueClass || "font-medium"}>{value}</span>
      {comparison && <span className="ml-1">{comparison}</span>}
    </div>
  </div>
);

// Progress bar component
const ProgressBar = ({ 
  label, 
  value, 
  maxValue = 100, 
  color, 
  badgeClass,
  isPercentage = false,
  isCurrency = false
}: { 
  label: string, 
  value: number, 
  maxValue?: number, 
  color: string,
  badgeClass: string,
  isPercentage?: boolean,
  isCurrency?: boolean
}) => {
  const percentage = Math.min(100, (Math.abs(value) / maxValue) * 100);
  let displayValue;
  
  if (isPercentage) {
    displayValue = `${value.toFixed(1)}%`;
  } else if (isCurrency) {
    displayValue = formatCurrency(value);
  } else {
    displayValue = value;
  }
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Badge className={badgeClass}>{label}</Badge>
        <span className={value >= 0 ? "text-[#FFB612] font-medium" : "text-red-500 font-medium"}>
          {displayValue}
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5">
        <div 
          className="h-2.5 rounded-full" 
          style={{ 
            width: `${Math.max(0, percentage)}%`,
            backgroundColor: value >= 0 ? color : '#ef4444',
          }}
        ></div>
      </div>
    </div>
  );
};

// Helper function to format date
const formatDateRange = (date: string): string => {
  if (!date) return '';
  const [month, day, year] = date.split('/');
  return `${day}/${month}/${year}`;
};

export default PlayerSummaryCard; 