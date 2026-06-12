import type { ReactNode } from "react";

export function DataTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="data-table">
      <div className="table-wrap table-desktop">
        <table>
          <thead>
            <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-cards">
        {rows.map((row, rowIndex) => (
          <article key={rowIndex} className="table-card">
            {headers.map((header, cellIndex) => (
              <div key={header} className="table-card-row">
                <span>{header}</span>
                <div>{row[cellIndex]}</div>
              </div>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
