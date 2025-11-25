import { getServerUser } from "@/lib/auth/server-auth";
import { getAdminDb } from "@/lib/firebase/admin";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin, Calendar, Shield, Key, AlertCircle } from "lucide-react";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Server-side auth check
  const user = await getServerUser();
  if (!user) {
    const signinPath = locale === "en" ? "/auth/signin" : `/${locale}/auth/signin`;
    redirect(signinPath);
  }

  const t = await getTranslations("userDashboard");
  const db = getAdminDb();

  // Fetch user profile data
  let profile: any = null;
  
  try {
    const profileDoc = await db.collection("applicants").doc(user.uid).get();
    if (profileDoc.exists) {
      profile = profileDoc.data();
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={profile?.firstName || ""}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={profile?.lastName || ""}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                defaultValue={profile?.dateOfBirth || ""}
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Phone className="h-10 w-10 p-2 border rounded-md bg-gray-50" />
                <Input
                  id="phone"
                  type="tel"
                  defaultValue={profile?.phone || ""}
                  placeholder="+509 1234 5678"
                  className="flex-1"
                />
              </div>
            </div>

            <p className="text-sm text-amber-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Profile editing functionality coming soon
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Address
            </CardTitle>
            <CardDescription>
              Your current address information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                defaultValue={profile?.address?.street || ""}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  defaultValue={profile?.address?.city || ""}
                  placeholder="Port-au-Prince"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  defaultValue={profile?.address?.department || ""}
                  placeholder="Ouest"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                defaultValue={profile?.address?.country || "Haiti"}
                placeholder="Haiti"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Security
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Mail className="h-10 w-10 p-2 border rounded-md bg-gray-50" />
                <Input
                  id="email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="flex-1 bg-gray-50"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Contact support to change your email address
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Password
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Last changed: Never
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Change Password
                </Button>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" disabled>
                  Enable 2FA
                </Button>
              </div>
            </div>

            <p className="text-sm text-amber-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Security settings functionality coming soon
            </p>
          </CardContent>
        </Card>

        {/* Save Changes */}
        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button disabled>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
