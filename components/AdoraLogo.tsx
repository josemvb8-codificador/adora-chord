interface Props {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function AdoraLogo({ size = 28, showText = true, className = "" }: Props) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon: flame + music note hybrid */}
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Outer flame */}
        <path
          d="M16 2C16 2 8 10 8 18a8 8 0 0016 0c0-3-1.5-5.5-3-7.5C19.5 13 19 15 17 16c1-4-1-14-1-14z"
          fill="url(#flame)"
        />
        {/* Inner glow */}
        <path
          d="M16 12C16 12 12 17 12 21a4 4 0 008 0c0-2-1-3.5-2-4.5C17.5 18 17 19 16 19.5c.5-2.5 0-7.5 0-7.5z"
          fill="url(#inner)"
          opacity="0.9"
        />
        {/* Music note stem */}
        <rect x="19" y="10" width="2" height="8" rx="1" fill="white" opacity="0.8" />
        <ellipse cx="18" cy="18.5" rx="2.5" ry="1.8" fill="white" opacity="0.8" />
        <defs>
          <linearGradient id="flame" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a78bfa" />
            <stop offset="0.5" stopColor="#6366f1" />
            <stop offset="1" stopColor="#4f46e5" />
          </linearGradient>
          <linearGradient id="inner" x1="16" y1="12" x2="16" y2="26" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fde68a" />
            <stop offset="1" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <span
          className="font-bold tracking-tight text-zinc-900 dark:text-white"
          style={{ fontSize: size * 0.64, letterSpacing: "-0.03em" }}
        >
          Adora
        </span>
      )}
    </div>
  );
}
