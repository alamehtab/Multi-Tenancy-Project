import { ArrowUpCircle } from "lucide-react";

export default function UpgradeBanner({ onUpgrade, tenantPlan }) {
  if (tenantPlan === "PRO") return null;

  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded flex justify-between items-center">
      <div className="flex items-center gap-2">
        <ArrowUpCircle size={24} />
        <span>
          You have reached your free plan limit of 3 notes. Upgrade to Pro for unlimited notes.
        </span>
      </div>
      <button
        onClick={onUpgrade}
        className="bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 transition"
      >
        Upgrade
      </button>
    </div>
  );
}
