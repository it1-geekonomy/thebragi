import { planCatalog } from "@/config/plans";

const headings = ["Feature", "Sales CRM", "Projects", "Complete Suite"];

// Keep the existing table row set + ordering stable; values are derived from `planCatalog`.
const rowLabels = [
  "Lead capture & qualification",
  "Lead pipeline & forecasting",
  "Contacts & corp. records",
  "Targets & sales hierarchy",
  "Projects & project types",
  "Milestones, tasks & time logs",
  "Milestones & client invoicing",
  "Lead → Deal → Client → Project chain",
  "Action-triggered invoicing",
  "Cross-module reporting",
  "Priority onboarding support",
];

function FeatureValue({ value }: { value: string }) {
  const enabled = value === "Yes";
  return (
    <span className={enabled ? "font-semibold text-[#a8dfb3]" : "text-white/32"}>
      {enabled ? "Included" : "-"}
    </span>
  );
}

export function PlanComparisonTable() {
  const sales = planCatalog.find((p) => p.slug === "bragi-sales");
  const projects = planCatalog.find((p) => p.slug === "bragi-projects");
  const suite = planCatalog.find((p) => p.slug === "bragi-full");

  // Safety: this table is static, but avoid runtime crashes if config is incomplete.
  if (!sales || !projects || !suite) return null;

  const salesModules = new Set(sales.modules);
  const projectsModules = new Set(projects.modules);
  const suiteIncluded = new Set(suite.features.filter((f) => f.included).map((f) => f.label));

  const suiteHasSalesCRM = suiteIncluded.has("Everything in Sales CRM");
  const suiteHasProjects = suiteIncluded.has("Everything in Project Management");

  const isEnabledForPlan = (plan: typeof sales, label: string) => plan.features.find((f) => f.label === label)?.included ?? false;

  return (
    <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/40">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead className="bg-white/[0.06] text-white">
          <tr>
            {headings.map((heading, index) => (
              <th
                key={heading}
                className={index === 3 ? "px-5 py-4 font-semibold text-[#a8dfb3]" : "px-5 py-4 font-semibold"}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-white/66">
          {rowLabels.map((label) => {
            const salesEnabled = isEnabledForPlan(sales, label);
            const projectsEnabled = isEnabledForPlan(projects, label);
            const suiteEnabled =
              suiteIncluded.has(label) ||
              (suiteHasSalesCRM && salesModules.has(label)) ||
              (suiteHasProjects && projectsModules.has(label));

            const cells = [
              label,
              salesEnabled ? "Yes" : "No",
              projectsEnabled ? "Yes" : "No",
              suiteEnabled ? "Yes" : "No",
            ];

            return (
              <tr key={label} className="hover:bg-white/[0.025]">
                {cells.map((cell, columnIndex) => (
                  <td key={`${label}-${headings[columnIndex]}`} className="px-5 py-4">
                    {columnIndex === 0 ? (
                      <span className="font-medium text-white/78">{cell}</span>
                    ) : (
                      <FeatureValue value={cell} />
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
