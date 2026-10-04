"use client";

import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Field,
  Input,
  NumberInput,
  ResultCard,
  ResultsPanel,
  SegmentedControl,
  Select,
  Stat,
  Table,
  cn,
  fmt,
  focusRing,
  num,
} from "@/components/ui";

type Grade = { letter: string; min: number; points: number };
type ScaleId = "cui" | "us";

const SCALES: Record<ScaleId, { name: string; note: string; grades: Grade[] }> = {
  cui: {
    name: "COMSATS / HEC",
    note: "COMSATS University Islamabad absolute grading (HEC criteria), in use since Fall 2021.",
    grades: [
      { letter: "A", min: 85, points: 4.0 },
      { letter: "A-", min: 80, points: 3.66 },
      { letter: "B+", min: 75, points: 3.33 },
      { letter: "B", min: 71, points: 3.0 },
      { letter: "B-", min: 68, points: 2.66 },
      { letter: "C+", min: 64, points: 2.33 },
      { letter: "C", min: 61, points: 2.0 },
      { letter: "C-", min: 58, points: 1.66 },
      { letter: "D+", min: 54, points: 1.3 },
      { letter: "D", min: 50, points: 1.0 },
      { letter: "F", min: 0, points: 0 },
    ],
  },
  us: {
    name: "US 4.0",
    note: "A common US 4.0 scale. Universities differ, so check your own grading policy.",
    grades: [
      { letter: "A", min: 93, points: 4.0 },
      { letter: "A-", min: 90, points: 3.7 },
      { letter: "B+", min: 87, points: 3.3 },
      { letter: "B", min: 83, points: 3.0 },
      { letter: "B-", min: 80, points: 2.7 },
      { letter: "C+", min: 77, points: 2.3 },
      { letter: "C", min: 73, points: 2.0 },
      { letter: "C-", min: 70, points: 1.7 },
      { letter: "D+", min: 67, points: 1.3 },
      { letter: "D", min: 65, points: 1.0 },
      { letter: "F", min: 0, points: 0 },
    ],
  },
};

type Course = { id: number; name: string; credits: string; grade: string; marks: string };
type Semester = { id: number; name: string; gpa: string; credits: string };

const INITIAL_COURSES: Course[] = [
  { id: 1, name: "Programming Fundamentals", credits: "4", grade: "A-", marks: "82" },
  { id: 2, name: "Calculus & Analytical Geometry", credits: "3", grade: "B+", marks: "77" },
  { id: 3, name: "Applied Physics", credits: "3", grade: "B", marks: "72" },
  { id: 4, name: "English Composition", credits: "3", grade: "A", marks: "88" },
];
const INITIAL_SEMESTERS: Semester[] = [
  { id: 1, name: "Semester 1", gpa: "3.20", credits: "17" },
  { id: 2, name: "Semester 2", gpa: "3.51", credits: "13" },
];

function gradeForMarks(marks: number, scale: ScaleId) {
  const list = SCALES[scale].grades;
  return list.find((g) => marks >= g.min) ?? list[list.length - 1];
}

const two = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "");
const rowClass =
  "grid grid-cols-[1fr_1fr_auto] gap-2 rounded-xl border border-border bg-card p-3 sm:items-center sm:border-0 sm:bg-transparent sm:p-0";

