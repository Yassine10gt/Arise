import { useEffect, type ReactNode } from "react";

interface ProtectedRouteProps {
  isAllowed: boolean;
  redirectTo: string;
  navigate: (path: string, options?: { replace?: boolean }) => void;
  children: ReactNode;
}

export function ProtectedRoute({ isAllowed, redirectTo, navigate, children }: ProtectedRouteProps) {
  useEffect(() => {
    if (!isAllowed) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAllowed, navigate, redirectTo]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
