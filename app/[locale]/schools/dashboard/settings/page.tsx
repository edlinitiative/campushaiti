"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function SchoolSettingsPage() {
  const t = useTranslations("schools.settings");
  const [demoMode] = useState(true); // Demo mode until API is implemented
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const [universityInfo, setUniversityInfo] = useState({
    name: "Université d'État d'Haïti",
    slug: "ueh",
    city: "Port-au-Prince",
    country: "Haiti",
    contactEmail: "admissions@ueh.edu.ht",
    contactPhone: "+509 1234 5678",
    websiteUrl: "https://www.ueh.edu.ht",
    description: "Leading public university in Haiti",
  });

  const [bankAccount, setBankAccount] = useState({
    accountName: "",
    accountNumber: "",
    bankName: "",
    routingNumber: "",
    swiftCode: "",
  });

  const [stripeConnected, setStripeConnected] = useState(false);
  const [monCashConnected, setMonCashConnected] = useState(false);

  const handleSaveUniversity = async () => {
    setSaving(true);
    try {
      // Save to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock
      setSuccess("University information updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBankAccount = async () => {
    setSaving(true);
    try {
      // Save to Firestore
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock
      setSuccess("Bank account information saved");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = () => {
    // Redirect to Stripe Connect OAuth
    window.open("https://connect.stripe.com/oauth/authorize?...", "_blank");
  };

  const handleConnectMonCash = () => {
    // Show MonCash connection dialog
    alert("MonCash integration coming soon!");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Demo Mode Alert */}
      {demoMode && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">{t("demoMode")}</h3>
              <p className="text-sm text-amber-800 mb-2">
                {t("demoModeMessage")}{' '}
                <Link href="/auth/signin" className="underline font-medium">{t("signIn")}</Link>
                {' '}{t("or")}{' '}
                <Link href="/schools/register" className="underline font-medium">{t("registerInstitution")}</Link>
                {' '}{t("toManageSettings")}
              </p>
              <p className="text-xs text-amber-700">
                {t("demoModeDescription")}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("manageSettings")}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/schools/dashboard">← {t("dashboard")}</Link>
        </Button>
      </div>

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          {success}
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">{t("profileTab")}</TabsTrigger>
          <TabsTrigger value="payments">{t("paymentsTab")}</TabsTrigger>
          <TabsTrigger value="team">{t("teamTab")}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t("universityInformation")}</CardTitle>
              <CardDescription>
                {t("updatePublicInfo")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("universityName")}</Label>
                  <Input
                    id="name"
                    value={universityInfo.name}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">{t("slug")}</Label>
                  <Input
                    id="slug"
                    value={universityInfo.slug}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, slug: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">{t("slugHelp")}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("city")}</Label>
                  <Input
                    id="city"
                    value={universityInfo.city}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">{t("country")}</Label>
                  <Input
                    id="country"
                    value={universityInfo.country}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  value={universityInfo.description}
                  onChange={(e) => setUniversityInfo({ ...universityInfo, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">{t("websiteUrl")}</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={universityInfo.websiteUrl}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, websiteUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">{t("contactEmail")}</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={universityInfo.contactEmail}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">{t("contactPhone")}</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={universityInfo.contactPhone}
                  onChange={(e) => setUniversityInfo({ ...universityInfo, contactPhone: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveUniversity} disabled={saving}>
                  {saving ? t("saving") : t("saveChanges")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          {/* Bank Account */}
          <Card>
            <CardHeader>
              <CardTitle>{t("bankAccount")}</CardTitle>
              <CardDescription>
                {t("bankAccountDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">{t("accountName")}</Label>
                  <Input
                    id="accountName"
                    value={bankAccount.accountName}
                    onChange={(e) => setBankAccount({ ...bankAccount, accountName: e.target.value })}
                    placeholder="University Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">{t("bankName")}</Label>
                  <Input
                    id="bankName"
                    value={bankAccount.bankName}
                    onChange={(e) => setBankAccount({ ...bankAccount, bankName: e.target.value })}
                    placeholder="Banque de l'Union Haïtienne"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">{t("accountNumber")}</Label>
                  <Input
                    id="accountNumber"
                    value={bankAccount.accountNumber}
                    onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                    placeholder="123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">{t("routingNumber")}</Label>
                  <Input
                    id="routingNumber"
                    value={bankAccount.routingNumber}
                    onChange={(e) => setBankAccount({ ...bankAccount, routingNumber: e.target.value })}
                    placeholder="987654321"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="swiftCode">{t("swiftCode")}</Label>
                <Input
                  id="swiftCode"
                  value={bankAccount.swiftCode}
                  onChange={(e) => setBankAccount({ ...bankAccount, swiftCode: e.target.value })}
                  placeholder="BUXHHTHH"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBankAccount} disabled={saving}>
                  {saving ? t("saving") : t("saveBankAccount")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Connect */}
          <Card>
            <CardHeader>
              <CardTitle>{t("stripeConnect")}</CardTitle>
              <CardDescription>
                {t("stripeDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stripeConnected ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">{t("connected")}</Badge>
                    <span className="text-sm">{t("stripeConnectedMessage")}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    {t("disconnect")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t("stripeExplanation")}
                  </p>
                  <Button onClick={handleConnectStripe}>
                    {t("connectStripe")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MonCash */}
          <Card>
            <CardHeader>
              <CardTitle>{t("monCash")}</CardTitle>
              <CardDescription>
                {t("monCashDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monCashConnected ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">{t("connected")}</Badge>
                    <span className="text-sm">{t("monCashConnectedMessage")}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    {t("disconnect")}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t("monCashExplanation")}
                  </p>
                  <Button onClick={handleConnectMonCash} variant="outline">
                    {t("connectMonCash")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>{t("teamMembers")}</CardTitle>
              <CardDescription>
                {t("manageTeam")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">admin@ueh.edu.ht</p>
                    <p className="text-sm text-muted-foreground">{t("administrator")}</p>
                  </div>
                  <Badge>{t("owner")}</Badge>
                </div>

                <Button variant="outline" className="w-full">
                  {t("inviteTeamMember")}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t("teamMemberPermissions")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
