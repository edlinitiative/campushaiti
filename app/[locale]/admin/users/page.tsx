import { requireRole } from "@/lib/auth/server-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { getAdminDb } from "@/lib/firebase/admin";
import { ArrowLeft, UserCog, Shield, Mail, Calendar } from "lucide-react";

async function getUsers() {
  const db = getAdminDb();
  
  try {
    const usersSnapshot = await db.collection("users").orderBy("createdAt", "desc").limit(100).get();
    
    return usersSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"]);
  
  const users = await getUsers();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case "SCHOOL_ADMIN":
        return <Badge className="bg-blue-100 text-blue-800">School Admin</Badge>;
      case "APPLICANT":
        return <Badge variant="outline">Applicant</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and permissions</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applicants</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {users.filter((u: any) => u.role === "APPLICANT").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>School Admins</CardDescription>
            <CardTitle className="text-2xl text-purple-600">
              {users.filter((u: any) => u.role === "SCHOOL_ADMIN").length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Platform Admins</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {users.filter((u: any) => u.role === "ADMIN").length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No users found</p>
          ) : (
            <div className="space-y-3">
              {users.map((user: any) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium">{user.name || "Unnamed User"}</p>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      {user.createdAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Joined {new Date(user.createdAt.seconds * 1000 || user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <UserCog className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Management Info */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <CardTitle>Role Permissions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-red-800">Admin</p>
              <p className="text-muted-foreground">
                Full platform access - manage universities, users, view all applications
              </p>
            </div>
            <div>
              <p className="font-medium text-blue-800">School Admin</p>
              <p className="text-muted-foreground">
                Manage their university's programs, review applications, configure settings
              </p>
            </div>
            <div>
              <p className="font-medium">Applicant</p>
              <p className="text-muted-foreground">
                Submit applications, upload documents, track application status
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
