"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown } from "lucide-react";

interface ProgramStat {
  programId: string;
  programName: string;
  applications: number;
  accepted: number;
  rejected: number;
  acceptanceRate: number;
}

type SortField = "programName" | "applications" | "accepted" | "rejected" | "acceptanceRate";
type SortDirection = "asc" | "desc";

export default function ProgramPerformance() {
  const [data, setData] = useState<ProgramStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("applications");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await fetch("/api/uni/analytics/programs");
        if (!res.ok) throw new Error("Failed to fetch program stats");
        const json = await res.json();
        setData(json.programs);
      } catch (error) {
        console.error("Error fetching program stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * modifier;
    }
    return ((aVal as number) - (bVal as number)) * modifier;
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Program Performance</CardTitle>
          <CardDescription>Loading program statistics...</CardDescription>
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
          <CardTitle>Program Performance</CardTitle>
          <CardDescription>No programs yet</CardDescription>
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
        <CardTitle>Program Performance</CardTitle>
        <CardDescription>Application statistics by program</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  onClick={() => handleSort("programName")}
                  className="flex items-center gap-1 font-semibold hover:text-foreground transition-colors"
                >
                  Program
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("applications")}
                  className="flex items-center gap-1 ml-auto font-semibold hover:text-foreground transition-colors"
                >
                  Applications
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("accepted")}
                  className="flex items-center gap-1 ml-auto font-semibold hover:text-foreground transition-colors"
                >
                  Accepted
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("rejected")}
                  className="flex items-center gap-1 ml-auto font-semibold hover:text-foreground transition-colors"
                >
                  Rejected
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => handleSort("acceptanceRate")}
                  className="flex items-center gap-1 ml-auto font-semibold hover:text-foreground transition-colors"
                >
                  Acceptance Rate
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((program) => (
              <TableRow key={program.programId}>
                <TableCell className="font-medium">{program.programName}</TableCell>
                <TableCell className="text-right">{program.applications}</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {program.accepted}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    {program.rejected}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Badge
                    variant="outline"
                    className={
                      program.acceptanceRate >= 50
                        ? "bg-green-50 text-green-700 border-green-200"
                        : program.acceptanceRate >= 30
                        ? "bg-orange-50 text-orange-700 border-orange-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {program.acceptanceRate}%
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
