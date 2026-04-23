import { motion } from "framer-motion";

const MetricCard = ({ item, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
  >
    <p className="text-sm uppercase tracking-wide text-slate-400">{item.label}</p>
    <h3 className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</h3>
    <p className="mt-2 text-sm text-slate-500">{item.meta || item.trend}</p>
  </motion.div>
);

export default MetricCard;
