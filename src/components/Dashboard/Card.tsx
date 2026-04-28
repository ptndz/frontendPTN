import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface IStatRow {
  label: string;
  value: string | number;
  change: number;
}

interface IProps {
  title: string;
  value: string | number;
  changePercent: number;
  rows: IStatRow[];
}

const Trend = ({ percent, size = "sm" }: { percent: number; size?: "sm" | "lg" }) => {
  const positive = percent >= 0;
  const Icon = positive ? FiTrendingUp : FiTrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 ${
        positive ? "text-emerald-500" : "text-rose-500"
      } ${size === "lg" ? "text-base font-semibold" : "text-xs font-medium"}`}
    >
      <Icon className={size === "lg" ? "w-4 h-4" : "w-3 h-3"} />
      {Math.abs(percent)}%
    </span>
  );
};

const Card: React.FC<IProps> = ({ title, value, changePercent, rows }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <div className="flex items-baseline gap-3 mt-3 mb-5">
        <p className="text-4xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <Trend percent={changePercent} size="lg" />
      </div>
      <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <p className="text-gray-600 dark:text-gray-400">{row.label}</p>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-gray-100">{row.value}</span>
              <Trend percent={row.change} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Card;
