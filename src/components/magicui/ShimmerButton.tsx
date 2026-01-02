import { motion } from 'framer-motion';

interface ShimmerButtonProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ShimmerButton = ({
  children,
  href,
  className = '',
  size = 'md',
}: ShimmerButtonProps) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-12 py-5 text-lg',
  };

  const buttonContent = (
    <motion.span
      className={`
        relative inline-flex items-center justify-center gap-2
        overflow-hidden rounded-pill font-heading font-bold uppercase tracking-wider
        bg-secondary text-primary
        transition-all duration-300
        hover:shadow-[0_0_40px_8px_rgba(242,229,0,0.3)]
        ${sizeClasses[size]}
        ${className}
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 overflow-hidden rounded-pill">
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </span>
      <span className="relative z-10">{children}</span>
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} className="inline-block">
        {buttonContent}
      </a>
    );
  }

  return <button className="inline-block">{buttonContent}</button>;
};

export default ShimmerButton;
