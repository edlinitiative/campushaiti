import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Mail, MessageCircle, Book, Phone } from "lucide-react";

export default function HelpPage() {
  const t = useTranslations("help");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
          <p className="text-xl text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative">
            <Input 
              placeholder={t("searchPlaceholder")} 
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
              <CardTitle>{t("gettingStarted")}</CardTitle>
              <CardDescription>
                {t("gettingStartedDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="/help/getting-started">{t("readGuide")}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>{t("contactSupport")}</CardTitle>
              <CardDescription>
                {t("contactSupportDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild className="w-full">
                <Link href="mailto:support@campushaiti.org">{t("emailSupport")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>{t("faqTitle")}</CardTitle>
            <CardDescription>{t("faqSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">{t("q1")}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{t("a1Intro")}</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>{t("a1Step1")}</li>
                  <li>{t("a1Step2")}</li>
                  <li>{t("a1Step3")}</li>
                  <li>{t("a1Step4")}</li>
                  <li>{t("a1Step5")}</li>
                  <li>{t("a1Step6")}</li>
                </ol>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("q2")}</h3>
              <div className="text-sm text-muted-foreground">
                {t("a2Intro")}
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Stripe:</strong> {t("a2Stripe").replace('Stripe: ', '')}</li>
                  <li><strong>MonCash:</strong> {t("a2MonCash").replace('MonCash: ', '')}</li>
                </ul>
                <p className="mt-2">{t("a2Security")}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("q3")}</h3>
              <div className="text-sm text-muted-foreground">
                {t("a3Intro")}
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>{t("a3Step1")}</li>
                  <li>{t("a3Step2")}</li>
                  <li>{t("a3Step3")}</li>
                  <li>{t("a3Step4")}</li>
                  <li>{t("a3Step5")}</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("q4")}</h3>
              <div className="text-sm text-muted-foreground">
                {t("a4Intro")}
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>{t("a4Doc1")}</li>
                  <li>{t("a4Doc2")}</li>
                  <li>{t("a4Doc3")}</li>
                  <li>{t("a4Doc4")}</li>
                  <li>{t("a4Doc5")}</li>
                </ul>
                <p className="mt-2">{t("a4Note")}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("q5")}</h3>
              <div className="text-sm text-muted-foreground">
                {t("a5Intro")}
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>{t("a5Benefit1")}</li>
                  <li>{t("a5Benefit2")}</li>
                  <li>{t("a5Benefit3")}</li>
                  <li>{t("a5Benefit4")}</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">{t("q6")}</h3>
              <div className="text-sm text-muted-foreground">
                {t("a6Intro")}
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>{t("a6Completing").split(':')[0]}:</strong> {t("a6Completing").split(':')[1]}</li>
                  <li><strong>{t("a6Review").split(':')[0]}:</strong> {t("a6Review").split(':')[1]}</li>
                  <li><strong>{t("a6Decision").split(':')[0]}:</strong> {t("a6Decision").split(':')[1]}</li>
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
              <h3 className="font-semibold mb-2">{t("emailSupportTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("emailSupportDesc")}
              </p>
              <a href="mailto:support@campushaiti.org" className="text-blue-600 hover:underline text-sm">
                {t("emailAddress")}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <Phone className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">{t("phoneSupportTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("phoneSupportDesc")}
              </p>
              <a href="tel:+5091234567" className="text-blue-600 hover:underline text-sm">
                {t("phoneNumber")}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <MessageCircle className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">{t("liveChatTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("liveChatDesc")}
              </p>
              <Button variant="outline" size="sm">
                {t("startChat")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
