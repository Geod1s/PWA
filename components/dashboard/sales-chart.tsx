"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface SalesChartProps {
  storeId: string
  dateRange: {
    from: Date
    to: Date
  }
}

export function SalesChart({ storeId, dateRange }: SalesChartProps) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const fromDate = dateRange.from.toISOString().split("T")[0]
        const toDate = dateRange.to.toISOString().split("T")[0]

        const { data: analyticsData } = await supabase
          .from("daily_analytics")
          .select("date, total_sales, total_transactions, total_items_sold")
          .eq("store_id", storeId)
          .gte("date", fromDate)
          .lte("date", toDate)
          .order("date", { ascending: true })

        const chartData =
          analyticsData?.map((d) => ({
            date: new Date(d.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            sales: Number.parseFloat(d.total_sales),
            transactions: d.total_transactions,
            items: d.total_items_sold,
          })) || []

        setData(chartData)
      } catch (error) {
        console.error("Failed to fetch chart data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [storeId, dateRange, supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">Loading chart...</div>
        ) : data.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available for this date range
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" />
              <YAxis stroke="var(--muted-foreground)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: `1px solid var(--border)`,
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                name="Sales ($)"
              />
              <Line
                type="monotone"
                dataKey="transactions"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={false}
                name="Transactions"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
