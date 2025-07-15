"use client";
import { CalendarIcon, Info, MoreHorizontal, User } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CareType, City, Organization } from "@prisma/client";

interface VeterinaireTableProps {
  veterinaires:
    | (Organization & {
        city: City | null;
        careType: CareType | null;
      })[]
    | undefined;
  isLoading: boolean;
}

export function VeterinaireTable({
  veterinaires,
  isLoading,
}: VeterinaireTableProps) {
  const router = useRouter();
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4 text-muted-foreground">
              Chargement des vétérinaires...
            </p>
          </div>
        ) : veterinaires ? (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vétérinaires</TableHead>
                  <TableHead className="w-[250px]">Nom d'utilisateur</TableHead>
                  <TableHead className="w-[300px]">Type de soin</TableHead>
                  <TableHead className="w-[200px]">Ville</TableHead>
                  <TableHead className="w-[100px]">Langue</TableHead>
                  <TableHead className="w-[200px]">Inscription</TableHead>
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {veterinaires.map(
                  (vet) =>
                    vet && (
                      <TableRow key={vet.id}>
                        <TableCell>
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={vet.logo || "/placeholder.svg"}
                                  />
                                  <AvatarFallback>
                                    {vet.name?.slice(0, 2).toUpperCase() ||
                                      vet.email?.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {vet.name || "No username"}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {vet.email}
                                  </div>
                                </div>
                              </div>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80">
                              <div className="flex justify-between space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage
                                    src={vet.logo || "/placeholder.svg"}
                                  />
                                  <AvatarFallback>
                                    {vet.name?.slice(0, 2).toUpperCase() ||
                                      vet.email?.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                  {vet.name && (
                                    <p className="text-sm">{vet.name}</p>
                                  )}
                                  <p className="text-sm text-muted-foreground">
                                    {vet.email}
                                  </p>
                                  <div className="flex items-center pt-2">
                                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                    <span className="text-xs text-muted-foreground">
                                      Id Client: {vet.id.substring(0, 8)}...
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        </TableCell>
                        <TableCell>
                          {vet.name ? (
                            <p className="text-xs">{vet.name}</p>
                          ) : (
                            <p className="text-xs">Néant</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {vet.careType ? (
                              <p className="">{vet.careType.name}</p>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                Pas de type de soin
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {vet.city ? (
                              <p className="">{vet.city.name}</p>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Pas de ville
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="flex gap-2 items-center text-center">
                          {vet.lang && vet.lang.length > 0 ? (
                            <p className="text-xs pt-2">
                              {vet.lang.join(", ")}
                            </p>
                          ) : (
                            <p className="text-xs">Pas de langue</p>
                          )}
                        </TableCell>

                        <TableCell>
                          {vet.createdAt ? (
                            <p className="text-xs">
                              {new Date(vet.createdAt).toLocaleDateString()}
                            </p>
                          ) : (
                            <p className="text-xs">Pas de date</p>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <span className="sr-only">Ouvrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                  router.push(`/veterinaire/${vet.id}`);
                                }}
                              >
                                <Info className="mr-2 h-4 w-4" />
                                <span>Voir détails</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Imiter</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Aucun vétérinaire trouvé.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
