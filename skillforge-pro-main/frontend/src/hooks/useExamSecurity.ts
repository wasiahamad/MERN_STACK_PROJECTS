import { useCallback, useEffect, useRef, useState } from "react";

export type ExamSecurityOptions = {
  enabled: boolean;
  /** Default: 2 (1 warning, then auto-submit/fail) */
  maxViolations?: number;
  onFirstViolation?: () => void;
  onMaxViolations?: (count: number) => void;
};

/**
 * Frontend-only exam security/anti-cheat.
 *
 * Important notes:
 * - Browsers cannot reliably block Alt+Tab / OS-level shortcuts.
 * - We detect focus loss (blur/visibility change) and treat it as a violation.
 */
export function useExamSecurity({
  enabled,
  maxViolations = 2,
  onFirstViolation,
  onMaxViolations,
}: ExamSecurityOptions) {
  const [violationCount, setViolationCount] = useState(0);
  const firstViolationFired = useRef(false);

  const registerViolation = useCallback(
    (reason: string) => {
      setViolationCount((prev) => {
        const next = prev + 1;
        if (next === 1 && !firstViolationFired.current) {
          firstViolationFired.current = true;
          onFirstViolation?.();
        }
        if (next >= maxViolations) {
          onMaxViolations?.(next);
        }
        return next;
      });

      // eslint-disable-next-line no-console
      console.warn("Exam security violation:", reason);
    },
    [maxViolations, onFirstViolation, onMaxViolations]
  );

  useEffect(() => {
    if (!enabled) return;

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      registerViolation("contextmenu");
    };

    const onCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      registerViolation("copy");
    };

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      registerViolation("paste");
    };

    const onCut = (e: ClipboardEvent) => {
      e.preventDefault();
      registerViolation("cut");
    };

    const onSelectStart = (e: Event) => {
      e.preventDefault();
      registerViolation("selectstart");
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const key = String(e.key || "").toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;

      // Block common shortcuts
      const blocked =
        (ctrl && ["c", "v", "x", "a", "p"].includes(key)) ||
        (ctrl && key === "tab") ||
        e.altKey;

      if (blocked) {
        e.preventDefault();
        registerViolation(`keydown:${key}`);
      }

      // Prevent refresh/navigation keys
      if (key === "f5" || (ctrl && key === "r")) {
        e.preventDefault();
        registerViolation("refresh");
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        registerViolation("visibilitychange");
      }
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        registerViolation("fullscreen_exit");
      }
    };

    const onBlur = () => {
      registerViolation("window_blur");
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    document.addEventListener("cut", onCut);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("selectstart", onSelectStart);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("blur", onBlur);
    };
  }, [enabled, registerViolation]);

  const requestFullscreen = useCallback(async () => {
    if (!enabled) return;
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // If fullscreen fails (browser policy), we treat it as a violation but continue.
      registerViolation("fullscreen_denied");
    }
  }, [enabled, registerViolation]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // ignore
    }
  }, []);

  return {
    violationCount,
    requestFullscreen,
    exitFullscreen,
  };
}
