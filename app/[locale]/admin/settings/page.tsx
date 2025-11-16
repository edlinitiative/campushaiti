"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Globe, Mail, Bell, Shield, Database } from "lucide-react";

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    platformName: "Campus Haiti",
    supportEmail: "support@campushaiti.org",
    enableRegistrations: true,
    requireEmailVerification: true,
    maintenanceMode: false,
    maxApplicationsPerUser: 10,
    defaultApplicationFee: 5000,
    welcomeMessage: "Welcome to Campus Haiti - Your gateway to higher education in Haiti",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">
            Configure global platform settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <CardTitle>General Settings</CardTitle>
              </div>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformName">Platform Name</Label>
                <Input
                  id="platformName"
                  value={settings.platformName}
                  onChange={(e) => handleChange("platformName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(e) => handleChange("welcomeMessage", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange("supportEmail", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Registration & Access */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <CardTitle>Registration & Access</CardTitle>
              </div>
              <CardDescription>Control user registration and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable New Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to create accounts
                  </p>
                </div>
                <Checkbox
                  checked={settings.enableRegistrations}
                  onCheckedChange={(checked) => handleChange("enableRegistrations", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before applying
                  </p>
                </div>
                <Checkbox
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => handleChange("requireEmailVerification", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Disable platform access for maintenance
                  </p>
                </div>
                <Checkbox
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleChange("maintenanceMode", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Application Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                <CardTitle>Application Settings</CardTitle>
              </div>
              <CardDescription>Configure application limits and defaults</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxApplications">Maximum Applications Per User</Label>
                <Input
                  id="maxApplications"
                  type="number"
                  value={settings.maxApplicationsPerUser}
                  onChange={(e) => handleChange("maxApplicationsPerUser", parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Limit how many programs a student can apply to
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultFee">Default Application Fee (in cents)</Label>
                <Input
                  id="defaultFee"
                  type="number"
                  value={settings.defaultApplicationFee}
                  onChange={(e) => handleChange("defaultApplicationFee", parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Suggested fee amount for new programs (50 HTG = 5000 cents)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-600" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
              <CardDescription>Email notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Email notifications are sent for important events:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>New university registrations</li>
                  <li>Application submissions</li>
                  <li>Application status changes</li>
                  <li>Payment confirmations</li>
                </ul>
                <p className="text-xs">
                  Configure email templates and SMTP settings in your environment variables.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <p className="mb-2">Some settings require environment variables:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><code>FIREBASE_PROJECT_ID</code> - Firebase project configuration</li>
              <li><code>STRIPE_SECRET_KEY</code> - Payment processing</li>
              <li><code>MONCASH_CLIENT_ID</code> - MonCash integration</li>
              <li><code>RESEND_API_KEY</code> - Email delivery</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
