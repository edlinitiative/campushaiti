import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold">
          {t("common.appName")}
        </h1>
        <p className="text-xl text-muted-foreground">
          Your gateway to higher education in Haiti
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/apply">
            <Button size="lg">{t("nav.apply")}</Button>
          </Link>
          <Link href="/partners">
            <Button size="lg" variant="outline">
              {t("nav.partners")}
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Easy Application</h3>
            <p className="text-sm text-muted-foreground">
              Apply to multiple universities with one streamlined application
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
            <p className="text-sm text-muted-foreground">
              Pay application fees securely with Stripe or MonCash
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your application status in real-time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
