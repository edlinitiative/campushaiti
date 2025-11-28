/**
 * Payment Table Component
 * Display and manage payments with filters and export
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Search, DollarSign } from "lucide-react";
import { PaymentStatus, PaymentMethod } from "@/lib/types/uni";
import { generateCSV, downloadCSV, formatTimestampForCSV } from "@/lib/utils/csv-export";

interface PaymentTableProps {
  payments: any[];
  universityId: string;
}

const STATUS_COLORS: Record<PaymentStatus, string> = {
  unpaid: "bg-gray-100 text-gray-800",
  pending: "bg-orange-100 text-orange-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

export function PaymentTable({ payments: initialPayments, universityId }: PaymentTableProps) {
  const [payments, setPayments] = useState(initialPayments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      !search ||
      payment.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      payment.programName?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleUpdateStatus = async (paymentId: string, status: PaymentStatus) => {
    setUpdating(paymentId);
    try {
      const response = await fetch(`/api/uni/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const updated = await response.json();
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, ...updated } : p))
        );
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment status");
    } finally {
      setUpdating(null);
    }
  };

  const handleExport = () => {
    const csv = generateCSV(filteredPayments, [
      { key: "studentName", header: "Student Name" },
      { key: "studentEmail", header: "Email" },
      { key: "programName", header: "Program" },
      {
        key: "amount",
        header: "Amount",
        formatter: (value: any, row: any) => `${row.currency || "USD"} ${(value / 100).toFixed(2)}`,
      },
      { key: "status", header: "Status" },
      { key: "method", header: "Payment Method" },
      {
        key: "createdAt",
        header: "Created Date",
        formatter: (value: any) => formatTimestampForCSV(value),
      },
      {
        key: "paidAt",
        header: "Paid Date",
        formatter: (value: any) => formatTimestampForCSV(value),
      },
    ]);

    downloadCSV(csv, `payments-${new Date().toISOString().split("T")[0]}.csv`);
  };

  if (initialPayments.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
            <p className="text-gray-500">
              Payment records will appear here once applications are submitted
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search student or program..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All methods</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="moncash">MonCash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExport} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredPayments.length} Payment{filteredPayments.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Program
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-sm">{payment.studentName}</p>
                        <p className="text-xs text-gray-500">{payment.studentEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{payment.programName}</td>
                    <td className="py-3 px-4 text-sm font-medium">
                      {payment.currency || "USD"} ${(payment.amount / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm capitalize">
                      {payment.method?.replace("_", " ")}
                    </td>
                    <td className="py-3 px-4">
                      <Badge className={STATUS_COLORS[payment.status as PaymentStatus]}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {payment.createdAt?.toDate
                        ? payment.createdAt.toDate().toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {payment.status !== "paid" && payment.status !== "refunded" && (
                        <Select
                          value={payment.status}
                          onValueChange={(status) =>
                            handleUpdateStatus(payment.id, status as PaymentStatus)
                          }
                          disabled={updating === payment.id}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unpaid">Unpaid</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
