"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indentRows = indentRows;
function indentRows(src) {
    const rows = src.replace("\t", "  ").split("\n");
    if (rows.length > 0) {
        const ind = getIndent(rows[0]);
        if (ind > 2) {
            rows[0] = rows[0].substring(ind - 2);
        }
        else if (ind < 2) {
            rows[0] = addIndent(rows[0], 2 - ind);
        }
        if (rows.length > 1) {
            const nInd = getIndent(rows[1]) - 4;
            if (nInd > 0) {
                for (let i = 1; i < rows.length; i++) {
                    rows[i] = rows[i].substring(Math.min(getIndent(rows[i]), nInd));
                }
            }
            else if (nInd < 0) {
                for (let i = 1; i < rows.length; i++) {
                    rows[i] = addIndent(rows[i], -nInd);
                }
            }
        }
    }
    return rows.join("\n");
}
function getIndent(row) {
    for (let i = 0; i < row.length; i++) {
        if (row[i] !== " ") {
            return i;
        }
    }
    return row.length;
}
function addIndent(row, num) {
    const spaces = new Array(num).fill(" ").join("");
    return `${spaces}${row}`;
}
