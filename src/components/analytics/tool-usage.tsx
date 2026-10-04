"use client";

import { useRef, type ReactNode, type SyntheticEvent } from "react";
import { track } from "@/lib/analytics/client";

const INTERACTIVE = "button, a, input, select, textarea, label, summary, [role=radio], [role=switch], [role=tab]";

/**
 * Wraps a tool and records one anonymous "use" the first time a visitor interacts with it
 * (types, clicks a control, drops a file). Only the tool's slug is sent, never the input.
 * Give it `key={slug}` so moving between tools counts each one.
 */
export function ToolUsage({ slug, children }: { slug: string; children: ReactNode }) {
  const sent = useRef(false);
  const used = () => {
    if (sent.current) return;
    sent.current = true;
    track({ type: "tool_use", slug, path: location.pathname });
  };
  const onClick = (e: SyntheticEvent) => {
    if ((e.target as HTMLElement).closest?.(INTERACTIVE)) used();
  };
  return (
    <div onInputCapture={used} onChangeCapture={used} onClickCapture={onClick} onKeyDownCapture={used} onDropCapture={used}>
      {children}
    </div>
  );
}
