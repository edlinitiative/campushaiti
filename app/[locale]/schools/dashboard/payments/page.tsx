/**
 * Payments Page
 * Track and manage application payments
 */

import { headers } from "next/headers";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { PaymentTable } from "@/components/uni/PaymentTable";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PaymentsPage() {
  const headersList = headers();
  const schoolSlug = headersList.get("x-school-slug");

  if (!schoolSlug) {
    return notFound();
  }

  const db = getAdminDb();

  // Get university
  const universitiesSnapshot = await db
    .collection("universities")
    .where("slug", "==", schoolSlug)
    .limit(1)
    .get();

  if (universitiesSnapshot.empty) {
    return notFound();
  }

  const universityId = universitiesSnapshot.docs[0].id;

  // Get payments for this university
  const paymentsSnapshot = await db
    .collection("payments")
    .where("universityId", "==", universityId)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const payments = paymentsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Calculate stats
  const totalAmount = payments.reduce((sum, p: any) => sum + (p.amount || 0), 0);
  const paidAmount = payments
    .filter((p: any) => p.status === "paid")
    .reduce((sum, p: any) => sum + (p.amount || 0), 0);
  const pendingAmount = payments
    .filter((p: any) => p.status === "pending")
    .reduce((sum, p: any) => sum + (p.amount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/schools/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <p className="text-gray-500 mt-1">
            Track application fees and payments
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
          <p className="text-2xl font-bold">
            ${(totalAmount / 100).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500 mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            ${(paidAmount / 100).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-600">
            ${(pendingAmount / 100).toFixed(2)}
          </p>
        </div>
      </div>

      <PaymentTable payments={payments} universityId={universityId} />
    </div>
  );
}
