"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, TrendingUp, CreditCard } from "lucide-react";

interface PaymentStat {
  total: number;
  thisMonth: number;
  lastMonth: number;
  currency: string;
}

export default function AdminPaymentsPage() {
  const t = useTranslations("admin.payments");
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [stats, setStats] = useState<PaymentStat>({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    currency: "HTG",
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setDemoMode(false);
      } else {
        // Demo mode
        setDemoMode(true);
        setStats({
          total: 2450000,
          thisMonth: 450000,
          lastMonth: 380000,
          currency: "HTG",
        });
      }
    } catch (err) {
      console.error("Error loading payments:", err);
      setDemoMode(true);
      setStats({
        total: 2450000,
        thisMonth: 450000,
        lastMonth: 380000,
        currency: "HTG",
      });
    } finally {
      setLoading(false);
    }
  };

  const growthRate = stats.lastMonth > 0
    ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth * 100).toFixed(1)
    : "0";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>{t("loadingPayment")}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {demoMode && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">{t("demoMode")}</h3>
              <p className="text-sm text-amber-800">
                {t("demoModeMessage")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("backToDashboard")}
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("totalRevenue")}</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              {(stats.total / 100).toLocaleString()} {stats.currency}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("allTimeApplicationFees")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("thisMonth")}</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {(stats.thisMonth / 100).toLocaleString()} {stats.currency}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-xs text-green-600 font-medium">
                {t("growthFromLastMonth", { rate: growthRate })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("lastMonth")}</CardDescription>
            <CardTitle className="text-3xl text-muted-foreground">
              {(stats.lastMonth / 100).toLocaleString()} {stats.currency}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{t("previousMonthRevenue")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t("paymentMethods")}</CardTitle>
          <CardDescription>{t("paymentMethodsDistribution")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{t("stripe")}</span>
                </div>
                <span className="text-sm text-muted-foreground">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">{t("moncash")}</span>
                </div>
                <span className="text-sm text-muted-foreground">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: "35%" }}></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by University */}
      <Card>
        <CardHeader>
          <CardTitle>{t("topUniversitiesByRevenue")}</CardTitle>
          <CardDescription>{t("revenuePerInstitution")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Université d'État d'Haïti", revenue: 950000, count: 89 },
              { name: "Université Quisqueya", revenue: 720000, count: 67 },
              { name: "Université Notre Dame d'Haïti", revenue: 480000, count: 45 },
              { name: "CTPEA", revenue: 300000, count: 33 },
            ].map((uni, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{uni.name}</p>
                  <p className="text-sm text-muted-foreground">{uni.count} {t("applications")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {(uni.revenue / 100).toLocaleString()} {stats.currency}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">{t("paymentPlatformIntegration")}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <p className="mb-2">{t("acceptsPaymentsThrough")}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>{t("stripe")}</strong> - {t("stripeDescription")}</li>
            <li><strong>{t("moncash")}</strong> - {t("moncashDescription")}</li>
          </ul>
          <p className="mt-3 text-xs text-blue-700">
            {t("secureTransactions")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
