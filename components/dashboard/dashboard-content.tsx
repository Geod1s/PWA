"use client"

import { useState } from "react"
import { DashboardKPIs } from "./dashboard-kpis"
import { SalesChart } from "./sales-chart"
import { RecentTransactions } from "./recent-transactions"
import { DateRangeFilter } from "./date-range-filter"

interface DashboardContentProps {
  storeId: string
  todayAnalytics: any
  recentTransactions: any[]
}

export function DashboardContent({ storeId, todayAnalytics, recentTransactions }: DashboardContentProps) {
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
    to: new Date(),
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time sales and store analytics</p>
        </div>
        <DateRangeFilter dateRange={dateRange} onDateChange={setDateRange} />
      </div>

      <DashboardKPIs storeId={storeId} todayAnalytics={todayAnalytics} dateRange={dateRange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart storeId={storeId} dateRange={dateRange} />
        </div>
        <div>
          <RecentTransactions transactions={recentTransactions} />
        </div>
      </div>
    </div>
  )
}
