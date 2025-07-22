"use client";

import { Check, ChevronsUpDown, X } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type MultiSelectOption = {
  id: string;
  name: string;
  value?: string;
};

type MultiSelectProps = {
  options: MultiSelectOption[];
  selectedIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  maxDisplayCount?: number;
};

export function MultiSelect({
  options,
  selectedIds,
  onSelectionChange,
  placeholder = "Sélectionner des éléments...",
  searchPlaceholder = "Rechercher...",
  emptyMessage = "Aucun élément trouvé.",
  className,
  maxDisplayCount,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => selectedIds.includes(option.id));
  }, [options, selectedIds]);

  const handleToggleOption = (optionId: string) => {
    const newSelectedIds = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId];

    onSelectionChange(newSelectedIds);
  };

  const handleRemoveOption = (optionId: string) => {
    const newSelectedIds = selectedIds.filter((id) => id !== optionId);
    onSelectionChange(newSelectedIds);
  };

  const getDisplayText = () => {
    if (selectedIds.length === 0) {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }

    if (maxDisplayCount && selectedIds.length > maxDisplayCount) {
      return `${selectedIds.length} éléments sélectionnés`;
    }

    return `${selectedIds.length} élément${
      selectedIds.length > 1 ? "s" : ""
    } sélectionné${selectedIds.length > 1 ? "s" : ""}`;
  };

  return (
    <div className={cn("w-full space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-auto min-h-[40px] w-full justify-between px-3 py-2"
          >
            <span className="text-left">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} className="h-9" />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.id}
                    value={option.name}
                    onSelect={() => handleToggleOption(option.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIds.includes(option.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <span className="truncate">{option.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOptions.length > 0 && (
        <div className="bg-muted/30 flex flex-wrap gap-2 rounded-md p-2">
          {selectedOptions.map((option) => (
            <Badge
              key={option.id}
              variant="secondary"
              className="flex items-center gap-1 py-1 pr-1"
            >
              <span className="max-w-[120px] truncate">{option.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hover:bg-destructive hover:text-destructive-foreground h-4 w-4 rounded-full p-0"
                onClick={() => handleRemoveOption(option.id)}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Supprimer {option.name}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
