"use client";

import { useState } from "react";
import { Button, CopyButton, inputClass } from "@/components/ui";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [indent, setIndent] = useState(2);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  function run(mode: "format" | "minify" | "validate") {
    try {
      const parsed = JSON.parse(input);
      if (mode === "format") setOutput(JSON.stringify(parsed, null, indent));
      if (mode === "minify") setOutput(JSON.stringify(parsed));
      setStatus({ ok: true, message: "Valid JSON ✓" });
    } catch (e) {
      setStatus({ ok: false, message: e instanceof Error ? e.message : "Invalid JSON" });
    }
  }

  return (
    <div className="grid gap-4">
      <textarea
        className={`${inputClass} min-h-56 resize-y font-mono text-sm`}
        placeholder='Paste JSON here, e.g. {"name":"Ada","skills":["math","code"]}'
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setStatus(null);
        }}
        spellCheck={false}
        aria-label="JSON input"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button active onClick={() => run("format")} disabled={!input.trim()}>Format</Button>
        <Button onClick={() => run("minify")} disabled={!input.trim()}>Minify</Button>
        <Button onClick={() => run("validate")} disabled={!input.trim()}>Validate</Button>
        <label className="ml-auto flex items-center gap-2 text-sm text-muted">
          Indent
          <select
            className={`${inputClass} w-auto py-1.5`}
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 space</option>
          </select>
        </label>
      </div>
      {status && (
        <p className={`text-sm font-medium ${status.ok ? "text-emerald-500" : "text-red-500"}`} role="status">
          {status.message}
        </p>
      )}
      {output && (
        <>
          <textarea
            readOnly
            className={`${inputClass} min-h-56 resize-y font-mono text-sm`}
            value={output}
            aria-label="Formatted JSON"
          />
          <div><CopyButton text={output} /></div>
        </>
      )}
    </div>
  );
}