export default function CgpaCalculator() {
  const [mode, setMode] = useState<"gpa" | "cgpa">("gpa");
  const [scale, setScale] = useState<ScaleId>("cui");
  const [entry, setEntry] = useState<"grades" | "marks">("grades");
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [semesters, setSemesters] = useState<Semester[]>(INITIAL_SEMESTERS);
  const [nextId, setNextId] = useState(10);

  const grades = SCALES[scale].grades;

  // Semester GPA from courses.
  let credits = 0;
  let points = 0;
  let counted = 0;
  for (const c of courses) {
    const cr = num(c.credits);
    if (!(cr > 0)) continue;
    let gp: number | undefined;
    if (entry === "grades") gp = grades.find((g) => g.letter === c.grade)?.points;
    else {
      const m = num(c.marks);
      if (m >= 0 && m <= 100) gp = gradeForMarks(m, scale).points;
    }
    if (gp === undefined) continue;
    credits += cr;
    points += cr * gp;
    counted++;
  }
  const gpa = credits > 0 ? points / credits : NaN;

  // CGPA from semesters.
  let semCredits = 0;
  let semPoints = 0;
  for (const s of semesters) {
    const cr = num(s.credits);
    const g = num(s.gpa);
    if (cr > 0 && g >= 0 && g <= 4) {
      semCredits += cr;
      semPoints += cr * g;
    }
  }
  const cgpa = semCredits > 0 ? semPoints / semCredits : NaN;

  const result = mode === "gpa" ? gpa : cgpa;
  const totalCredits = mode === "gpa" ? credits : semCredits;
  const totalPoints = mode === "gpa" ? points : semPoints;

  const updateCourse = (id: number, patch: Partial<Course>) =>
    setCourses((list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const updateSemester = (id: number, patch: Partial<Semester>) =>
    setSemesters((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  function addRow() {
    const id = nextId;
    setNextId(id + 1);
    if (mode === "gpa") setCourses((list) => [...list, { id, name: "", credits: "3", grade: "", marks: "" }]);
    else setSemesters((list) => [...list, { id, name: `Semester ${list.length + 1}`, gpa: "", credits: "" }]);
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Calculate" as="group">
          <SegmentedControl
            label="Calculate"
            value={mode}
            onChange={setMode}
            fullWidth
            options={[
              { value: "gpa", label: "Semester GPA" },
              { value: "cgpa", label: "CGPA" },
            ]}
          />
        </Field>
        <Field label="Grading scale">
          <Select value={scale} onChange={(e) => setScale(e.target.value as ScaleId)}>
            <option value="cui">COMSATS / HEC (4.0)</option>
            <option value="us">US 4.0 scale</option>
          </Select>
        </Field>
      </div>

      {mode === "gpa" ? (
        <div className="grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[15px] font-semibold text-foreground">Your courses</h3>
            <SegmentedControl
              label="Enter results as"
              value={entry}
              onChange={setEntry}
              size="sm"
              options={[
                { value: "grades", label: "Letter grades" },
                { value: "marks", label: "Marks %" },
              ]}
            />
          </div>
          <ul className="grid gap-3">
            {courses.map((c, i) => {
              const m = num(c.marks);
              const marksInvalid = c.marks.trim() !== "" && !(m >= 0 && m <= 100);
              const derived = entry === "marks" && m >= 0 && m <= 100 ? gradeForMarks(m, scale) : null;
              return (
                <li key={c.id} className={cn(rowClass, "sm:grid-cols-[minmax(0,1fr)_6.5rem_8.5rem_auto]")}>
                  <Input
                    className="col-span-3 sm:col-span-1"
                    value={c.name}
                    onChange={(e) => updateCourse(c.id, { name: e.target.value })}
                    placeholder={`Course ${i + 1} (optional)`}
                    aria-label={`Course ${i + 1} name`}
                  />
                  <NumberInput
                    value={c.credits}
                    onChange={(v) => updateCourse(c.id, { credits: v })}
                    min={0}
                    step="1"
                    inputMode="numeric"
                    suffix="cr"
                    aria-label={`Course ${i + 1} credit hours`}
                  />
                  {entry === "grades" ? (
                    <Select
                      value={c.grade}
                      onChange={(e) => updateCourse(c.id, { grade: e.target.value })}
                      aria-label={`Course ${i + 1} grade`}
                    >
                      <option value="">Grade</option>
                      {grades.map((g) => (
                        <option key={g.letter} value={g.letter}>
                          {g.letter} ({g.points.toFixed(2)})
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <NumberInput
                      value={c.marks}
                      onChange={(v) => updateCourse(c.id, { marks: v })}
                      min={0}
                      max={100}
                      suffix={derived ? derived.letter : "%"}
                      invalid={marksInvalid}
                      aria-label={`Course ${i + 1} marks out of 100`}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove course ${i + 1}`}
                    onClick={() => setCourses((list) => list.filter((x) => x.id !== c.id))}
                    disabled={courses.length === 1}
                  >
                    <Trash2 />
                  </Button>
                </li>
              );
            })}
          </ul>
          <div>
            <Button variant="soft" onClick={addRow}>
              <Plus /> Add course
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">Your semesters</h3>
            <p className="mt-1 text-sm text-muted">
              Already have a CGPA? Enter it as one row with your total credit hours so far, then add this semester.
            </p>
          </div>
          <ul className="grid gap-3">
            {semesters.map((s, i) => {
              const g = num(s.gpa);
              const gpaInvalid = s.gpa.trim() !== "" && !(g >= 0 && g <= 4);
              return (
                <li key={s.id} className={cn(rowClass, "sm:grid-cols-[minmax(0,1fr)_8rem_8rem_auto]")}>
                  <Input
                    className="col-span-3 sm:col-span-1"
                    value={s.name}
                    onChange={(e) => updateSemester(s.id, { name: e.target.value })}
                    placeholder={`Semester ${i + 1}`}
                    aria-label={`Semester ${i + 1} name`}
                  />
                  <NumberInput
                    value={s.gpa}
                    onChange={(v) => updateSemester(s.id, { gpa: v })}
                    min={0}
                    max={4}
                    step="0.01"
                    prefix="GPA"
                    invalid={gpaInvalid}
                    aria-label={`Semester ${i + 1} GPA`}
                  />
                  <NumberInput
                    value={s.credits}
                    onChange={(v) => updateSemester(s.id, { credits: v })}
                    min={0}
                    inputMode="numeric"
                    suffix="cr"
                    aria-label={`Semester ${i + 1} credit hours`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove semester ${i + 1}`}
                    onClick={() => setSemesters((list) => list.filter((x) => x.id !== s.id))}
                    disabled={semesters.length === 1}
                  >
                    <Trash2 />
                  </Button>
                </li>
              );
            })}
          </ul>
          <div>
            <Button variant="soft" onClick={addRow}>
              <Plus /> Add semester
            </Button>
          </div>
        </div>
      )}

      <ResultsPanel className="grid gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <ResultCard
          label={mode === "gpa" ? "Semester GPA" : "Cumulative GPA (CGPA)"}
          value={two(result)}
          caption={Number.isFinite(result) ? `out of 4.00 · ${SCALES[scale].name} scale` : undefined}
          copyText={two(result)}
          placeholder={mode === "gpa" ? "Add credit hours and grades" : "Add GPA and credit hours"}
        />
        <Stat
          label="Credit hours"
          value={totalCredits > 0 ? fmt(totalCredits, 1) : "—"}
          hint={mode === "gpa" ? `${counted} course${counted === 1 ? "" : "s"} counted` : undefined}
        />
        <Stat label="Quality points" value={totalCredits > 0 ? fmt(totalPoints, 2) : "—"} hint="credits × grade points" />
      </ResultsPanel>

      <details className="group rounded-xl border border-border bg-card">
        <summary
          className={cn(
            "flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl px-4 py-3 font-medium text-foreground sm:px-5",
            focusRing,
          )}
        >
          {SCALES[scale].name} grading table
          <ChevronDown aria-hidden className="size-4 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid gap-3 border-t border-border p-4 sm:p-5">
          <p className="text-sm text-muted">{SCALES[scale].note}</p>
          <Table label="Grading table">
            <thead>
              <tr>
                <th>Grade</th>
                <th className="num">Marks</th>
                <th className="num">Grade points</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={g.letter}>
                  <td className="font-medium">{g.letter}</td>
                  <td className="num">
                    {i === 0 ? `${g.min} and above` : g.min === 0 ? `Below ${grades[i - 1].min}` : `${g.min}–${grades[i - 1].min - 1}`}
                  </td>
                  <td className="num">{g.points.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </details>
    </div>
  );
}
