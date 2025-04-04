"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { FilterIcon, RefreshCw } from "lucide-react"
import { DateRange } from "react-day-picker"

interface AdvancedFiltersProps {
  onFilterChange: (filters: any) => void
  tournamentTypes: string[]
  buyInRanges: string[]
}

export function AdvancedFilters({ onFilterChange, tournamentTypes, buyInRanges }: AdvancedFiltersProps) {
  const [tournamentType, setTournamentType] = useState<string>("all")
  const [buyInRange, setBuyInRange] = useState<string>("all")
  const [roiRange, setRoiRange] = useState<[number, number]>([-100, 500])
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  })
  const [onlyProfitable, setOnlyProfitable] = useState<boolean>(false)

  const handleApplyFilters = () => {
    onFilterChange({
      tournamentType: tournamentType === "all" ? null : tournamentType,
      buyInRange: buyInRange === "all" ? null : buyInRange,
      roiRange,
      dateRange,
      onlyProfitable,
    })
  }

  const handleResetFilters = () => {
    setTournamentType("all")
    setBuyInRange("all")
    setRoiRange([-100, 500])
    setDateRange({ from: undefined, to: undefined })
    setOnlyProfitable(false)

    onFilterChange({
      tournamentType: null,
      buyInRange: null,
      roiRange: [-100, 500],
      dateRange: { from: undefined, to: undefined },
      onlyProfitable: false,
    })
  }

  // Handler for slider to ensure correct typing
  const handleRoiChange = (value: number[]) => {
    setRoiRange([value[0], value[1]])
  }

  // Handler for date range to ensure correct typing
  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(range)
  }

  return (
    <Card className="border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <FilterIcon className="mr-2 h-5 w-5" />
          Filtros Avançados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tournament-type">Tipo de Torneio</Label>
            <Select value={tournamentType} onValueChange={setTournamentType}>
              <SelectTrigger id="tournament-type">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {tournamentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === "psko"
                      ? "PSKO (Bounty)"
                      : type === "vanilla"
                        ? "Vanilla (Regulares)"
                        : type === "hyper"
                          ? "Hyper (Rápidos)"
                          : type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyin-range">Faixa de Buy-in</Label>
            <Select value={buyInRange} onValueChange={setBuyInRange}>
              <SelectTrigger id="buyin-range">
                <SelectValue placeholder="Selecione a faixa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {buyInRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>ROI (%)</Label>
          <div className="pt-6 px-2">
            <Slider 
              value={[roiRange[0], roiRange[1]]} 
              min={-100} 
              max={500} 
              step={5} 
              onValueChange={handleRoiChange} 
            />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{roiRange[0]}%</span>
              <span>{roiRange[1]}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Período</Label>
          <DateRangePicker 
            value={dateRange || { from: undefined, to: undefined }} 
            onChange={handleDateChange} 
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="profitable" checked={onlyProfitable} onCheckedChange={setOnlyProfitable} />
          <Label htmlFor="profitable">Apenas torneios lucrativos</Label>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={handleResetFilters}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Resetar
          </Button>
          <Button onClick={handleApplyFilters}>
            <FilterIcon className="mr-2 h-4 w-4" />
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

