export function indentRows(src: string) {
  const rows = src.replace("\t", "  ").split("\n");
  if (rows.length > 0) {
    const ind = getIndent(rows[0]);
    if (ind > 2) {
      rows[0] = rows[0].substring(ind - 2);
    } else if (ind < 2) {
      rows[0] = addIndent(rows[0], 2 - ind);
    }
    if (rows.length > 1) {
      const nInd = getIndent(rows[1]);
      if (nInd > 4) {
        for (let i = 1; i < rows.length; i++) {
          rows[i] = rows[i].substring(nInd - 4);
        }
      } else if (nInd < 4) {
        for (let i = 1; i < rows.length; i++) {
          rows[i] = addIndent(rows[i], 4 - nInd);
        }
      }
    }
  }
  return rows.join("\n");
}

function getIndent(row: string) {
  for (let i = 0; i < row.length; i++) {
    if (row[i] !== " ") {
      return i;
    }
  }
  return row.length;
}

function addIndent(row: string, num: number) {
  const spaces = new Array(num).fill(" ").join("");
  return `${spaces}${row}`;
}
