import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/lib/navigation";
import { ArrowLeft, CheckCircle, UserPlus, FileText, CreditCard, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function GettingStartedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("help");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/help">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToHelp")}
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{t("gettingStarted")}</h1>
          <p className="text-lg text-muted-foreground">
            {t("gettingStartedDescription")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: Create Account */}
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <UserPlus className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>{t("step1Title")}</CardTitle>
                  <CardDescription>{t("step1Description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step1Point1")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step1Point1Detail")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step1Point2")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step1Point2Detail")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step1Point3")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step1Point3Detail")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Complete Profile */}
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>{t("step2Title")}</CardTitle>
                  <CardDescription>{t("step2Description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step2Point1")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step2Point1Detail")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step2Point2")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step2Point2Detail")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Browse Programs */}
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>{t("step3Title")}</CardTitle>
                  <CardDescription>{t("step3Description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step3Point1")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step3Point1Detail")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step3Point2")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step3Point2Detail")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4: Submit Application */}
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>{t("step4Title")}</CardTitle>
                  <CardDescription>{t("step4Description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step4Point1")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step4Point1Detail")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step4Point2")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step4Point2Detail")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step4Point3")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step4Point3Detail")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 5: Track Your Application */}
          <Card>
            <CardHeader>
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle>{t("step5Title")}</CardTitle>
                  <CardDescription>{t("step5Description")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step5Point1")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step5Point1Detail")}
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t("step5Point2")}</p>
                  <p className="text-sm text-muted-foreground">
                    {t("step5Point2Detail")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>{t("nextSteps")}</CardTitle>
              <CardDescription>{t("nextStepsDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/apply">
                  <Button className="w-full">{t("startApplication")}</Button>
                </Link>
                <Link href="/help/faq">
                  <Button variant="outline" className="w-full">
                    {t("viewFAQ")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
