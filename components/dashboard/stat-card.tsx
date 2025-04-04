import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
}

export function StatCard({ title, value, description, icon: Icon }: StatCardProps) {
  // Check if the value contains a minus sign to determine if it's negative
  const isNegative = value.includes('-')
  
  return (
    <Card className="card-hover-effect border-border/40 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1">
            <div className="text-xl font-medium text-muted-foreground">{title}</div>
            <div className={`text-2xl font-bold ${isNegative ? 'text-destructive' : 'text-steelersGold'} font-mono mt-1`}>
              {value}
            </div>
            <div className="text-xs text-muted-foreground mt-1">{description}</div>
          </div>
          <div className="bg-steelersGold/10 p-2 rounded-full">
            <Icon className="h-5 w-5 text-steelersGold" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

