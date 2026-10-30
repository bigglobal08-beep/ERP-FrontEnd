"use client";

import { Hotel, Users } from "lucide-react";
import { NavItem } from "./NavItem";

export default function NavMenuItems() {
  return (
    <>
      <NavItem label="Empresas" icon={<Hotel />} route="#" />
      <NavItem label="Usuarios" icon={<Users />} route="#" />
    </>
  );
}
