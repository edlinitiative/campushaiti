import { useTranslations } from "next-intl";
import { CheckCircle, Clock } from "lucide-react";
import { Link } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SchoolPendingPage() {
  const t = useTranslations("school.pending");

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">{t("applicationReceived")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("applicationReceivedDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium">{t("underReview")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("underReviewDesc")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium">{t("notification")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("notificationDesc")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded">
            <p className="text-sm text-blue-900">
              <strong>{t("questionsTitle")}</strong> {t("contactUs")}{" "}
              <a href="mailto:schools@campushaiti.org" className="underline">
                schools@campushaiti.org
              </a>
            </p>
          </div>

          <div className="flex justify-center">
            <Link href="/">
              <Button>{t("returnHome")}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
