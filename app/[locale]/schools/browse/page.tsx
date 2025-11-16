"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { demoSchools, getDemoProgramsByUniversity } from "@/lib/demo-data";
import { MapPin, Globe, Mail, Phone, GraduationCap } from "lucide-react";

export default function BrowseSchoolsPage() {
  const [search, setSearch] = useState("");

  const filteredSchools = demoSchools.filter(school =>
    school.name.toLowerCase().includes(search.toLowerCase()) ||
    school.city.toLowerCase().includes(search.toLowerCase()) ||
    school.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Universities</h1>
        <p className="text-muted-foreground text-lg">
          Explore Haiti&apos;s leading universities and their programs
        </p>
      </div>

      {/* Demo Mode Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">Demo Universities</h3>
            <p className="text-sm text-blue-800">
              These are sample universities for demonstration purposes. To view real universities and apply to their programs,{' '}
              <Link href="/auth/signin" className="underline font-medium">sign in</Link> or{' '}
              <Link href="/auth/signup" className="underline font-medium">create an account</Link>.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Search universities by name, location, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xl"
        />
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredSchools.length} {filteredSchools.length === 1 ? 'university' : 'universities'}
        </p>
      </div>

      {/* Universities Grid */}
      <div className="grid gap-6">
        {filteredSchools.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No universities found matching your search.</p>
            </CardContent>
          </Card>
        ) : (
          filteredSchools.map((school) => {
            const programs = getDemoProgramsByUniversity(school.id);
            const programCount = programs.length;
            
            return (
              <Card key={school.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{school.name}</CardTitle>
                      <CardDescription className="text-base">
                        {school.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      <GraduationCap className="w-4 h-4 mr-1" />
                      {programCount} Programs
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase text-muted-foreground">Contact Information</h3>
                      
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{school.city}, {school.country}</p>
                        </div>
                      </div>

                      {school.contactEmail && (
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <a href={`mailto:${school.contactEmail}`} className="text-sm hover:underline">
                            {school.contactEmail}
                          </a>
                        </div>
                      )}

                      {school.contactPhone && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <a href={`tel:${school.contactPhone}`} className="text-sm hover:underline">
                            {school.contactPhone}
                          </a>
                        </div>
                      )}

                      {school.websiteUrl && (
                        <div className="flex items-start gap-2">
                          <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <a 
                            href={school.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Programs Preview */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm uppercase text-muted-foreground">Available Programs</h3>
                      <div className="space-y-2">
                        {programs.slice(0, 4).map((program) => (
                          <div key={program.id} className="flex items-center justify-between text-sm">
                            <span>{program.name}</span>
                            <Badge variant="outline">{program.degree}</Badge>
                          </div>
                        ))}
                        {programCount > 4 && (
                          <p className="text-sm text-muted-foreground italic">
                            + {programCount - 4} more programs
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    <Button asChild>
                      <Link href={`/schools/${school.slug}`}>View Programs</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/apply">Apply Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Call to Action */}
      <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to Apply?</h2>
        <p className="text-muted-foreground mb-6">
          Create an account to start your application to Haitian universities
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Create Account</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
