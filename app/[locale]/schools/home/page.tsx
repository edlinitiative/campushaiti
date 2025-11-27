"use client";

import { useEffect, useState } from "react";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, MapPin, Globe, Mail, Phone, Users, BookOpen, Calendar } from "lucide-react";

interface Program {
  id: string;
  name: string;
  degree: string;
  field: string;
  description: string;
  duration: string;
  tuition: number;
  applicationFee: number;
  deadline: string;
  startDate: string;
}

interface University {
  id: string;
  name: string;
  slug: string;
  description: string;
  city?: string;
  department?: string;
  country?: string;
  website?: string;
  email?: string;
  phone?: string;
  logo?: string;
  coverImage?: string;
}

export default function SchoolHomePage() {
  const [university, setUniversity] = useState<University | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUniversityData();
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      // Check if user has session cookie by trying to fetch user profile
      const response = await fetch('/api/user/profile');
      setIsAuthenticated(response.ok);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const loadUniversityData = async () => {
    try {
      const uniResponse = await fetch('/api/schools/public/university');
      if (uniResponse.ok) {
        const uniData = await uniResponse.json();
        setUniversity(uniData.university);
      } else {
        const errorData = await uniResponse.json();
        console.error('Error loading university:', errorData);
      }

      const programsResponse = await fetch('/api/schools/public/programs');
      if (programsResponse.ok) {
        const programsData = await programsResponse.json();
        setPrograms(programsData.programs || []);
      } else {
        const errorData = await programsResponse.json();
        console.error('Error loading programs:', errorData);
      }
    } catch (error) {
      console.error('Error loading university data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    const htg = cents / 100;
    return `${htg.toLocaleString()} HTG`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>University Not Found</CardTitle>
            <CardDescription>This university portal is not available.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/"><Button>Go to Main Site</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20"
        style={university.coverImage ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${university.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : undefined}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {university.logo && (
              <img src={university.logo} alt={`${university.name} logo`} className="h-20 mb-6 bg-white rounded-lg p-2" />
            )}
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{university.name}</h1>
            <p className="text-xl mb-6 text-gray-100">{university.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              {university.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{university.city}, {university.country}</span>
                </div>
              )}
              {university.website && (
                <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                  <Globe className="w-4 h-4" />
                  <span>Visit Website</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard"><Button><Users className="w-4 h-4 mr-2" />Dashboard</Button></Link>
                <Link href="/dashboard/programs"><Button variant="outline"><BookOpen className="w-4 h-4 mr-2" />Manage Programs</Button></Link>
              </>
            ) : (
              <>
                <Link href="/auth/signin"><Button><Users className="w-4 h-4 mr-2" />Staff Login</Button></Link>
                <Link href="/apply"><Button variant="outline"><GraduationCap className="w-4 h-4 mr-2" />Apply Now</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {(university.email || university.phone) && (
          <Card className="mb-8">
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {university.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium">Email</div>
                      <a href={`mailto:${university.email}`} className="text-blue-600 hover:underline">{university.email}</a>
                    </div>
                  </div>
                )}
                {university.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <a href={`tel:${university.phone}`} className="text-blue-600 hover:underline">{university.phone}</a>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Academic Programs</h2>
          </div>

          {programs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary">{program.degree}</Badge>
                      <Badge variant="outline">{program.field}</Badge>
                    </div>
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 line-clamp-3">{program.description}</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="w-4 h-4" />
                        <span>Duration: {program.duration}</span>
                      </div>
                      {!isAuthenticated ? (
                        <div className="pt-4 border-t">
                          <Link href="/auth/signin"><Button variant="outline" size="sm" className="w-full">Login to see details</Button></Link>
                        </div>
                      ) : (
                        <>
                          <div className="text-gray-700"><span className="font-medium">Tuition:</span> {formatCurrency(program.tuition)}</div>
                          <div className="text-gray-700"><span className="font-medium">Deadline:</span> {program.deadline}</div>
                          <div className="pt-4 border-t">
                            <Link href={`/dashboard/programs?id=${program.id}`}><Button size="sm" className="w-full">View Details</Button></Link>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No programs available at this time.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {!isAuthenticated && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="py-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                Join thousands of students who have chosen {university.name} for their higher education.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/auth/signup"><Button size="lg">Create Account</Button></Link>
                <Link href="/auth/signin"><Button size="lg" variant="outline">Sign In</Button></Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
