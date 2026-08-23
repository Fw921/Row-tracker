import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/ui";
import { RosterManager } from "@/components/RosterManager";

export const dynamic = "force-dynamic";

export default async function RosterPage() {
  const user = await getCurrentUser();
  const athletes = await prisma.athlete.findMany({
    where: { userId: user.id, archived: false },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        title="Roster"
        description="Everyone you might log a piece for. Add the boat once, then pick from this list whenever you enter a team piece."
      />
      <RosterManager athletes={athletes} />
    </div>
  );
}
