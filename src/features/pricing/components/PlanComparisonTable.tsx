const rows = [
  ["Sales pipeline", "Yes", "No", "Yes"],
  ["Deals and leads", "Yes", "No", "Yes"],
  ["Project management", "No", "Yes", "Yes"],
  ["Tasks and delivery", "No", "Yes", "Yes"],
  ["Unified dashboard", "No", "No", "Yes"],
  ["Cross-module handoff", "No", "No", "Yes"],
  ["Email support", "Yes", "Yes", "Yes"],
];

const headings = ["Feature", "Sales", "Projects", "Full"];

function FeatureValue({ value }: { value: string }) {
  const enabled = value === "Yes";
  return (
    <span className={enabled ? "font-semibold text-[#a8dfb3]" : "text-white/32"}>
      {enabled ? "Included" : "-"}
    </span>
  );
}

export function PlanComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/40">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.06] text-white">
          <tr>
            {headings.map((heading, index) => (
              <th key={heading} className={index === 3 ? "px-5 py-4 font-semibold text-[#a8dfb3]" : "px-5 py-4 font-semibold"}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-white/66">
          {rows.map((row) => (
            <tr key={row[0]} className="hover:bg-white/[0.025]">
              {row.map((cell, columnIndex) => (
                <td key={`${row[0]}-${headings[columnIndex]}`} className="px-5 py-4">
                  {columnIndex === 0 ? <span className="font-medium text-white/78">{cell}</span> : <FeatureValue value={cell} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
