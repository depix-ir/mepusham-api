"use client";

import React, { useState } from "react";
import { User, UserRole } from "@/types/auth";
import { authService, MOCK_ADMIN_USER } from "@/lib/auth/authService";
import { useToast } from "@/components/ui/Toast";
import { Shield, Plus, Edit2, Trash2, UserCheck, CheckCircle2, XCircle } from "lucide-react";

const INITIAL_ADMIN_USERS: User[] = [
  MOCK_ADMIN_USER,
  {
    id: "admin-2",
    phone: "09121112233",
    firstName: "سارا",
    lastName: "احمدی",
    createdAt: "۱۴۰۳/۰۲/۱۵",
    role: "admin",
    email: "sara@mepusham.ir",
    isActive: true,
  },
  {
    id: "admin-3",
    phone: "09123334455",
    firstName: "رضا",
    lastName: "محمدی",
    createdAt: "۱۴۰۳/۰۴/۰۱",
    role: "admin",
    email: "reza@mepusham.ir",
    isActive: false,
  },
];

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(INITIAL_ADMIN_USERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    role: "admin" as UserRole,
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      role: "admin",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email || "",
      role: user.role || "admin",
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showToast("نام و نام خانوادگی الزامی است.", "error");
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                firstName: formData.firstName,
                lastName: formData.lastName,
                phone: formData.phone,
                email: formData.email,
                role: formData.role,
              }
            : u
        )
      );
      showToast("اطلاعات مدیر با موفقیت به‌روزرسانی شد.", "success");
    } else {
      const newUser: User = {
        id: `admin-${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || "09120000000",
        email: formData.email,
        role: formData.role,
        createdAt: new Date().toLocaleDateString("fa-IR"),
        isActive: true,
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast("مدیر جدید با موفقیت اضافه شد.", "success");
    }

    setIsModalOpen(false);
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
    showToast("وضعیت دسترسی تغییر یافت.", "info");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span>مدیریت مدیران و دسترسی‌ها (RBAC)</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            تعریف نقش‌ها، سطح دسترسی و مدیران پنل مدیریت
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن مدیر جدید</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-background border border-border-subtle rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-surface-subtle text-muted-foreground border-b border-border-subtle font-bold">
              <tr>
                <th className="p-4">نام مدیر</th>
                <th className="p-4">شماره همراه / ایمیل</th>
                <th className="p-4">نقش سازمانی</th>
                <th className="p-4">تاریخ عضویت</th>
                <th className="p-4">وضعیت</th>
                <th className="p-4 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle font-medium">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-subtle/40 transition-colors">
                  <td className="p-4 font-bold text-foreground">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="p-4 text-muted-foreground font-mono">
                    {u.phone} {u.email ? `(${u.email})` : ""}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                      u.role === "super_admin"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-blue-100 text-blue-800"
                    }`}>
                      {u.role === "super_admin" ? "مدیر ارشد (Super Admin)" : "مدیر سیستم (Admin)"}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{u.createdAt}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 font-bold ${
                      u.isActive ? "text-emerald-600" : "text-muted-foreground"
                    }`}>
                      {u.isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>فعال</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>غیرفعال</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-4 text-left">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u.id)}
                        className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
                        title="تغییر وضعیت فعال/غیرفعال"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
                        title="ویرایش"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border-subtle rounded-2xl w-full max-w-md p-6 space-y-4 shadow-lg dir-rtl">
            <h3 className="font-bold text-base text-foreground">
              {editingUser ? "ویرایش اطلاعات مدیر" : "افزودن مدیر جدید"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium">نام</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-medium">نام خانوادگی</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">شماره همراه</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0912xxxxxxx"
                  className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">ایمیل</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@mepusham.ir"
                  className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-medium">نقش سازمانی</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full h-10 px-3 border border-border-subtle rounded-xl bg-background text-foreground"
                >
                  <option value="admin">مدیر سیستم (Admin)</option>
                  <option value="super_admin">مدیر ارشد (Super Admin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border-subtle rounded-xl font-bold hover:bg-surface-subtle cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 cursor-pointer"
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
