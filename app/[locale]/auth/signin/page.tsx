import { useTranslations } from "next-intl";
import PasswordAuth from "@/components/auth/PasswordAuth";
import PhoneAuth from "@/components/auth/PhoneAuth";
import EmailLinkAuth from "@/components/auth/EmailLinkAuth";
import PasskeyAuth from "@/components/auth/PasskeyAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function SignInPage() {
  const t = useTranslations("auth");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t("welcome")}</CardTitle>
            <CardDescription>{t("signInToAccount")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="password">{t("password")}</TabsTrigger>
                <TabsTrigger value="phone">{t("phone")}</TabsTrigger>
                <TabsTrigger value="passkey">{t("passkey")}</TabsTrigger>
                <TabsTrigger value="email">{t("emailLink")}</TabsTrigger>
              </TabsList>
              <TabsContent value="password" className="mt-4">
                <PasswordAuth mode="signin" />
              </TabsContent>
              <TabsContent value="phone" className="mt-4">
                <PhoneAuth />
              </TabsContent>
              <TabsContent value="passkey" className="mt-4">
                <PasskeyAuth />
              </TabsContent>
              <TabsContent value="email" className="mt-4">
                <EmailLinkAuth />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <div className="text-center text-sm text-muted-foreground mt-4 space-y-2">
          <p>{t("secureSignIn")}</p>
          <p>
            {t("noAccount")}{" "}
            <Link href="/auth/signup" className="text-primary hover:underline font-medium">
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
