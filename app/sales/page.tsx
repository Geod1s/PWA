// app/sales/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import TopNav from "@/components/TopNav";

type Sale = {
  id: string;
  total_cents: number;
  discount_cents: number;
  created_at: string;
  payment_method: string;
};

export default function SalesPage() {
  const supabase = createClientComponentClient();
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("sales")
        .select("id, total_cents, discount_cents, created_at, payment_method")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) setSales(data as Sale[]);
    };
    load();
  }, [supabase]);

  const totalRevenue = sales.reduce(
    (sum, s) => sum + s.total_cents,
    0
  );

  return (
    <>
    <TopNav />
    
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Recent Sales</h1>
      <p className="font-medium">
        Total (last {sales.length} sales): {(totalRevenue / 100).toFixed(2)}
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Time</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Discount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                {new Date(s.created_at).toLocaleString()}
              </TableCell>
              <TableCell>{s.payment_method}</TableCell>
              <TableCell>{(s.total_cents / 100).toFixed(2)}</TableCell>
              <TableCell>
                {s.discount_cents ? (s.discount_cents / 100).toFixed(2) : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
          </>
  );
}
