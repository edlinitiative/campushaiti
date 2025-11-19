"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { demoSchools, getDemoProgramsByUniversity } from "@/lib/demo-data";
import { MapPin, Mail, Phone, Globe, Calendar, Clock, Languages, BookOpen, ArrowLeft } from "lucide-react";

export default function SchoolProgramsPublicPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const school = demoSchools.find(s => s.slug === slug);
  const allPrograms = school ? getDemoProgramsByUniversity(school.id) : [];
  
  const [search, setSearch] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");

  if (!school) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">University Not Found</h1>
        <p className="text-muted-foreground mb-6">The university you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild>
          <Link href="/schools/browse">← Back to Browse</Link>
        </Button>
      </div>
    );
  }

  const filteredPrograms = allPrograms.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(search.toLowerCase()) ||
                         program.description.toLowerCase().includes(search.toLowerCase());
    const matchesDegree = degreeFilter === "all" || program.degree === degreeFilter;
    return matchesSearch && matchesDegree;
  });

  const formatCurrency = (cents: number, currency: string) => {
    const amount = cents / 100;
    if (currency === "HTG") {
      return `${amount.toLocaleString()} HTG`;
    }
    return `$${amount.toLocaleString()} ${currency}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/schools/browse">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Universities
          </Link>
        </Button>
      </div>

      {/* University Header */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{school.name}</CardTitle>
            <CardDescription className="text-base">{school.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">{school.city}, {school.country}</p>
                </div>
              </div>

              {school.contactEmail && (
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a href={`mailto:${school.contactEmail}`} className="text-sm text-muted-foreground hover:underline">
                      {school.contactEmail}
                    </a>
                  </div>
                </div>
              )}

              {school.contactPhone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a href={`tel:${school.contactPhone}`} className="text-sm text-muted-foreground hover:underline">
                      {school.contactPhone}
                    </a>
                  </div>
                </div>
              )}

              {school.websiteUrl && (
                <div className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Website</p>
                    <a 
                      href={school.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:underline"
                    >
                      Visit Site
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Available Programs ({allPrograms.length})</h2>
        
        {/* Filters */}
        <div className="flex gap-4 flex-wrap mb-6">
          <div className="flex-1 min-w-[250px]">
            <Input
              placeholder="Search programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={degreeFilter} onValueChange={setDegreeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Degree Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Degrees</SelectItem>
              <SelectItem value="Bachelor">Bachelor</SelectItem>
              <SelectItem value="Master">Master</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredPrograms.length} {filteredPrograms.length === 1 ? 'program' : 'programs'}
        </p>
      </div>

      {/* Programs Grid */}
      {filteredPrograms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No programs found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{program.name}</CardTitle>
                    <Badge>{program.degree} Degree</Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Application Fee</p>
                    <p className="text-lg font-bold">{formatCurrency(program.feeCents, program.currency)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{program.description}</p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {program.duration && (
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-muted-foreground">{program.duration}</p>
                      </div>
                    </div>
                  )}

                  {program.language && (
                    <div className="flex items-start gap-2">
                      <Languages className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Language</p>
                        <p className="text-muted-foreground">{program.language}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-2 col-span-2">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Application Deadline</p>
                      <p className="text-muted-foreground">
                        {new Date(program.deadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {program.requirements && (
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="font-medium text-sm">Requirements</p>
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">{program.requirements}</p>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <Button className="flex-1" asChild>
                    <Link href="/apply">Apply Now</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/programs/${program.id}`}>Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="py-12 text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to Apply?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create an account to start your application to {school.name} and other Haitian universities
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
