"use client";

import React, { useEffect, useState } from "react";
import { Users, Search, Ban, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/lib/types";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const url = roleFilter ? `/api/admin/users?role=${roleFilter}` : "/api/admin/users";
      const res = await fetch(url);
      const data = await res.json();
      if (data.ok) setUsers(data.data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const toggleSuspend = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSuspended: !currentStatus }),
      });
      if (res.ok) {
        toast.info(currentStatus ? "User unsuspended" : "User suspended");
        fetchUsers();
      }
    } catch {
      toast.error("Error updating user status");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Control rider, driver, and administrative access</p>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="rider">Riders</option>
          <option value="driver">Drivers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900">{u.fullName}</td>
                  <td className="p-4 text-slate-500">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 uppercase font-extrabold text-[10px]">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.isSuspended ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {u.isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== "admin" && (
                      <Button
                        onClick={() => toggleSuspend(u.id, u.isSuspended)}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs"
                      >
                        {u.isSuspended ? "Unsuspend" : "Suspend"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

