import clsx from "clsx";
import { NavLink, NavLinkProps } from "react-router";

export function NavItem(props: NavLinkProps) {
  return (
    <NavLink
      {...props}
      className={clsx(
        "px-5 py-2 text-lg",
        "hover:bg-sky-200 [&.active]:text-red-400",
        props.className
      )}
    />
  );
}
