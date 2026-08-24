import { Sailboat } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/ui";
import { BoatsManager } from "@/components/BoatsManager";

export const dynamic = "force-dynamic";

export default async function BoatsPage() {
  const user = await getCurrentUser();
  const boats = await prisma.boat.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { seats: { include: { athlete: { select: { id: true, name: true } } } } },
  });

  return (
    <div>
      <PageHeader
        icon={<Sailboat className="h-4.5 w-4.5" aria-hidden />}
        title="Boats"
        description="Build lineups from your roster — pick a class, then fill the seats."
      />
      <BoatsManager boats={boats} />
    </div>
  );
}
