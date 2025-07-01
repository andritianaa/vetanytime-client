"use client";
import { CalendarIcon, Info, MoreHorizontal, Shield, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';

import type { Client as ClientType } from "@/types/schema";

interface ClientsTableProps {
  clients: ClientType[];
  isLoading: boolean;
  onViewClientDetails: (client: ClientType) => void;
}

export function ClientsTable({
  clients,
  isLoading,
  onViewClientDetails,
}: ClientsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
            <p className="mt-4 text-muted-foreground">Loading client data...</p>
          </div>
        ) : clients.length > 0 ? (
          <div className="w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead className="w-[200px]">Fullname</TableHead>
                  <TableHead className="w-[150px]">Roles</TableHead>
                  <TableHead className="w-[180px]">Verfied client</TableHead>
                  <TableHead className="w-[100px]">Lang</TableHead>
                  <TableHead className="w-[200px]">Registration</TableHead>
                  <TableHead className="text-right w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center gap-2 cursor-pointer">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={client.image || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {client.username?.slice(0, 2).toUpperCase() ||
                                  client.email.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {client.username || "No username"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {client.email}
                              </div>
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="flex justify-between space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={client.image || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {client.username?.slice(0, 2).toUpperCase() ||
                                  client.email.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">
                                {client.username || "No username"}
                              </h4>
                              {client.fullname && (
                                <p className="text-sm">{client.fullname}</p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                {client.email}
                              </p>
                              <div className="flex items-center pt-2">
                                <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                                <span className="text-xs text-muted-foreground">
                                  Client ID: {client.id.substring(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                    <TableCell>
                      {client.fullname ? (
                        <p className="text-xs">{client.fullname}</p>
                      ) : (
                        <p className="text-xs">No fullname</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {client.permissions && client.permissions.length > 0 ? (
                          client.permissions.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            No roles
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        {client.isEmailVerified ? (
                          <Badge className="text-xs">Verified</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Not Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {client.language ? (
                        <p className="text-xs">{client.language}</p>
                      ) : (
                        <p className="text-xs">No language</p>
                      )}
                    </TableCell>

                    <TableCell>
                      {client.createdAt ? (
                        <p className="text-xs">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </p>
                      ) : (
                        <p className="text-xs">No date</p>
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
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => onViewClientDetails(client)}
                          >
                            <Info className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Edit Permissions</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Impersonate</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-24 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No clients found matching your filters.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
