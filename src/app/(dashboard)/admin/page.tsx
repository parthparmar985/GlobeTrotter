// src/app/(dashboard)/admin/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import {
  getPlatformStats,
  getTopCities,
  getTopActivities,
  getTripsOverTime,
  getAllUsers,
} from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopItemsBarChart, TripsOverTimeChart } from "@/components/admin-charts";
import { UserManagementTable } from "@/components/user-management-table";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  const [stats, topCities, topActivities, tripsOverTime, users] = await Promise.all([
    getPlatformStats(),
    getTopCities(),
    getTopActivities(),
    getTripsOverTime(),
    getAllUsers(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-slate-600">Platform usage, trends, and user management.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Users</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalUsers}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Trips</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalTrips}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Stops</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalStops}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Activities booked</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.totalActivitiesBooked}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-xs text-slate-500">Public trips</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{stats.publicTrips}</p></CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Top cities</CardTitle></CardHeader>
          <CardContent>
            <TopItemsBarChart data={topCities} dataKey="tripCount" nameKey="name" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Top activities</CardTitle></CardHeader>
          <CardContent>
            <TopItemsBarChart data={topActivities} dataKey="bookedCount" nameKey="name" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Trips created over time</CardTitle></CardHeader>
          <CardContent>
            <TripsOverTimeChart data={tripsOverTime} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">User management</h2>
        <UserManagementTable users={JSON.parse(JSON.stringify(users))} currentUserId={session.user.id} />
      </div>
    </div>
  );
}