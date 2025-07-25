"use client";

import { Check, Shield, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Roles } from '@prisma/client';

import type { ClientDetailsResponse } from "@/types/admin-users";
interface ClientPermissionsProps {
  client: ClientDetailsResponse;
  onClientUpdated: () => void;
}

export function ClientPermissions({
  client,
  onClientUpdated,
}: ClientPermissionsProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    client.permissions || []
  );
  const [isLoading, setIsLoading] = useState(false);

  // Available roles
  const availableRoles = [
    { id: "CLIENT", name: "Client", description: "Accès basique du client" },
    {
      id: "ADMIN",
      name: "Admin",
      description: "Accès administratif pour gérer les clients et le contenu",
    },
    {
      id: "SUPERADMIN",
      name: "Super Admin",
      description: "Accès complet au système sans aucune restriction",
    },
    {
      id: "MODERATOR",
      name: "Modérateur",
      description: "Can moderate content and clients",
    },
    {
      id: "DEV",
      name: "Développeur",
      description: "Accès aux outils de développement et aux API",
    },
    { id: "SUPPORT", name: "Support", description: "Accès au support client" },
    {
      id: "EDITOR",
      name: "Editeur",
      description: "Peut éditer et publier du contenu",
    },
    {
      id: "VIEWER",
      name: "Lecteur",
      description: "Accès en lecture seule au contenu",
    },
  ];

  // Handle role toggle
  const handleRoleToggle = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles((prev) => [...prev, roleId]);
    } else {
      setSelectedRoles((prev) => prev.filter((id) => id !== roleId));
    }
  };

  // Handle save permissions
  const handleSavePermissions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/users/${client.id}/permissions`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissions: selectedRoles }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update permissions");
      }

      toast({
        title: "Success",
        description: "Client permissions updated successfully",
      });

      setIsEditing(false);
      onClientUpdated();
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pérmission du client</CardTitle>
            <CardDescription>
              Gérer les rôles et les autorisations des clients
            </CardDescription>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Annuler" : "Modifier permissions"}
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Sélectionnez les rôles que vous souhaitez attribuer à ce client.
                Chaque rôle accorde des autorisations spécifiques.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-start space-x-2 border rounded-md p-3"
                  >
                    <Checkbox
                      id={`role-${role.id}`}
                      checked={selectedRoles.includes(role.id)}
                      onCheckedChange={(checked) =>
                        handleRoleToggle(role.id, checked === true)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {role.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {client.permissions && client.permissions.length > 0 ? (
                  client.permissions.map((role) => (
                    <Badge key={role} className="text-sm px-3 py-1">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <div className="flex items-center text-muted-foreground">
                    <X className="h-4 w-4 mr-2" />
                    <span>Pas de rôle assigné</span>
                  </div>
                )}
              </div>

              <div className="bg-muted rounded-md p-4">
                <h4 className="text-sm font-medium mb-2">Role Descriptions</h4>
                <ul className="space-y-2">
                  {availableRoles
                    .filter((role) =>
                      client.permissions?.includes(role.id as Roles)
                    )
                    .map((role) => (
                      <li key={role.id} className="text-sm flex items-start">
                        <Shield className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                        <div>
                          <span className="font-medium">{role.name}:</span>{" "}
                          {role.description}
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedRoles(client.permissions || []);
                setIsEditing(false);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSavePermissions} disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="mr-2">Saving...</span>
                  <span className="animate-spin">⟳</span>
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Enregistrer permissions
                </>
              )}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
