"use client";

import { useEffect, useRef } from "react";

export function useModalBack(open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  const openRef = useRef(open);
  const pushedRef = useRef(false);

  onCloseRef.current = onClose;
  openRef.current = open;

  useEffect(() => {
    if (!open) return;
    const marker = "__kantinModal";
    history.pushState({ ...(history.state || {}), [marker]: true }, "", window.location.href);
    pushedRef.current = true;
    let popped = false;

    const onPop = () => {
      popped = true;
      pushedRef.current = false;
      if (openRef.current) {
        onCloseRef.current();
      }
    };

    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (pushedRef.current && !popped) {
        pushedRef.current = false;
        history.replaceState(history.state, "", window.location.href);
      }
    };
  }, [open]);
}
