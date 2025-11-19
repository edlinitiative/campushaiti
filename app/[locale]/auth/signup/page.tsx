import { useTranslations } from "next-intl";
import PasswordAuth from "@/components/auth/PasswordAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
