import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/ui";
import { TeamPieceForm } from "@/components/TeamPieceForm";

export const dynamic = "force-dynamic";

export default async function LogTeamPiecePage() {
  const user = await getCurrentUser();
  const athletes = await prisma.athlete.findMany({
    where: { userId: user.id, archived: false },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title="Log a team piece"
        description="Set the piece up once — everyone rowed the same distance or the same time — then enter each rower's result, just like calling out splits in the erg room."
      />
      <TeamPieceForm athletes={athletes} />
    </div>
  );
}
