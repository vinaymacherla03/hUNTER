
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface FadeInProps {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    yOffset?: number;
}

const COLUMN_EASE = [0.21, 0.47, 0.32, 0.98] as const;

export const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = "", yOffset = 40 }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-60px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: yOffset }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
            transition={{
                duration: 0.8,
                ease: COLUMN_EASE,
                delay: delay
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const FadeInStagger: React.FC<{ children: React.ReactNode, className?: string, faster?: boolean }> = ({ children, className = "", faster = false }) => {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: faster ? 0.12 : 0.2
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const FadeInStaggerItem: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 40 },
                show: { 
                    opacity: 1, 
                    y: 0,
                    transition: {
                        duration: 0.8,
                        ease: COLUMN_EASE
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
};
