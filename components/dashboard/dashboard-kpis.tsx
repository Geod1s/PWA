"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react"

interface DashboardKPIsProps {
  storeId: string
  todayAnalytics: any
  dateRange: {
    from: Date
    to: Date
  }
}

export function DashboardKPIs({ storeId, todayAnalytics, dateRange }: DashboardKPIsProps) {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayTransactions: 0,
    periodRevenue: 0,
    periodTransactions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const fromDate = dateRange.from.toISOString().split("T")[0]
        const toDate = dateRange.to.toISOString().split("T")[0]

        const { data: analyticsData } = await supabase
          .from("daily_analytics")
          .select("total_sales, total_transactions")
          .eq("store_id", storeId)
          .gte("date", fromDate)
          .lte("date", toDate)

        const periodRevenue = analyticsData?.reduce((sum, d) => sum + (d.total_sales || 0), 0) || 0

        const periodTransactions = analyticsData?.reduce((sum, d) => sum + (d.total_transactions || 0), 0) || 0

        setStats({
          todayRevenue: todayAnalytics?.total_sales || 0,
          todayTransactions: todayAnalytics?.total_transactions || 0,
          periodRevenue,
          periodTransactions,
        })
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [storeId, dateRange, todayAnalytics, supabase])

  const kpis = [
    {
      title: "Today's Revenue",
      value: `$${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Today's Transactions",
      value: stats.todayTransactions.toString(),
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: `Revenue (${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()})`,
      value: `$${stats.periodRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Period Transactions",
      value: stats.periodTransactions.toString(),
      icon: Users,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  <p className="text-2xl font-bold mt-2">{isLoading ? "..." : kpi.value}</p>
                </div>
                <Icon className={`w-6 h-6 ${kpi.color} opacity-75`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
