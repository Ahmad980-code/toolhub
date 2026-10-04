"use client";

import { useState } from "react";
import { Button, CopyButton, inputClass } from "@/components/ui";

function encode(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function decode(b64: string) {
  const clean = b64.trim().replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export default function Base64Tool() {
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  let output = "";
  let error = "";
  if (input) {
    try {
      output = mode === "encode" ? encode(input) : decode(input);
    } catch {
      error = "That isn't valid Base64 (or it doesn't decode to UTF-8 text).";
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex gap-2">
        <Button active={mode === "encode"} onClick={() => setMode("encode")}>Encode</Button>
        <Button active={mode === "decode"} onClick={() => setMode("decode")}>Decode</Button>
        <Button
          className="ml-auto"
          disabled={!output}
          onClick={() => {
            setInput(output);
            setMode(mode === "encode" ? "decode" : "encode");
          }}
        >
          ⇅ Swap
        </Button>
      </div>
      <textarea
        className={`${inputClass} min-h-40 resize-y font-mono text-sm`}
        placeholder={mode === "encode" ? "Text to encode…" : "Base64 to decode…"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        spellCheck={false}
        aria-label="Input"
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
      <textarea
        readOnly
        className={`${inputClass} min-h-40 resize-y font-mono text-sm`}
        value={output}
        placeholder="Result appears here"
        aria-label="Output"
      />
      <div><CopyButton text={output} /></div>
    </div>
  );
}
