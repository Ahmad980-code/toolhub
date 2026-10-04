"use client";

import { Copy, Download, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Button,
  Callout,
  Checkbox,
  Field,
  Input,
  SegmentedControl,
  Select,
  Slider,
  Textarea,
  cn,
  focusRing,
} from "@/components/ui";
import { site } from "@/lib/site";
import { downloadBlob } from "./shared-media/files";
import { useDebounced } from "./shared-media/hooks";

type Kind = "url" | "text" | "wifi" | "whatsapp" | "phone" | "email" | "sms";
type Ecc = "L" | "M" | "Q" | "H";

const KINDS: { value: Kind; label: string }[] = [
  { value: "url", label: "Link" },
  { value: "text", label: "Text" },
  { value: "wifi", label: "Wi-Fi" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
];

/** Wi-Fi QR fields escape \ ; , : " with a backslash. */
const wifiEscape = (s: string) => s.replace(/([\\;,:"])/g, "\\$1");
const digits = (s: string) => s.replace(/[^\d+]/g, "");

function luminance(hex: string) {
  const v = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}

export default function QrCodeGenerator() {
  const [kind, setKind] = useState<Kind>("url");
  const [url, setUrl] = useState(site.url);
  const [text, setText] = useState("Assalam o Alaikum! Scan me.");
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState<"WPA" | "WEP" | "nopass">("WPA");
  const [hidden, setHidden] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [size, setSize] = useState("1024");
  const [ecc, setEcc] = useState<Ecc>("M");
  const [fg, setFg] = useState("#111827");
  const [bg, setBg] = useState("#ffffff");
  const [margin, setMargin] = useState(2);
  const [svg, setSvg] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  let payload = "";
  let hint: string | null = null;
  if (kind === "url") payload = url.trim() && !/^[a-z]+:/i.test(url.trim()) ? `https://${url.trim()}` : url.trim();
  else if (kind === "text") payload = text;
  else if (kind === "wifi") {
    payload = ssid
      ? `WIFI:T:${security};S:${wifiEscape(ssid)};${security === "nopass" ? "" : `P:${wifiEscape(password)};`}H:${hidden ? "true" : "false"};;`
      : "";
    if (!ssid) hint = "Enter the network name (SSID)";
  } else if (kind === "whatsapp") {
    const d = digits(phone).replace(/^\+/, "").replace(/^0(?=3)/, "92");
    payload = d ? `https://wa.me/${d}${message ? `?text=${encodeURIComponent(message)}` : ""}` : "";
    if (!d) hint = "Enter a phone number with country code, e.g. 923001234567";
  } else if (kind === "phone") {
    payload = digits(phone) ? `tel:${digits(phone)}` : "";
    if (!payload) hint = "Enter a phone number";
  } else if (kind === "email") {
    const q = [subject && `subject=${encodeURIComponent(subject)}`, message && `body=${encodeURIComponent(message)}`].filter(Boolean).join("&");
    payload = email.trim() ? `mailto:${email.trim()}${q ? `?${q}` : ""}` : "";
    if (!payload) hint = "Enter an email address";
  } else if (kind === "sms") {
    payload = digits(phone) ? `SMSTO:${digits(phone)}:${message}` : "";
    if (!payload) hint = "Enter a phone number";
  }

  const debounced = useDebounced(`${payload}\u0000${ecc}\u0000${fg}\u0000${bg}\u0000${margin}`, 150);

  useEffect(() => {
    const [p, e, dark, light, m] = debounced.split("\u0000");
    let alive = true;
    if (!p) {
      Promise.resolve().then(() => alive && setSvg(""));
      return () => {
        alive = false;
      };
    }
    import("qrcode")
      .then((QR) =>
        QR.toString(p, { type: "svg", errorCorrectionLevel: e as Ecc, margin: Number(m), color: { dark, light } }),
      )
      .then((s) => {
        if (!alive) return;
        setSvg(s);
        setError(null);
      })
      .catch(() => {
        if (!alive) return;
        setSvg("");
        setError("That's too much data for one QR code. Shorten the text or lower the error correction.");
      });
    return () => {
      alive = false;
    };
  }, [debounced]);

  const contrast = (Math.max(luminance(fg), luminance(bg)) + 0.05) / (Math.min(luminance(fg), luminance(bg)) + 0.05);
  const inverted = luminance(fg) > luminance(bg);

  async function pngBlob() {
    const QR = await import("qrcode");
    const dataUrl = await QR.toDataURL(payload, {
      width: Number(size),
      errorCorrectionLevel: ecc,
      margin,
      color: { dark: fg, light: bg },
    });
    return (await fetch(dataUrl)).blob();
  }

  async function copyImage() {
    try {
      const blob = await pngBlob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Your browser can't copy images. Use Download instead.");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-start">
      <div className="grid gap-5">
        <div role="radiogroup" aria-label="QR code type" className="flex flex-wrap gap-2">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              role="radio"
              aria-checked={kind === k.value}
              onClick={() => setKind(k.value)}
              className={cn(
                "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors",
                focusRing,
                kind === k.value
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border bg-card text-muted hover:border-border-hover hover:text-foreground",
              )}
            >
              {k.label}
            </button>
          ))}
        </div>

        {kind === "url" && (
          <Field label="Website link">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" inputMode="url" spellCheck={false} />
          </Field>
        )}
        {kind === "text" && (
          <Field label="Text">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-28" />
          </Field>
        )}
        {kind === "wifi" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Network name (SSID)">
              <Input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="Home WiFi" spellCheck={false} />
            </Field>
            <Field label="Password">
              <Input value={password} onChange={(e) => setPassword(e.target.value)} disabled={security === "nopass"} spellCheck={false} />
            </Field>
            <Field label="Security">
              <Select value={security} onChange={(e) => setSecurity(e.target.value as "WPA" | "WEP" | "nopass")}>
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">No password</option>
              </Select>
            </Field>
            <div className="flex items-end pb-2">
              <Checkbox checked={hidden} onChange={setHidden} label="Hidden network" />
            </div>
          </div>
        )}
        {(kind === "whatsapp" || kind === "phone" || kind === "sms") && (
          <Field label="Phone number" hint={kind === "whatsapp" ? "With country code, e.g. 92 300 1234567" : undefined}>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="+92 300 1234567" />
          </Field>
        )}
        {kind === "email" && (
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email address">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" placeholder="name@example.com" />
            </Field>
            <Field label="Subject (optional)">
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </Field>
          </div>
        )}
        {(kind === "whatsapp" || kind === "email" || kind === "sms") && (
          <Field label="Message (optional)">
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-24" />
          </Field>
        )}

        <div className="grid gap-4 rounded-xl border border-border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Error correction" as="group" hint="Higher survives damage or a logo, but is denser">
              <SegmentedControl
                label="Error correction"
                value={ecc}
                onChange={setEcc}
                fullWidth
                size="sm"
                options={[
                  { value: "L", label: "L" },
                  { value: "M", label: "M" },
                  { value: "Q", label: "Q" },
                  { value: "H", label: "H" },
                ]}
              />
            </Field>
            <Field label="Download size">
              <Select value={size} onChange={(e) => setSize(e.target.value)}>
                <option value="512">512 × 512 px</option>
                <option value="1024">1024 × 1024 px</option>
                <option value="2048">2048 × 2048 px (print)</option>
              </Select>
            </Field>
            <Field label="Colours" as="group">
              <div className="flex items-center gap-3">
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} aria-label="Foreground colour" className="h-11 w-14 cursor-pointer rounded-lg border border-border-strong bg-card p-1" />
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} aria-label="Background colour" className="h-11 w-14 cursor-pointer rounded-lg border border-border-strong bg-card p-1" />
                <Button size="sm" variant="ghost" onClick={() => { setFg("#111827"); setBg("#ffffff"); }}>
                  Reset
                </Button>
              </div>
            </Field>
            <Field label="Quiet zone (margin)" aside={margin}>
              <Slider value={margin} onChange={setMargin} min={0} max={8} />
            </Field>
          </div>
          {(contrast < 3 || inverted) && (
            <Callout tone="warning" icon={<TriangleAlert />}>
              {inverted
                ? "Light codes on a dark background don't scan in many camera apps. Use a dark colour on a light background."
                : "The colours are too similar; phones may not scan this code."}
            </Callout>
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl bg-subtle p-4 sm:p-5 md:sticky md:top-24">
        <div className="mx-auto grid aspect-square w-full max-w-72 place-items-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border">
          {svg ? (
            <div className="size-full [&>svg]:size-full" role="img" aria-label="QR code preview" dangerouslySetInnerHTML={{ __html: svg }} />
          ) : (
            <p className="px-6 text-center text-sm text-neutral-500">{hint ?? "Your QR code will appear here"}</p>
          )}
        </div>
        {error && <p className="text-center text-sm text-danger">{error}</p>}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="primary" disabled={!svg} onClick={async () => downloadBlob(await pngBlob(), "qr-code.png")}>
            <Download /> PNG
          </Button>
          <Button disabled={!svg} onClick={() => downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "qr-code.svg")}>
            <Download /> SVG
          </Button>
          <Button variant="ghost" className="col-span-2" disabled={!svg} onClick={copyImage}>
            <Copy /> {copied ? "Copied!" : "Copy image"}
          </Button>
        </div>
        <p className="text-center text-[13px] text-muted">Always test the code with your phone camera before printing.</p>
      </div>
    </div>
  );
}
