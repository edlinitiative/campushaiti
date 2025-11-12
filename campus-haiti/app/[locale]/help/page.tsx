import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("nav.help")}</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">How do I apply?</h3>
                <p className="text-sm text-muted-foreground">
                  Create an account, complete your profile, upload required documents, select programs, and submit your application.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">What payment methods are accepted?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept credit cards through Stripe and MonCash for local payments.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How long does the application process take?</h3>
                <p className="text-sm text-muted-foreground">
                  Application review times vary by university, but typically take 2-4 weeks.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>Need help? Reach out to our support team</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Email: support@campushaiti.com</p>
              <p>Phone: +509 XXXX-XXXX</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
