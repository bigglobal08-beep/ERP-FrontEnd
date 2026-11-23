import type { ReactNode } from "react";

type ConditionalRenderProps = {
  cond: boolean;
  children: ReactNode;
};

export default function ConditionalRender({ cond, children }: ConditionalRenderProps) {
  return cond ? <>{children}</> : null;
}
