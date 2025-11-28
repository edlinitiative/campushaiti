"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface FunnelData {
  status: string;
  count: number;
  percentage: number;
}

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  in_review: "In Review",
  missing_docs: "Missing Docs",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  new: "#f97316",
  in_review: "#3b82f6",
  missing_docs: "#f59e0b",
  interview: "#8b5cf6",
  accepted: "#22c55e",
  rejected: "#ef4444",
};

export default function ApplicationFunnel() {
  const [data, setData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFunnel() {
      try {
        const res = await fetch("/api/uni/analytics/funnel");
        if (!res.ok) throw new Error("Failed to fetch funnel data");
        const json = await res.json();
        
        const formattedData = json.funnel.map((item: FunnelData) => ({
          ...item,
          label: STATUS_LABELS[item.status] || item.status,
        }));
        
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching funnel data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFunnel();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
          <CardDescription>Loading funnel data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Pipeline</CardTitle>
          <CardDescription>No applications yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Pipeline</CardTitle>
        <CardDescription>Distribution of applications by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{data.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {data.count} applications ({data.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || "#94a3b8"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
