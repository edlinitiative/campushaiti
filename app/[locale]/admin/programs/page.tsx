"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, GraduationCap, Building2 } from "lucide-react";

interface Program {
  id: string;
  name: string;
  degree: string;
  universityId: string;
  universityName: string;
  feeCents: number;
  currency: string;
  deadline: any;
}

export default function AdminProgramsPage() {
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await fetch('/api/admin/programs');
      
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
        setDemoMode(false);
      } else {
        // Demo mode
        setDemoMode(true);
        setPrograms([
          {
            id: "1",
            name: "Bachelor of Science in Computer Science",
            degree: "BACHELOR",
            universityId: "u1",
            universityName: "Université d'État d'Haïti",
            feeCents: 50000,
            currency: "HTG",
            deadline: new Date("2025-08-01"),
          },
          {
            id: "2",
            name: "Master of Business Administration",
            degree: "MASTER",
            universityId: "u1",
            universityName: "Université d'État d'Haïti",
            feeCents: 75000,
            currency: "HTG",
            deadline: new Date("2025-07-15"),
          },
          {
            id: "3",
            name: "Bachelor of Engineering",
            degree: "BACHELOR",
            universityId: "u2",
            universityName: "Université Quisqueya",
            feeCents: 45000,
            currency: "HTG",
            deadline: new Date("2025-08-15"),
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading programs:", err);
      setDemoMode(true);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrograms = programs.filter(program =>
    program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    program.universityName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDegreeLabel = (degree: string) => {
    const labels: Record<string, string> = {
      BACHELOR: "Bachelor's",
      MASTER: "Master's",
      DOCTORATE: "PhD",
      ASSOCIATE: "Associate",
      CERTIFICATE: "Certificate",
      DIPLOMA: "Diploma",
    };
    return labels[degree] || degree;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading programs...</p>
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
              <h3 className="text-sm font-semibold text-amber-900 mb-1">Demo Mode</h3>
              <p className="text-sm text-amber-800">
                Viewing sample program data. Sign in as admin to see real programs.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <Link href="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Programs</h1>
          <p className="text-muted-foreground">
            {programs.length} programs across all universities
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search programs or universities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPrograms.map((program) => (
          <Card key={program.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <Badge variant="outline">{getDegreeLabel(program.degree)}</Badge>
                </div>
              </div>
              <CardTitle className="text-lg mt-2">{program.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {program.universityName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Application Fee:</span>
                  <span className="font-medium">
                    {program.feeCents / 100} {program.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-medium">
                    {new Date(program.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPrograms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No programs found</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Program Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Programs</p>
              <p className="text-2xl font-bold">{programs.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bachelor&apos;s</p>
              <p className="text-2xl font-bold">
                {programs.filter(p => p.degree === "BACHELOR").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Master&apos;s</p>
              <p className="text-2xl font-bold">
                {programs.filter(p => p.degree === "MASTER").length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Other</p>
              <p className="text-2xl font-bold">
                {programs.filter(p => !["BACHELOR", "MASTER"].includes(p.degree)).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
