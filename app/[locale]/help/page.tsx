import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Mail, MessageCircle, Book, Phone } from "lucide-react";

export default function HelpPage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions and get the support you need
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <Input 
              placeholder="Search for help articles..." 
              className="pl-12 py-6 text-lg"
            />
            <svg 
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Book className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Getting Started Guide</CardTitle>
              <CardDescription>
                New to Campus Haiti? Learn how to create an account and submit your first application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/help/getting-started">Read Guide</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="mailto:support@campushaiti.org">Email Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Browse common questions and answers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do I apply to universities?</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>To apply to universities through Campus Haiti:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Create an account and sign in</li>
                  <li>Complete your profile with personal information</li>
                  <li>Upload required documents (transcripts, ID, etc.)</li>
                  <li>Browse universities and select programs</li>
                  <li>Pay application fees securely</li>
                  <li>Submit your application and track its status</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What payment methods are accepted?</h3>
              <div className="text-sm text-muted-foreground">
                We accept two secure payment methods:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Stripe:</strong> Credit/debit cards (Visa, Mastercard, American Express)</li>
                  <li><strong>MonCash:</strong> Mobile money for local payments in Haiti</li>
                </ul>
                <p className="mt-2">All transactions are encrypted and secure.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How do I track my application status?</h3>
              <div className="text-sm text-muted-foreground">
                After submitting your application:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Sign in to your dashboard</li>
                  <li>View all your applications in one place</li>
                  <li>See real-time status updates (Submitted, Under Review, Accepted, Rejected)</li>
                  <li>Receive email notifications for important updates</li>
                  <li>Access additional information or requirements from universities</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What documents do I need?</h3>
              <div className="text-sm text-muted-foreground">
                Common required documents include:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Copy of valid ID or passport</li>
                  <li>High school transcripts and diplomas (Baccalauréat)</li>
                  <li>Recent passport-sized photograph</li>
                  <li>Birth certificate (for some programs)</li>
                  <li>Recommendation letters (for graduate programs)</li>
                </ul>
                <p className="mt-2">Specific requirements may vary by university and program.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I apply to multiple universities?</h3>
              <div className="text-sm text-muted-foreground">
                Yes! One of the main benefits of Campus Haiti is the ability to apply to multiple universities and programs with a single application. You can:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Select as many programs as you want</li>
                  <li>Reuse your profile and documents across applications</li>
                  <li>Pay all fees in one transaction</li>
                  <li>Track all applications from one dashboard</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">How long does the application process take?</h3>
              <div className="text-sm text-muted-foreground">
                The timeline varies:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Completing application:</strong> 30-60 minutes if you have all documents ready</li>
                  <li><strong>University review:</strong> Typically 2-6 weeks, depending on the institution</li>
                  <li><strong>Admission decision:</strong> You&apos;ll be notified via email and dashboard</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <Mail className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get help via email
              </p>
              <a href="mailto:support@campushaiti.org" className="text-blue-600 hover:underline text-sm">
                support@campushaiti.org
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Phone className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Call during business hours
              </p>
              <a href="tel:+5091234567" className="text-blue-600 hover:underline text-sm">
                +509 1234 5678
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with support team
              </p>
              <Button variant="outline" size="sm">
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
