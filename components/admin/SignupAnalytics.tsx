"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { TrendingUp, Users, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalUsers: number;
  byProvider: {
    google: number;
    password: number;
    phone: number;
    other: number;
  };
  byMonth: Array<{
    month: string;
    google: number;
    password: number;
    phone: number;
    total: number;
  }>;
  recentSignups: number;
  growthRate: number;
}

const COLORS = {
  google: "#4285F4",
  password: "#34A853",
  phone: "#9333EA",
  other: "#9CA3AF",
};

export default function SignupAnalytics() {
  const t = useTranslations("admin.signupAnalytics");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/signups?timeRange=${timeRange}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardDescription>Loading...</CardDescription>
              <CardTitle className="text-2xl">--</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  const pieData = [
    { name: "Google", value: data.byProvider.google, color: COLORS.google },
    { name: "Password", value: data.byProvider.password, color: COLORS.password },
    { name: "Phone", value: data.byProvider.phone, color: COLORS.phone },
    { name: "Other", value: data.byProvider.other, color: COLORS.other },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t("totalUsers")}
            </CardDescription>
            <CardTitle className="text-3xl">{data.totalUsers}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t("last30Days")}
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {data.recentSignups}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t("growthRate")}
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {data.growthRate > 0 ? "+" : ""}
              {data.growthRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("topProvider")}</CardDescription>
            <CardTitle className="text-2xl" style={{ color: COLORS.google }}>
              Google ({data.byProvider.google})
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Provider Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>{t("providerDistribution")}</CardTitle>
            <CardDescription>{t("providerDistributionDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Provider Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>{t("providerBreakdown")}</CardTitle>
            <CardDescription>{t("providerBreakdownDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Signups Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>{t("signupsOverTime")}</CardTitle>
          <CardDescription>{t("signupsOverTimeDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data.byMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="google"
                stroke={COLORS.google}
                strokeWidth={2}
                name="Google"
              />
              <Line
                type="monotone"
                dataKey="password"
                stroke={COLORS.password}
                strokeWidth={2}
                name="Password"
              />
              <Line
                type="monotone"
                dataKey="phone"
                stroke={COLORS.phone}
                strokeWidth={2}
                name="Phone"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#000000"
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Total"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
