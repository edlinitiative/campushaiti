"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSchoolSubdomainUrl } from "@/lib/utils/subdomain";

interface University {
  id: string;
  name: string;
  slug: string;
  city?: string;
  country?: string;
}

export default function SchoolSelectorPage() {
  const router = useRouter();
  const t = useTranslations("schools.selector");
  const [loading, setLoading] = useState(true);
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      const response = await fetch('/api/schools/my-universities');
      
      if (response.ok) {
        const data = await response.json();
        const unis = data.universities || [];
        
        // If user has exactly one university, redirect to its subdomain
        if (unis.length === 1) {
          const subdomain = getSchoolSubdomainUrl(unis[0].slug, '/dashboard');
          window.location.href = subdomain;
          return;
        }
        
        setUniversities(unis);
      } else if (response.status === 401) {
        // Not authenticated, redirect to sign in
        router.push('/auth/signin');
      } else if (response.status === 404) {
        // No universities found
        setError('noUniversitiesFound');
      } else {
        setError('errorLoading');
      }
    } catch (err) {
      console.error("Error loading universities:", err);
      setError('errorLoading');
    } finally {
      setLoading(false);
    }
  };

  const goToUniversity = (slug: string) => {
    const subdomainUrl = getSchoolSubdomainUrl(slug, '/dashboard');
    window.location.href = subdomainUrl;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground">Loading your universities...</p>
        </div>
      </div>
    );
  }

  if (error === 'noUniversitiesFound') {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">No University Access</h1>
          <p className="text-muted-foreground">
            You don't have access to any university portals yet.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/schools/register">
              <Button>Register Your University</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted-foreground">
            Failed to load your universities. Please try again.
          </p>
          <Button onClick={loadUniversities}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Select Your University</h1>
          <p className="text-muted-foreground">
            You have access to {universities.length} {universities.length === 1 ? 'university' : 'universities'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {universities.map((uni) => (
            <Card 
              key={uni.id} 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => goToUniversity(uni.slug)}
            >
              <CardHeader>
                <CardTitle>{uni.name}</CardTitle>
                <CardDescription>
                  {uni.city && uni.country && `${uni.city}, ${uni.country}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {uni.slug}.campus.ht
                  </code>
                  <Button size="sm" variant="ghost">
                    Open Portal →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Tip: Bookmark your university's direct URL for faster access
          </p>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
