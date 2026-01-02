import { motion } from 'framer-motion';

interface AnimatedGradientProps {
  colors?: string[];
  speed?: number;
  className?: string;
}

export default function AnimatedGradient({
  colors = ['#F2E500', '#ff6b6b', '#4ecdc4', '#45b7d1'],
  speed = 10,
  className = '',
}: AnimatedGradientProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        style={{
          backgroundImage: `linear-gradient(45deg, ${colors.map((c, i) => `${c} ${i * (100 / (colors.length - 1))}%`).join(', ')})`,
          backgroundSize: '400% 400%',
        }}
        className="absolute inset-0 opacity-10"
      />

      {/* Segundo gradiente con animación diferente */}
      <motion.div
        animate={{
          backgroundPosition: ['100% 0%', '0% 100%'],
        }}
        transition={{
          duration: speed * 1.5,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'linear',
        }}
        style={{
          backgroundImage: `radial-gradient(ellipse at center, ${colors[0]}30, transparent 50%)`,
          backgroundSize: '300% 300%',
        }}
        className="absolute inset-0 opacity-20"
      />
    </div>
  );
}
