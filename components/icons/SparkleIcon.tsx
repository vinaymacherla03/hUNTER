
import React from 'react';
import { motion } from 'framer-motion';

const SparkleIcon: React.FC<{className?: string}> = ({className}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <motion.path
        d="M12 2l2.35 4.65L19 7.5l-3.5 3.4 1.35 5.1L12 13.5l-4.85 2.5 1.35-5.1L5 7.5l4.65-.85L12 2z"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "circOut" }}
      />
      <motion.path
        d="M12 2l-1.17 2.33-2.33 1.17 2.33 1.17L12 8l1.17-2.33 2.33-1.17-2.33-1.17L12 2z"
        fill="white"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
        transition={{ delay: 0.4, duration: 0.7, repeat: Infinity, repeatDelay: 1 }}
      />
    </svg>
  );
};

export default SparkleIcon;
