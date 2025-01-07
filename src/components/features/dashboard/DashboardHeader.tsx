import { motion } from "framer-motion";

export const DashboardHeader = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 mb-4">
        Product Background Manager
      </h1>
      <p className="text-slate-600 text-center max-w-2xl mx-auto">
        Upload your product data, remove backgrounds, and manage your product images
        with ease.
      </p>
    </motion.div>
  );
};