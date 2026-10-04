"use client";

import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/developer/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    setBusy(false);
    if (res?.ok) router.refresh();
    else setError(res?.status === 401 ? "Wrong password" : "Couldn't log in. Try again.");
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Password" error={error ?? undefined}>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
          invalid={!!error}
        />
      </Field>
      <Button type="submit" variant="primary" disabled={busy || !password}>
        {busy ? <LoaderCircle className="animate-spin" /> : <LockKeyhole />} Log in
      </Button>
    </form>
  );
}
