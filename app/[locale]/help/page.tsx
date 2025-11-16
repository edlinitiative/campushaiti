import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
                Can't find what you're looking for? Our support team is here to help.
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
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I apply to universities?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
                <AccordionContent>
                  We accept two secure payment methods:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Stripe:</strong> Credit/debit cards (Visa, Mastercard, American Express)</li>
                    <li><strong>MonCash:</strong> Mobile money for local payments in Haiti</li>
                  </ul>
                  All transactions are encrypted and secure.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>How do I track my application status?</AccordionTrigger>
                <AccordionContent>
                  After submitting your application:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Sign in to your dashboard</li>
                    <li>View all your applications in one place</li>
                    <li>See real-time status updates (Submitted, Under Review, Accepted, Rejected)</li>
                    <li>Receive email notifications for important updates</li>
                    <li>Access additional information or requirements from universities</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>What documents do I need?</AccordionTrigger>
                <AccordionContent>
                  Common required documents include:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Copy of valid ID or passport</li>
                    <li>High school transcripts and diplomas (Baccalauréat)</li>
                    <li>Recent passport-sized photograph</li>
                    <li>Birth certificate (for some programs)</li>
                    <li>Recommendation letters (for graduate programs)</li>
                  </ul>
                  Specific requirements may vary by university and program.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Can I apply to multiple universities?</AccordionTrigger>
                <AccordionContent>
                  Yes! One of the main benefits of Campus Haiti is the ability to apply to multiple universities and programs with a single application. You can:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Select as many programs as you want</li>
                    <li>Reuse your profile and documents across applications</li>
                    <li>Pay all fees in one transaction</li>
                    <li>Track all applications from one dashboard</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>How long does the application process take?</AccordionTrigger>
                <AccordionContent>
                  The timeline varies:
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Completing application:</strong> 30-60 minutes if you have all documents ready</li>
                    <li><strong>University review:</strong> Typically 2-6 weeks, depending on the institution</li>
                    <li><strong>Admission decision:</strong> You'll be notified via email and dashboard</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
