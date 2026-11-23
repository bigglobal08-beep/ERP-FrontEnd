"use client";

import { LayoutGrid } from "lucide-react";
import type { IMenuItem } from "@/lib/menu/interface";
import { NavItem } from "./NavItem";

// El menú viene de la base: solo se enlazan rutas internas
const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

function NavNode({ item }: { item: IMenuItem }) {
  const icon = <LayoutGrid className="size-4 shrink-0" aria-hidden="true" />;

  if (item.children?.length) {
    return (
      <li>
        <details>
          <summary
            title={item.span}
            className="font-semibold in-data-[collapsed=true]:justify-center in-data-[collapsed=true]:after:hidden"
          >
            {icon}
            <span className="min-w-0 break-words in-data-[collapsed=true]:hidden">{item.span}</span>
          </summary>
          <ul className="in-data-[collapsed=true]:hidden">
            {item.children.map((child, index) => (
              <NavNode key={child.id ?? `${child.span}-${index}`} item={child} />
            ))}
          </ul>
        </details>
      </li>
    );
  }

  if (!isInternal(item.href)) {
    return (
      <li className="menu-disabled">
        <span title={item.span} className="font-semibold in-data-[collapsed=true]:justify-center">
          {icon}
          <span className="min-w-0 break-words in-data-[collapsed=true]:hidden">{item.span}</span>
        </span>
      </li>
    );
  }

  return <NavItem label={item.span} icon={icon} route={item.href} />;
}

// Se pinta tal cual: el backend ya lo filtró por los permisos del usuario
export default function NavMenuItems({ items }: { items: IMenuItem[] }) {
  if (!items.length) {
    return <li className="text-base-content/60 px-3 py-2 text-xs">Sin elementos en el menú</li>;
  }
  return (
    <>
      {items.map((item, index) => (
        <NavNode key={item.id ?? `${item.span}-${index}`} item={item} />
      ))}
    </>
  );
}
