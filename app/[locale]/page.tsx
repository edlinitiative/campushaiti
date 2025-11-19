import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/navigation";

export default function HomePage() {
  const t = useTranslations();
  const tHome = useTranslations("home");

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold">
          {t("common.appName")}
        </h1>
        <p className="text-xl text-muted-foreground">
          {tHome("tagline")}
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
            <h3 className="text-lg font-semibold mb-2">{tHome("easyApplication")}</h3>
            <p className="text-sm text-muted-foreground">
              {tHome("easyApplicationDesc")}
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{tHome("securePayments")}</h3>
            <p className="text-sm text-muted-foreground">
              {tHome("securePaymentsDesc")}
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{tHome("trackProgress")}</h3>
            <p className="text-sm text-muted-foreground">
              {tHome("trackProgressDesc")}
            </p>
          </div>
        </div>

        {/* Demo Links Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h2 className="text-2xl font-bold mb-4">{tHome("tryDemoPortals")}</h2>
          <p className="text-muted-foreground mb-6">
            {tHome("explorePlatform")}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/schools/dashboard">
              <div className="p-6 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-blue-900">{tHome("schoolAdminPortal")}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tHome("schoolAdminDesc")}
                </p>
              </div>
            </Link>
            <Link href="/admin">
              <div className="p-6 bg-white rounded-lg border border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-indigo-900">{tHome("platformAdminPortal")}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {tHome("platformAdminDesc")}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
