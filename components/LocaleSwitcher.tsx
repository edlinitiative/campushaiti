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
    // Get the path without locale prefix
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];
    
    // Check if first segment is a locale
    const hasLocaleInPath = locales.includes(firstSegment as Locale);
    const pathWithoutLocale = hasLocaleInPath 
      ? '/' + segments.slice(1).join('/')
      : pathname;
    
    // Construct new path
    // For English (default), use path without locale (as-needed behavior)
    // For other locales, always include the locale prefix
    const newPath = newLocale === 'en'
      ? pathWithoutLocale || '/'
      : `/${newLocale}${pathWithoutLocale || '/'}`;
    
    // Set a cookie to remember the user's locale preference
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    
    router.push(newPath);
    router.refresh();
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
