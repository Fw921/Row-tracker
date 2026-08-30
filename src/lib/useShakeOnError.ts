"use client";

import { useEffect, useRef } from "react";

/**
 * Draws the eye to whatever just failed validation with a quick
 * left/right shake — adapted from transitions.dev's "error state shake"
 * transition (see `.t-shake` in globals.css for the keyframe itself;
 * `npx skills add Jakubantalik/transitions.dev` for the source). We reuse
 * our own Alert component for the error text rather than the library's
 * separate message element — this hook only owns the shake.
 *
 * Attach the returned ref to the element that should shake (an input, or
 * the Card wrapping a form whose error isn't tied to one field) and pass
 * whatever error state already drives your Alert. The shake replays each
 * time `error` changes from unset to a message.
 *
 * Known limitation: if the exact same error string is set twice in a row
 * (e.g. failing on the same duplicate name twice), React bails out of the
 * re-render since the value didn't change, so the shake won't replay the
 * second time — a cosmetic gap, not a correctness one.
 */
export function useShakeOnError<T extends HTMLElement>(error: string | null) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!error) return;
    const el = ref.current;
    if (!el) return;
    el.classList.remove("t-shake");
    void el.offsetWidth; // force reflow so the animation replays
    el.classList.add("t-shake");
  }, [error]);

  return ref;
}
