"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function SchoolSettingsPage() {
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">University Settings</h1>
          <p className="text-muted-foreground">
            Manage your university profile and payment settings
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/schools/dashboard">← Back to Dashboard</Link>
        </Button>
      </div>

      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          {success}
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">University Profile</TabsTrigger>
          <TabsTrigger value="payments">Payment Settings</TabsTrigger>
          <TabsTrigger value="team">Team Members</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>University Information</CardTitle>
              <CardDescription>
                Update your university&apos;s public information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">University Name *</Label>
                  <Input
                    id="name"
                    value={universityInfo.name}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={universityInfo.slug}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, slug: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={universityInfo.city}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, city: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={universityInfo.country}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, country: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={universityInfo.description}
                  onChange={(e) => setUniversityInfo({ ...universityInfo, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={universityInfo.websiteUrl}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, websiteUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={universityInfo.contactEmail}
                    onChange={(e) => setUniversityInfo({ ...universityInfo, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={universityInfo.contactPhone}
                  onChange={(e) => setUniversityInfo({ ...universityInfo, contactPhone: e.target.value })}
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveUniversity} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
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
              <CardTitle>Bank Account Information</CardTitle>
              <CardDescription>
                Add your bank account to receive direct payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Name *</Label>
                  <Input
                    id="accountName"
                    value={bankAccount.accountName}
                    onChange={(e) => setBankAccount({ ...bankAccount, accountName: e.target.value })}
                    placeholder="University Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name *</Label>
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
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    value={bankAccount.accountNumber}
                    onChange={(e) => setBankAccount({ ...bankAccount, accountNumber: e.target.value })}
                    placeholder="123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number</Label>
                  <Input
                    id="routingNumber"
                    value={bankAccount.routingNumber}
                    onChange={(e) => setBankAccount({ ...bankAccount, routingNumber: e.target.value })}
                    placeholder="987654321"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
                <Input
                  id="swiftCode"
                  value={bankAccount.swiftCode}
                  onChange={(e) => setBankAccount({ ...bankAccount, swiftCode: e.target.value })}
                  placeholder="BUXHHTHH"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveBankAccount} disabled={saving}>
                  {saving ? "Saving..." : "Save Bank Account"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Connect */}
          <Card>
            <CardHeader>
              <CardTitle>Stripe Connect</CardTitle>
              <CardDescription>
                Connect your Stripe account to accept international payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stripeConnected ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">Connected</Badge>
                    <span className="text-sm">Your Stripe account is connected</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect your Stripe account to receive payments via credit card from applicants worldwide.
                    Stripe handles all compliance and transfers funds directly to your bank account.
                  </p>
                  <Button onClick={handleConnectStripe}>
                    Connect with Stripe
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* MonCash */}
          <Card>
            <CardHeader>
              <CardTitle>MonCash Integration</CardTitle>
              <CardDescription>
                Connect MonCash to accept local mobile payments in Haiti
              </CardDescription>
            </CardHeader>
            <CardContent>
              {monCashConnected ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600">Connected</Badge>
                    <span className="text-sm">Your MonCash account is connected</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Connect your MonCash account to accept payments from applicants in Haiti using mobile money.
                  </p>
                  <Button onClick={handleConnectMonCash} variant="outline">
                    Connect with MonCash
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
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage who can access and manage your university account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <p className="font-medium">admin@ueh.edu.ht</p>
                    <p className="text-sm text-muted-foreground">Administrator</p>
                  </div>
                  <Badge>Owner</Badge>
                </div>

                <Button variant="outline" className="w-full">
                  Invite Team Member
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Team members will be able to view applications, manage programs, and configure settings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
