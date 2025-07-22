"use client";

import { useMultilingualContext } from '@/components/ui/multilingual-context';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Language = "fr" | "en" | "nl";

type LanguageConfig = {
  code: Language;
  name: string;
  flag: string;
};

const languages: LanguageConfig[] = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
];

export function GlobalLanguageSelector() {
  const { globalLanguage, setGlobalLanguage } = useMultilingualContext();

  return (
    <Tabs
      value={globalLanguage}
      onValueChange={(value) => setGlobalLanguage(value as Language)}
    >
      <TabsList className="grid w-full grid-cols-3">
        {languages.map((lang) => (
          <TabsTrigger
            key={lang.code}
            value={lang.code}
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">{lang.name}</span>
            <span className="sm:hidden">{lang.code.toUpperCase()}</span>
            {lang.code === "fr" && (
              <span className="text-xs opacity-75">(req.)</span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
