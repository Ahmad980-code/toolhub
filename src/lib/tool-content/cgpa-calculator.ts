import type { Tool } from "../tools";

export const cgpaCalculator: Tool = {
  slug: "cgpa-calculator",
  name: "CGPA / GPA Calculator",
  category: "calculators",
  icon: "GraduationCap",
  summary: "Semester GPA and CGPA on the COMSATS/HEC 4.0 scale.",
  title: "CGPA Calculator – COMSATS & HEC 4.0 GPA Calculator",
  description:
    "Calculate your semester GPA from grades or marks and your cumulative CGPA on the COMSATS/HEC 4.0 scale, with credit hours and quality points.",
  intro:
    "Work out your semester GPA and cumulative CGPA in seconds. Add your courses with credit hours and either letter grades or marks, and the calculator applies the COMSATS University Islamabad grading criteria (the HEC 4.0 absolute scale), or a US 4.0 scale if you prefer. Switch to CGPA mode to combine semesters and see where your overall result stands.",
  steps: [
    "Choose Semester GPA or CGPA, and your grading scale.",
    "For GPA, add each course's credit hours and grade, or switch to marks.",
    "For CGPA, add each semester's GPA and credit hours (or your current CGPA as one row).",
    "Read your GPA or CGPA with total credit hours and quality points.",
  ],
  faqs: [
    {
      q: "How is GPA calculated?",
      a: "Multiply each course's grade points by its credit hours to get quality points, add them up, and divide by the total credit hours. For example, an A- (3.66) in a 4-credit course and a B (3.00) in a 3-credit course give (14.64 + 9.00) ÷ 7 = 3.38.",
    },
    {
      q: "What is the COMSATS grading scale?",
      a: "COMSATS uses absolute grading: A is 85 and above (4.00), A- 80–84 (3.66), B+ 75–79 (3.33), B 71–74 (3.00), B- 68–70 (2.66), C+ 64–67 (2.33), C 61–63 (2.00), C- 58–60 (1.66), D+ 54–57 (1.30), D 50–53 (1.00) and F below 50 (0.00).",
    },
    {
      q: "How do I calculate my CGPA from my semester GPAs?",
      a: "Multiply each semester's GPA by its credit hours, add the results, and divide by the total credit hours of all semesters. A simple average of GPAs is only correct when every semester has the same credit hours.",
    },
    {
      q: "What CGPA do I need to stay in good standing?",
      a: "Most Pakistani universities, including COMSATS, require undergraduates to keep a CGPA of at least 2.00. Check your university's rules for probation and graduation requirements.",
    },
    {
      q: "Can I convert CGPA to percentage?",
      a: "There is no single official formula; each university publishes its own conversion. Use your university's or HEC's conversion rule if an employer or admission office asks for a percentage.",
    },
  ],
};
