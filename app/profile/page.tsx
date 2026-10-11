"use client";

import React, { useEffect, useState } from "react";
import { User, Phone, Mail, ShieldAlert, Plus, Trash2, CheckCircle2, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Profile, EmergencyContact } from "@/lib/types";
import { toast } from "sonner";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [activeTab, setActiveTab] = useState<"personal" | "contacts" | "preferences">("personal");

  // Edit personal fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // New emergency contact fields
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok && res.data) {
          setProfile(res.data.profile);
          setFullName(res.data.profile.fullName || "");
          setPhone(res.data.profile.phone || "");
        }
      });

    fetch("/api/me/emergency-contacts")
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) setContacts(res.data);
      });
  }, []);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, phone }),
      });
      const data = await res.json();
      if (data.ok) {
        setProfile(data.data);
        toast.success("Profile saved successfully");
      } else {
        toast.error("Failed to save profile");
      }
    } catch {
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;

    try {
      const res = await fetch("/api/me/emergency-contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newContactName,
          phone: newContactPhone,
          email: newContactEmail || undefined,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setContacts([...contacts, data.data]);
        setNewContactName("");
        setNewContactPhone("");
        setNewContactEmail("");
        toast.success("Emergency contact added");
      } else {
        toast.error(data.error?.message || "Could not add contact");
      }
    } catch {
      toast.error("Error adding contact");
    }
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const res = await fetch(`/api/me/emergency-contacts/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setContacts(contacts.filter((c) => c.id !== id));
        toast.success("Contact removed");
      }
    } catch {
      toast.error("Error removing contact");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage your personal information and safety preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("personal")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "personal"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Personal Info
        </button>
        <button
          onClick={() => setActiveTab("contacts")}
          className={`pb-3 border-b-2 transition-colors cursor-pointer ${
            activeTab === "contacts"
              ? "border-emerald-600 text-emerald-800"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Emergency Contacts ({contacts.length}/5)
        </button>
      </div>

      {/* Tab: Personal */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Email Address (Read-only)</label>
            <input
              type="email"
              disabled
              value={profile?.email || ""}
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
              className="mt-1 w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <Button onClick={handleSaveProfile} isLoading={isSaving} size="md">
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Tab: Emergency Contacts */}
      {activeTab === "contacts" && (
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs text-red-900 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
            <span>Emergency contacts will receive instant SMS/email tracking links whenever you press SOS.</span>
          </div>

          {/* Contact list */}
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-slate-900">{contact.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{contact.phone} {contact.email && `· ${contact.email}`}</div>
                </div>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add form */}
          {contacts.length < 5 && (
            <form onSubmit={handleAddContact} className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Add New Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="tel"
                  placeholder="Phone (+91...)"
                  required
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Button type="submit" size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Emergency Contact
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

