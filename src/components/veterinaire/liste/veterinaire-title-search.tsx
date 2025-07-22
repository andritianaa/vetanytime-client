"use client";

import { RefreshCw, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VeterinaireTitleSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleFilterChange: () => void;
  refreshData: () => void;
}

export const VeterinaireTitleSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 px-6 pt-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Gestion des vétérinaires
        </h2>
        <p className="text-muted-foreground">
          Gérez les vétérinaires, les paramètres du compte
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Rechercher vétérinaires..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          className="w-64"
        />
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter vétérinaire
        </Button>
      </div>
    </div>
  );
};
