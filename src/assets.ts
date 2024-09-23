const from = (...rows: string[]) => rows.join("\n");

export const HEADER = from(
  ",=0=0=0=0=(__    T  S  X    L  I  N  K    __)=0=0=0=0='",
);

export const USAGE = from(
  "Link components from HTML design systems to presentation TSX in React.",
  "Read more at https://github.com/debyte/tsxlink",
);
