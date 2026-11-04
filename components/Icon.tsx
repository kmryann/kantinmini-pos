import type { SVGProps } from "react";

type IconProps = {
  name: string;
  className?: string;
} & Omit<SVGProps<SVGSVGElement>, "name">;

export function Icon({ name, className = "icon", ...props }: IconProps) {
  const reference = name === "logo-mark" ? "#logo-mark" : `#i-${name}`;
  return (
    <svg className={className} aria-hidden="true" focusable="false" {...props}>
      <use href={reference} />
    </svg>
  );
}
