import type { ReactNode } from "react";
import { ProtectedLayout } from "../../components/ProtectedLayout";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
