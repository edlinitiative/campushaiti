import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SendBulkSMS } from "@/components/admin/SendBulkSMS";
import { SMSHistory } from "@/components/admin/SMSHistory";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "admin.sms" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function SMSNotificationsPage() {
  const t = await getTranslations("admin.sms");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">{t("pageDescription")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SendBulkSMS />
        </div>

        <div className="lg:col-span-2">
          <SMSHistory />
        </div>
      </div>
    </div>
  );
}
