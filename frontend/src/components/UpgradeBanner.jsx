import { ArrowUpCircle } from "lucide-react";

export default function UpgradeBanner({ onUpgrade, tenantPlan }) {
  if (tenantPlan === "PRO") return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-6">
      <div className="flex items-start sm:items-center gap-2">
        <ArrowUpCircle size={24} className="mt-1 sm:mt-0" />
        <span className="text-sm sm:text-base">
          You have reached your free plan limit of 3 notes. Upgrade to Pro for unlimited notes.
        </span>
      </div>
      <button
        onClick={onUpgrade}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition text-sm sm:text-base w-full sm:w-auto"
      >
        Upgrade
      </button>
    </div>
  );
}
