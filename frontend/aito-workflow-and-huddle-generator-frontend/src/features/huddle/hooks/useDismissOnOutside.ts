import { useEffect, type RefObject } from "react";

/**
 * Closes a popover on an outside click or Escape. This codebase has no Popover
 * primitive, so every hand-rolled panel needs this and they should all behave alike.
 */
export function useDismissOnOutside(open: boolean, containerRef: RefObject<HTMLElement | null>, onDismiss: () => void) {
  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) onDismiss();
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, containerRef, onDismiss]);
}
