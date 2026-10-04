import Link from "next/link";
import { ArrowRight, Landmark, Lock, MousePointerClick, Search, Sparkles, SquareCheckBig, Zap } from "lucide-react";
import { buttonClass, iconTileClass } from "@/components/ui-styles";

const features = [
  { icon: Zap, title: "Instant results", text: "Answers update as you type. No page reloads, no waiting." },
  {
    icon: Lock,
    title: "Private by design",
    text: "Everything runs in your browser. Your data never leaves your device.",
  },
  { icon: Sparkles, title: "Free forever", text: "No sign-up, no paywall, no limits. Just open a tool and use it." },
  {
    icon: Landmark,
    title: "Built for Pakistan",
    text: "FBR salary tax slabs, zakat, WAPDA bill estimates and rupees in lakh and crore.",
  },
];

const steps = [
  { icon: Search, title: "Find a tool", text: "Search by name or browse the categories. Press / to start typing." },
  {
    icon: MousePointerClick,
    title: "Add your details",
    text: "Type a few numbers, paste text or drop in a file. Nothing is uploaded.",
  },
  {
    icon: SquareCheckBig,
    title: "Get the answer",
    text: "Results appear instantly. Copy, download or tweak the inputs to compare.",
  },
];

/** Value props ("Why ToolHub") and a three-step "How it works". */
export function WhySection() {
  return (
    <>
      <section aria-labelledby="why-heading" className="mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-6">
        <div className="max-w-2xl">
          <h2 id="why-heading" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Simple tools, done properly
          </h2>
          <p className="mt-2 text-[15px] leading-7 text-muted sm:text-base">
            No clutter, no accounts and no waiting. Just the answer you came for.
          </p>
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: FeatureIcon, title, text }) => (
            <li key={title} className="rounded-xl border border-border bg-card p-5 shadow-xs">
              <span className={iconTileClass("md")}>
                <FeatureIcon aria-hidden />
              </span>
              <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-heading" className="mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-6">
        <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-10">
          <div aria-hidden className="absolute inset-0 -z-10 bg-grid mask-fade opacity-70" />
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-14">
            <div>
              <h2 id="how-heading" className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                How it works
              </h2>
              <p className="mt-2 text-[15px] leading-7 text-muted sm:text-base">
                Every tool follows the same three steps, so the next one you open already feels familiar.
              </p>
              <Link href="#tools" className={buttonClass({ variant: "secondary", className: "mt-6" })}>
                Browse all tools
                <ArrowRight aria-hidden />
              </Link>
            </div>
            <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
              {steps.map(({ icon: StepIcon, title, text }, i) => (
                <li key={title} className="relative">
                  {i < steps.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute top-5 left-14 hidden h-px w-[calc(100%-3.5rem)] bg-linear-to-r from-border-strong to-transparent sm:block"
                    />
                  )}
                  <span className="relative grid size-10 place-items-center rounded-full border border-border bg-card text-accent shadow-xs">
                    <StepIcon aria-hidden className="size-[18px]" />
                  </span>
                  <p className="mt-4 text-xs font-medium text-muted">Step {i + 1}</p>
                  <h3 className="mt-1 text-[15px] font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}
