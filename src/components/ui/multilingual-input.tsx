"use client";

import { ChevronDown, Languages } from 'lucide-react';
import { useContext, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { MultilingualContext } from '@/components/ui/multilingual-context';
import { Textarea } from '@/components/ui/textarea';

type Language = "fr" | "en" | "nl";
export type MultilingualValue = [string, string, string]; // [français, anglais, néerlandais]

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

type MultilingualInputProps = {
  value?: MultilingualValue;
  onChange?: (value: MultilingualValue) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
};

export function MultilingualInput({
  value = ["", "", ""],
  onChange,
  placeholder = "",
  className = "",
  required = false,
}: MultilingualInputProps) {
  const contextValue = useContext(MultilingualContext);
  const [localLanguage, setLocalLanguage] = useState<Language>("fr");

  // Déterminer la langue actuelle
  const currentLanguage = contextValue
    ? contextValue.globalLanguage
    : localLanguage;
  const isInContext = contextValue !== null;

  const currentLanguageIndex = languages.findIndex(
    (lang) => lang.code === currentLanguage
  );
  const currentLanguageConfig = languages[currentLanguageIndex];

  const handleInputChange = (inputValue: string) => {
    const newValue: MultilingualValue = [...value];
    newValue[currentLanguageIndex] = inputValue;
    onChange?.(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Afficher le sélecteur de langue seulement si on n'est PAS dans un contexte */}
      {!isInContext && (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <span>{currentLanguageConfig.flag}</span>
                <span>{currentLanguageConfig.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLocalLanguage(lang.code)}
                  className="gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {lang.code === "fr" && (
                    <span className="text-muted-foreground text-xs">
                      (obligatoire)
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Languages className="text-muted-foreground h-4 w-4" />
        </div>
      )}

      <Input
        value={value[currentLanguageIndex]}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder={placeholder}
        required={required && currentLanguage === "fr"}
        className="w-full"
      />

      {/* Afficher les indicateurs seulement si on n'est PAS dans un contexte */}
      {!isInContext && (
        <div className="flex gap-1">
          {languages.map((lang, index) => (
            <div
              key={lang.code}
              className={`h-2 w-8 rounded-full ${
                value[index]
                  ? "bg-green-500"
                  : lang.code === "fr"
                  ? "bg-red-200"
                  : "bg-gray-200"
              } ${currentLanguage === lang.code ? "ring-2 ring-blue-400" : ""}`}
              title={`${lang.name}: ${value[index] ? "Rempli" : "Vide"}${
                currentLanguage === lang.code ? " (actuel)" : ""
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type MultilingualTextareaProps = {
  value?: MultilingualValue;
  onChange?: (value: MultilingualValue) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  rows?: number;
};

export function MultilingualTextarea({
  value = ["", "", ""],
  onChange,
  placeholder = "",
  className = "",
  required = false,
  rows = 4,
}: MultilingualTextareaProps) {
  const contextValue = useContext(MultilingualContext);
  const [localLanguage, setLocalLanguage] = useState<Language>("fr");

  // Déterminer la langue actuelle
  const currentLanguage = contextValue
    ? contextValue.globalLanguage
    : localLanguage;
  const isInContext = contextValue !== null;

  const currentLanguageIndex = languages.findIndex(
    (lang) => lang.code === currentLanguage
  );
  const currentLanguageConfig = languages[currentLanguageIndex];

  const handleTextareaChange = (inputValue: string) => {
    const newValue: MultilingualValue = [...value];
    newValue[currentLanguageIndex] = inputValue;
    onChange?.(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {!isInContext && (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <span>{currentLanguageConfig.flag}</span>
                <span>{currentLanguageConfig.name}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {languages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => setLocalLanguage(lang.code)}
                  className="gap-2"
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {lang.code === "fr" && (
                    <span className="text-muted-foreground text-xs">
                      (obligatoire)
                    </span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Languages className="text-muted-foreground h-4 w-4" />
        </div>
      )}

      <Textarea
        value={value[currentLanguageIndex]}
        onChange={(e) => handleTextareaChange(e.target.value)}
        placeholder={placeholder}
        required={required && currentLanguage === "fr"}
        rows={rows}
        className="w-full resize-none"
      />

      {/* Afficher les indicateurs seulement si on n'est PAS dans un contexte */}
      {!isInContext && (
        <div className="flex gap-1">
          {languages.map((lang, index) => (
            <div
              key={lang.code}
              className={`h-2 w-8 rounded-full ${
                value[index]
                  ? "bg-green-500"
                  : lang.code === "fr"
                  ? "bg-red-200"
                  : "bg-gray-200"
              } ${currentLanguage === lang.code ? "ring-2 ring-blue-400" : ""}`}
              title={`${lang.name}: ${value[index] ? "Rempli" : "Vide"}${
                currentLanguage === lang.code ? " (actuel)" : ""
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
