import { requireRole } from "@/lib/auth/server-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminPage() {
  // Require admin role
  await requireRole(["ADMIN"]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>University Registrations</CardTitle>
            <CardDescription>Approve new university registrations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and approve universities wanting to join the platform
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/universities">Manage Universities</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Programs</CardTitle>
            <CardDescription>Configure university programs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add programs, set fees, and manage deadlines
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/programs">View Programs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Applications</CardTitle>
            <CardDescription>Process applicant submissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Review and approve/reject applications
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/applications">View Applications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
