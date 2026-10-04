export const university = "COMSATS University Islamabad, Abbottabad Campus";
export const department = "Department of Computer Engineering";

export const developers = [
  { name: "Ahmad Saleem Awan", initials: "AS", role: "Developer", email: "ahmadsaleemawan890@gmail.com" },
  { name: "Muhammad Alam Khan", initials: "MA", role: "Developer", email: "muhammadkhanswati4@gmail.com" },
];

/** "Ahmad Saleem Awan & Muhammad Alam Khan" */
export const developerNames = developers.map((d) => d.name).join(" & ");
