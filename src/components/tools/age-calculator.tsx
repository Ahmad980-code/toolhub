"use client";

import { useState } from "react";
import { Field, Stat, fmt, inputClass } from "@/components/ui";

const DAY = 86_400_000;

function parseDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return y && m && d ? new Date(y, m - 1, d) : null;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function ageBetween(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  let days = to.getDate() - from.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(to.getFullYear(), to.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function daysUntilNextBirthday(birth: Date, to: Date) {
  let next = new Date(to.getFullYear(), birth.getMonth(), birth.getDate());
  if (next < to) next = new Date(to.getFullYear() + 1, birth.getMonth(), birth.getDate());
  return Math.round((next.getTime() - to.getTime()) / DAY);
}

export default function AgeCalculator() {
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState("");

  const birth = parseDate(dob);
  const ref = asOf ? parseDate(asOf) : birth ? startOfToday() : null;
  const valid = birth && ref && ref >= birth;
  const age = valid ? ageBetween(birth, ref) : null;
  const nextIn = valid ? daysUntilNextBirthday(birth, ref) : null;

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date of birth">
          <input type="date" className={inputClass} value={dob} onChange={(e) => setDob(e.target.value)} />
        </Field>
        <Field label="Age as of (leave empty for today)">
          <input type="date" className={inputClass} value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </Field>
      </div>

      {birth && ref && !valid && (
        <p className="text-sm text-red-500">The “as of” date must be on or after the date of birth.</p>
      )}

      {age && birth && ref && (
        <>
          <Stat
            highlight
            label="Age"
            value={`${age.years} years, ${age.months} months, ${age.days} days`}
          />
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Total months" value={fmt(age.years * 12 + age.months)} />
            <Stat label="Total days" value={fmt(Math.round((ref.getTime() - birth.getTime()) / DAY))} />
            <Stat
              label="Next birthday"
              value={nextIn === 0 ? "Today! 🎉" : `in ${fmt(nextIn ?? 0)} days`}
            />
          </div>
        </>
      )}
    </div>
  );
}
