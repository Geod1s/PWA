"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "lucide-react"

interface DateRangeFilterProps {
  dateRange: {
    from: Date
    to: Date
  }
  onDateChange: (range: { from: Date; to: Date }) => void
}

export function DateRangeFilter({ dateRange, onDateChange }: DateRangeFilterProps) {
  const handlePreset = (days: number) => {
    const to = new Date()
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    onDateChange({ from, to })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48">
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start" onClick={() => handlePreset(1)}>
            Today
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handlePreset(7)}>
            Last 7 days
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handlePreset(30)}>
            Last 30 days
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => handlePreset(90)}>
            Last 90 days
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
