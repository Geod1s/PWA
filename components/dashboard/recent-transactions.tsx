"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

interface Transaction {
  id: string
  transaction_number: string
  total: number
  payment_method: string
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
  }
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No transactions yet</p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex justify-between items-start p-2 bg-muted rounded text-sm hover:bg-muted/70 transition"
            >
              <div className="flex-1">
                <div className="font-medium truncate">{tx.transaction_number}</div>
                <div className="text-xs text-muted-foreground">
                  {tx.profiles?.first_name} {tx.profiles?.last_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(tx.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">${tx.total.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">{tx.payment_method}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
