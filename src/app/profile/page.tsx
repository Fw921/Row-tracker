import type { Metadata } from "next";
import { Activity, CircleUser, ClipboardList, Target } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { Avatar, Card, PageHeader, StatGrid, StatTile } from "@/components/ui";
import { ProfileForm } from "@/components/ProfileForm";
import { LogOutButton } from "@/components/LogOutButton";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Profile · Row Tracker" };

// Reflects the latest account data on every request, same as the other
// DB-backed pages (dashboard, history, team, roster) — never prerender.
export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  const [workoutCount, athleteCount, goalCount] = await Promise.all([
    prisma.workout.count({ where: { userId: user.id } }),
    prisma.athlete.count({ where: { userId: user.id } }),
    prisma.goal.count({ where: { userId: user.id } }),
  ]);

  return (
    <div>
      <PageHeader
        icon={<CircleUser className="h-4.5 w-4.5" aria-hidden />}
        title="Profile"
        description="Your Row Tracker account."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <Avatar name={user.name ?? user.email} className="h-14 w-14 text-lg" />
              <div>
                <div className="font-display text-lg font-semibold tracking-tight text-foreground">
                  {user.name ?? "Unnamed"}
                </div>
                <div className="text-sm text-muted">{user.email}</div>
              </div>
            </div>
            <div className="mt-6 border-t border-border pt-6">
              <ProfileForm initialName={user.name ?? ""} />
            </div>
          </Card>

          <Card className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div>
              <div className="text-sm font-medium text-foreground">Member since</div>
              <div className="text-sm text-muted">{formatDate(user.createdAt)}</div>
            </div>
            <LogOutButton />
          </Card>
        </div>

        <StatGrid className="grid-cols-3 lg:grid-cols-1">
          <StatTile
            icon={<Activity className="h-4 w-4" aria-hidden />}
            label="Workouts logged"
            value="—"
            numericValue={workoutCount}
            format="count"
          />
          <StatTile
            icon={<ClipboardList className="h-4 w-4" aria-hidden />}
            label="Roster athletes"
            value="—"
            numericValue={athleteCount}
            format="count"
          />
          <StatTile
            icon={<Target className="h-4 w-4" aria-hidden />}
            label="Active goals"
            value="—"
            numericValue={goalCount}
            format="count"
          />
        </StatGrid>
      </div>
    </div>
  );
}
