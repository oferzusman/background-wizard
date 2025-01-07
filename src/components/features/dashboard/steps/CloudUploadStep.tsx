import { motion } from "framer-motion";

export const CloudUploadStep = () => {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="glass-effect rounded-xl p-6 flex justify-center items-center backdrop-blur-sm">
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
          Cloud Upload Feature Coming Soon
        </h2>
      </div>
    </motion.div>
  );
};