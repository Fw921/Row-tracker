"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui";

/**
 * Row Tracker has no sessions to end (see src/lib/current-user.ts — every
 * request already resolves the same single account), so this doesn't call
 * an API — it just sends you back to the public landing page, same as a
 * real log-out would from the user's point of view.
 */
export function LogOutButton() {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant="secondary"
      onClick={() => {
        toast.info("Row Tracker has one account and no sessions yet — this just takes you back to the landing page.");
        router.push("/");
      }}
    >
      Log out
    </Button>
  );
}
