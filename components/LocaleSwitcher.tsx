"use client";

import { useTranslations } from "next-intl";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locales, type Locale } from "@/i18n";

export default function LocaleSwitcher() {
  const t = useTranslations("common");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  
  const currentLocale = (params.locale as Locale) || "en";

  const handleLocaleChange = (newLocale: string) => {
    // Remove the current locale from pathname if it exists
    const pathWithoutLocale = pathname.replace(/^\/(en|fr|ht)/, "") || "/";
    
    // Construct new path with new locale - always include locale prefix
    const newPath = `/${newLocale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
    
    router.push(newPath);
  };

  const localeNames: Record<Locale, string> = {
    en: "English",
    fr: "Français",
    ht: "Kreyòl",
  };

  return (
    <Select value={currentLocale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {localeNames[locale]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
