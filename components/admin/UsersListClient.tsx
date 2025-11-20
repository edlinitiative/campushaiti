"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { Mail, Calendar, Search, Filter, Ban } from "lucide-react";
import UserActions from "@/components/admin/UserActions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UsersListClient() {
  const t = useTranslations("admin.users");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("all");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (providerFilter !== "all") {
        params.append("provider", providerFilter);
      }
      
      const response = await fetch(`/api/admin/users/list?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [providerFilter]);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.displayName?.toLowerCase().includes(searchLower) ||
      user.fullName?.toLowerCase().includes(searchLower)
    );
  });

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "google":
        return <Badge variant="outline" className="bg-blue-50">Google</Badge>;
      case "password":
        return <Badge variant="outline" className="bg-green-50">Password</Badge>;
      case "phone":
        return <Badge variant="outline" className="bg-purple-50">Phone</Badge>;
      default:
        return <Badge variant="outline">{provider}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-red-100 text-red-800">{t("admin")}</Badge>;
      case "SCHOOL_ADMIN":
        return <Badge className="bg-blue-100 text-blue-800">{t("schoolAdmin")}</Badge>;
      case "APPLICANT":
        return <Badge variant="outline">{t("applicant")}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <>
      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={t("searchUsers")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={providerFilter} onValueChange={setProviderFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("allProviders")}</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">{t("loading")}</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">{t("noUsersFound")}</p>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user: any) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    user.disabled ? "bg-red-50 border-red-200" : "hover:bg-muted/50"
                  } transition-colors`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-medium">
                        {user.fullName || user.displayName || t("unnamedUser")}
                      </p>
                      {getRoleBadge(user.role)}
                      {getProviderBadge(user.primaryProvider)}
                      {user.disabled && (
                        <Badge variant="destructive" className="gap-1">
                          <Ban className="w-3 h-3" />
                          {t("disabled")}
                        </Badge>
                      )}
                      {!user.emailVerified && user.email && (
                        <Badge variant="outline" className="bg-yellow-50">
                          {t("unverified")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                        </div>
                      )}
                      {user.phoneNumber && (
                        <span>{user.phoneNumber}</span>
                      )}
                      {user.createdAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {t("joined", { date: new Date(user.createdAt).toLocaleDateString() })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <UserActions user={user} onUpdate={fetchUsers} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
