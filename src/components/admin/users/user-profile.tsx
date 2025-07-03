"use client";

import type React from "react";

import { Check, Edit, Globe, Lock, Mail, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import type { ClientDetailsResponse } from "@/types/admin-users";

interface ClientProfileProps {
  client: ClientDetailsResponse;
  onClientUpdated: () => void;
}

export function ClientProfile({ client, onClientUpdated }: ClientProfileProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: client.username || "",
    fullname: client.fullname || "",
    email: client.email,
    description: client.description || "",
    language: client.language, // Required field
    theme: client.theme, // Required field
    active: client.active || false,
    locked: client.locked || false,
  });

  // Calculate if client is currently active based on session data
  const [isActive, setIsActive] = useState(false);
  const [lastLoginTime, setLastLoginTime] = useState<Date | null>(null);

  useEffect(() => {
    // Find the most recent lastActive timestamp from all sessions
    if (client.Session && client.Session.length > 0) {
      const sortedSessions = [...client.Session].sort(
        (a, b) =>
          new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
      );

      const mostRecentSession = sortedSessions[0];
      const lastActiveTime = new Date(mostRecentSession.lastActive);

      // Set last login time
      setLastLoginTime(lastActiveTime);

      // Consider client active if they have a session active in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      setIsActive(lastActiveTime > fiveMinutesAgo);
    }
  }, [client.Session]);

  // Format date
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get relative time
  const getRelativeTime = (date: Date | null) => {
    if (!date) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    // Convert to seconds
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return `${diffSec} seconds ago`;

    // Convert to minutes
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minutes ago`;

    // Convert to hours
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} hours ago`;

    // Convert to days
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} days ago`;

    // Convert to months
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) return `${diffMonth} months ago`;

    // Convert to years
    const diffYear = Math.floor(diffMonth / 12);
    return `${diffYear} years ago`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`/api/admin/users/${client.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update client");
      }

      toast({
        title: "Success",
        description: "Client profile updated successfully",
      });

      setIsEditing(false);
      onClientUpdated();
    } catch (error) {
      console.error("Error updating client:", error);
      toast({
        title: "Error",
        description: "Failed to update client profile. Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Client Profile</CardTitle>
              <CardDescription>Basic client information</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={client.image || "/placeholder.svg"} />
                <AvatarFallback>
                  {client.username?.slice(0, 2).toUpperCase() ||
                    client.email.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">
                {client.username || "No username"}
              </h3>
              {client.fullname && (
                <p className="text-muted-foreground">{client.fullname}</p>
              )}
              <p className="text-sm mt-1">{client.email}</p>
              <div className="flex flex-wrap gap-1 mt-3 justify-center">
                {client.permissions && client.permissions.length > 0 ? (
                  client.permissions.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs">
                    No roles
                  </Badge>
                )}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isActive ? "bg-green-500" : "bg-amber-500"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isActive ? "text-green-500" : "text-amber-500"
                  }`}
                >
                  {isActive ? "Currently active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Account Details</CardTitle>
                <CardDescription>
                  Manage client account information
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullname">Full Name</Label>
                        <Input
                          id="fullname"
                          name="fullname"
                          value={formData.fullname}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Input
                          id="language"
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Input
                          id="theme"
                          name="theme"
                          value={formData.theme}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={formData.active}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("active", checked)
                          }
                        />
                        <Label htmlFor="active">Active Account</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="locked"
                          checked={formData.locked}
                          onCheckedChange={(checked) =>
                            handleSwitchChange("locked", checked)
                          }
                        />
                        <Label htmlFor="locked">Account Locked</Label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Client ID</Label>
                      <p className="text-sm font-mono">{client.id}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">
                        Email Verification
                      </Label>
                      <p className="text-sm flex items-center">
                        {client.emailVerified ? (
                          <>
                            <Check className="h-4 w-4 text-green-500 mr-1" />
                            Verified on {formatDate(client.emailVerified)}
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 text-amber-500 mr-1" />
                            Not verified
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Username</Label>
                      <p className="text-sm flex items-center">
                        <User className="h-4 w-4 text-muted-foreground mr-1" />
                        {client.username || "No username"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Full Name</Label>
                      <p className="text-sm">
                        {client.fullname || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="text-sm">
                      {client.description || "No description"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Language</Label>
                      <p className="text-sm flex items-center">
                        <Globe className="h-4 w-4 text-muted-foreground mr-1" />
                        {client.language || "English (default)"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">Theme</Label>
                      <p className="text-sm">
                        {client.theme
                          ? client.theme === "dark"
                            ? "Dark"
                            : "Light"
                          : "System default"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">
                        Account Status
                      </Label>
                      <div className="text-sm flex items-center">
                        {client.active ? (
                          <Badge className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">
                        Account Lock
                      </Label>
                      <p className="text-sm flex items-center">
                        <Lock className="h-4 w-4 text-muted-foreground mr-1" />
                        {client.locked ? "Locked" : "Unlocked"}
                      </p>
                    </div>
                  </div>

                  {client.verificationToken && (
                    <div className="space-y-1">
                      <Label className="text-muted-foreground">
                        Verification Token
                      </Label>
                      <p className="text-sm font-mono">
                        {client.verificationToken}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Timeline</CardTitle>
          <CardDescription>
            Important dates and events for this client
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-muted-foreground">Registration Date</Label>
              <p className="text-sm">{formatDate(client.createdAt)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Last Login</Label>
              <div className="flex flex-col">
                <p className="text-sm">{getRelativeTime(lastLoginTime)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(lastLoginTime)}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">Active Sessions</Label>
              <p className="text-sm">{client.Session?.length || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
