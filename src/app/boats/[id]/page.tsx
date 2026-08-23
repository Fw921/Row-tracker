import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { PageHeader } from "@/components/ui";
import { BoatSeatEditor } from "@/components/BoatSeatEditor";
import { DeleteBoatButton } from "@/components/DeleteBoatButton";
import { BOAT_CLASS_INFO } from "@/lib/boats";

export const dynamic = "force-dynamic";

export default async function BoatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [boat, athletes] = await Promise.all([
    prisma.boat.findFirst({
      where: { id, userId: user.id },
      include: { seats: { include: { athlete: { select: { id: true, name: true } } } } },
    }),
    prisma.athlete.findMany({
      where: { userId: user.id, archived: false },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!boat) notFound();

  const info = BOAT_CLASS_INFO[boat.boatClass];

  return (
    <div className="max-w-lg">
      <Link
        href="/boats"
        className="mb-2 flex items-center gap-0.5 text-sm font-medium text-accent hover:text-accent-strong"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Boats
      </Link>

      <PageHeader
        title={boat.name || info.label}
        description={boat.name ? info.label : undefined}
        action={<DeleteBoatButton id={boat.id} />}
      />

      <BoatSeatEditor
        boat={{
          id: boat.id,
          name: boat.name,
          boatClass: boat.boatClass,
          seats: boat.seats.map((s) => ({ seatIndex: s.seatIndex, athleteId: s.athleteId })),
        }}
        athletes={athletes}
      />
    </div>
  );
}
