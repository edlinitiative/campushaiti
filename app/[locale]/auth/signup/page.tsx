import { useTranslations } from "next-intl";
import PasswordAuth from "@/components/auth/PasswordAuth";
import GoogleAuth from "@/components/auth/GoogleAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function SignUpPage() {
  const t = useTranslations("auth");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t("createAccount")}</CardTitle>
            <CardDescription>{t("signUpDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <GoogleAuth />
            
            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                {t("orContinueWith")}
              </span>
            </div>

            <PasswordAuth mode="signup" />
          </CardContent>
        </Card>
        <div className="text-center text-sm text-muted-foreground mt-4">
          <p>
            {t("haveAccount")}{" "}
            <Link href="/auth/signin" className="text-primary hover:underline font-medium">
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
