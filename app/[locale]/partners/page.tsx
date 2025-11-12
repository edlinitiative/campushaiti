import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PartnersPage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("nav.partners")}</h1>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Universities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We partner with leading universities across Haiti to streamline the application process.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Become a Partner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Interested in partnering with Campus Haiti? Contact us to learn more about how we can work together.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
