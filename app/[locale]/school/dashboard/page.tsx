"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { auth } from "@/lib/firebase/client";
import { 
  collection, 
  doc, 
  getDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit 
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { School, SchoolApplication } from "@/lib/types/firestore";
import { 
  BarChart3, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle,
  Clock,
  Settings as SettingsIcon,
  Building2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/lib/navigation";

export default function SchoolDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<School | null>(null);
  const [applications, setApplications] = useState<SchoolApplication[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/auth/signin");
        return;
      }

      setUser(firebaseUser);
      await loadSchoolData(firebaseUser.uid);
    });

    return () => unsubscribe();
  }, [router]);

  const loadSchoolData = async (uid: string) => {
    try {
      // Get school where user is admin
      const schoolsQuery = query(
        collection(db, "schools"),
        where("adminUids", "array-contains", uid),
        limit(1)
      );
      const schoolSnapshot = await getDocs(schoolsQuery);

      if (schoolSnapshot.empty) {
        // No school found, redirect to register
        router.push("/school/register");
        return;
      }

      const schoolDoc = schoolSnapshot.docs[0];
      const schoolData = { id: schoolDoc.id, ...schoolDoc.data() } as School;
      setSchool(schoolData);

      // Check status
      if (schoolData.status === "PENDING") {
        router.push("/school/pending");
        return;
      }

      if (schoolData.status === "REJECTED") {
        router.push("/school/rejected");
        return;
      }

      // Load recent applications
      const applicationsQuery = query(
        collection(db, "schoolApplications"),
        where("schoolId", "==", schoolDoc.id),
        orderBy("submittedAt", "desc"),
        limit(10)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      const applicationsData = applicationsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as SchoolApplication)
      );
      setApplications(applicationsData);
    } catch (error) {
      console.error("Error loading school data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!school) {
    return null;
  }

  const stats = school.statistics;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{school.name}</h1>
            <p className="text-muted-foreground">
              {school.city}, {school.country}
            </p>
          </div>
          <Link href="/school/settings">
            <Button variant="outline">
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.acceptedApplications}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejectedApplications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="questions">Custom Questions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Applications</h2>
            <Link href="/school/applications">
              <Button variant="outline">View All</Button>
            </Link>
          </div>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No applications yet. Students will see your school once you create programs.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Application #{app.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {new Date(app.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          app.status === "SUBMITTED"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "ACCEPTED"
                            ? "bg-green-100 text-green-800"
                            : app.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>
                    <div className="mt-4">
                      <Link href={`/school/applications/${app.id}`}>
                        <Button variant="outline" size="sm">
                          Review Application
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="programs">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Programs</h2>
            <Link href="/school/programs/new">
              <Button>
                <Building2 className="w-4 h-4 mr-2" />
                Add Program
              </Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Create your first program to start receiving applications.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Custom Questions</h2>
            <Link href="/school/questions/new">
              <Button>Add Question</Button>
            </Link>
          </div>
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Create custom questions to collect additional information from applicants.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Application Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Analytics will appear here once you have applications.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
