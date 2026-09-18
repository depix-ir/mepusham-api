"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AdminRole, AdminUser } from "@/types/adminAuth";
import { adminAuthService } from "@/lib/admin-auth";
import { useAdminAuth } from "@/store/admin-auth/adminAuth.store";
import { useToast } from "@/components/ui/Toast";
import {
  Shield,
  Plus,
  Edit2,
  UserCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  KeyRound,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "مدیر ارشد (Super Admin)",
  admin: "مدیر کل سیستم (Admin)",
  orders: "مسئول سفارشات (Orders)",
  inventory: "مدیر انبار و محصولات (Inventory)",
  support: "پشتیبان مشتریان (Support)",
};

const ROLE_BADGE_CLASSES: Record<AdminRole, string> = {
  super_admin: "bg-purple-100 text-purple-800 border-purple-200",
  admin: "bg-blue-100 text-blue-800 border-blue-200",
  orders: "bg-amber-100 text-amber-800 border-amber-200",
  inventory: "bg-emerald-100 text-emerald-800 border-emerald-200",
  support: "bg-cyan-100 text-cyan-800 border-cyan-200",
};

export default function AdminUsersPage() {
  const { showToast } = useToast();
  const { admin: currentAdmin } = useAdminAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    phone: "",
    email: "",
    password: "",
    role: "admin" as AdminRole,
    isActive: true,
  });

  const loadUsers = useCallback(async () => {
    try {
      const list = await adminAuthService.listAdminUsers();
      setUsers(list);
    } catch (e) {
      console.error("Failed to load admin users:", e);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const isCurrentSuperAdmin = currentAdmin?.role === "super_admin";

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      username: "",
      phone: "",
      email: "",
      password: "",
      role: "orders",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    // Non-super-admins cannot edit super_admin users
    if (user.role === "super_admin" && !isCurrentSuperAdmin) {
      showToast("تنها مدیر ارشد می‌تواند حساب‌های Super Admin را ویرایش کند.", "error");
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      phone: user.phone,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      showToast("نام و نام خانوادگی الزامی است.", "error");
      return;
    }
    if (!formData.username.trim()) {
      showToast("نام کاربری الزامی است.", "error");
      return;
    }

    // Role elevation security check
    if (formData.role === "super_admin" && !isCurrentSuperAdmin) {
      showToast("تغییر یا اعطای نقش Super Admin مجاز نیست.", "error");
      return;
    }

    try {
      if (editingUser) {
        await adminAuthService.updateAdminUser(editingUser.id, {
          name: formData.name,
          username: formData.username,
          phone: formData.phone,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        });
        showToast("اطلاعات مدیر با موفقیت به‌روزرسانی شد.", "success");
      } else {
        await adminAuthService.createAdminUser({
          name: formData.name,
          username: formData.username,
          phone: formData.phone || "09120000000",
          email: formData.email || `${formData.username}@mepusham.ir`,
          role: formData.role,
          isActive: formData.isActive,
          password: formData.password || "admin123",
        });
        showToast("مدیر جدید با موفقیت ایجاد شد.", "success");
      }

      await loadUsers();
      setIsModalOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      } else {
        showToast("خطا در ذخیره‌سازی اطلاعات کاربر", "error");
      }
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.role === "super_admin" && !isCurrentSuperAdmin) {
      showToast("تغییر وضعیت مدیر ارشد مجاز نیست.", "error");
      return;
    }

    try {
      await adminAuthService.updateAdminUser(user.id, {
        isActive: !user.isActive,
      });
      await loadUsers();
      showToast(`وضعیت کاربر ${user.name} با موفقیت تغییر کرد.`, "info");
    } catch (err: unknown) {
      if (err instanceof Error) {
        showToast(err.message, "error");
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);

    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "inactive" && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span>مدیریت کاربران و دسترسی‌های ادمین (RBAC)</span>
          </h1>
          <p className="text-xs text-muted-foreground">
            تعریف نقش‌ها، سطح دسترسی و مدیران سیستم با تفکیک مسئولیت‌ها
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl hover:bg-primary/90 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن کاربر ادمین جدید</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-background border border-border rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="جستجوی نام، نام کاربری، ایمیل یا تلفن..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pr-9 pl-3 bg-surface-subtle border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span>نقش:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 bg-surface-subtle border border-border rounded-xl text-xs text-foreground"
          >
            <option value="all">همه نقش‌ها</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="orders">Orders</option>
            <option value="inventory">Inventory</option>
            <option value="support">Support</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 bg-surface-subtle border border-border rounded-xl text-xs text-foreground"
          >
            <option value="all">همه وضعیت‌ها</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-surface-subtle text-muted-foreground border-b border-border font-bold">
              <tr>
                <th className="p-4">نام کاربر</th>
                <th className="p-4">نام کاربری / ایمیل</th>
                <th className="p-4">شماره همراه</th>
                <th className="p-4">نقش سازمانی</th>
                <th className="p-4">وضعیت حساب</th>
                <th className="p-4">تاریخ ثبت</th>
                <th className="p-4 text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    هیچ کاربر ادمینی با مشخصات جستجو شده یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="p-4 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span>{u.name}</span>
                        {u.id === currentAdmin?.id && (
                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                            شما
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono dir-ltr text-right">
                      <div className="font-semibold text-foreground">{u.username}</div>
                      <div className="text-[11px] text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono">{u.phone}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg border font-bold text-[11px] ${
                          ROLE_BADGE_CLASSES[u.role] || "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 font-bold ${
                          u.isActive ? "text-emerald-600" : "text-error"
                        }`}
                      >
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
                    <td className="p-4 text-muted-foreground">{u.createdAt}</td>
                    <td className="p-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
                          title="تغییر وضعیت فعال / غیرفعال"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-muted-foreground hover:text-primary rounded-lg hover:bg-surface-subtle transition-colors cursor-pointer"
                          title="ویرایش کاربر"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl dir-rtl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">
                {editingUser ? `ویرایش کاربر: ${editingUser.name}` : "افزودن کاربر ادمین جدید"}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثلاً: علی رضایی"
                  className="w-full h-10 px-3 border border-border rounded-xl bg-surface-subtle text-foreground focus:bg-background focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">
                    نام کاربری
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="ali_rezaei"
                    className="w-full h-10 px-3 border border-border rounded-xl bg-surface-subtle text-foreground font-mono focus:bg-background focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">
                    شماره همراه
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0912xxxxxxx"
                    className="w-full h-10 px-3 border border-border rounded-xl bg-surface-subtle text-foreground font-mono focus:bg-background focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">ایمیل</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ali@mepusham.ir"
                  className="w-full h-10 px-3 border border-border rounded-xl bg-surface-subtle text-foreground focus:bg-background focus:border-primary"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>رمز عبور اولیه</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full h-10 px-3 border border-border rounded-xl bg-surface-subtle text-foreground focus:bg-background focus:border-primary"
                  />
                </div>
              )}

              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">
                  نقش سازمانی (Role)
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminRole })}
                  className="w-full h-10 px-3 border border-border rounded-xl bg-surface-subtle text-foreground focus:bg-background focus:border-primary font-semibold"
                >
                  <option value="orders">مسئول سفارشات (Orders)</option>
                  <option value="inventory">مدیر انبار و محصولات (Inventory)</option>
                  <option value="support">پشتیبان مشتریان (Support)</option>
                  <option value="admin">مدیر کل سیستم (Admin)</option>
                  {isCurrentSuperAdmin && <option value="super_admin">مدیر ارشد (Super Admin)</option>}
                </select>
              </div>

              {!isCurrentSuperAdmin && formData.role === "super_admin" && (
                <div className="p-2.5 bg-amber-50 text-amber-800 rounded-lg text-[11px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>تنها Super Admin مجاز به اعطای دسترسی مدیر ارشد است.</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-semibold text-foreground">
                  حساب کاربری فعال باشد
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  انصراف
                </Button>
                <Button type="submit" size="sm">
                  ذخیره اطلاعات
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
