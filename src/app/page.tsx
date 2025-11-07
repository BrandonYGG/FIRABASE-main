'use client';
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold font-headline tracking-tight">
                Panel de Administrador
            </h1>
            <AdminDashboard />
        </div>
    );
}
