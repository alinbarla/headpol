import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline" | "dark";
  className?: string;
} & (
  | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
  | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
);

const variants = {
  primary:
    "border border-beam bg-beam text-void hover:bg-void hover:text-white hover:border-white hover:scale-105 shadow-[0_0_30px_rgba(255,243,38,0.18)]",
  ghost: "bg-transparent text-text-primary hover:bg-mist",
  outline:
    "border border-white/80 bg-transparent text-white hover:bg-beam hover:text-void hover:border-beam hover:scale-105",
  dark: "border border-white/20 bg-black text-white hover:bg-white hover:text-void hover:border-white hover:scale-105",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  href,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full px-7 py-3 text-sm font-semibold font-display transition-all duration-300 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-beam disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transform-none motion-reduce:hover:scale-100";

  if (href) {
    return (
      <a
        href={href}
        className={`${base} ${variants[variant]} ${className}`}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
