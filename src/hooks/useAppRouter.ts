import { useCallback, useEffect, useMemo, useState } from "react";

function normalizeLegacyHash(hash: string) {
  const cleaned = hash.replace(/^#/, "").trim();

  if (!cleaned) {
    return "/";
  }

  if (cleaned.startsWith("/")) {
    return cleaned;
  }

  return `/${cleaned}`;
}

function normalizePath(path: string) {
  const trimmed = path.trim();

  if (!trimmed || trimmed === "//") {
    return "/";
  }

  return trimmed.endsWith("/") && trimmed !== "/" ? trimmed.slice(0, -1) : trimmed;
}

function readLocation() {
  if (typeof window === "undefined") {
    return {
      path: "/",
      search: "",
    };
  }

  if (window.location.hash && window.location.pathname === "/") {
    const legacyPath = normalizeLegacyHash(window.location.hash);
    window.history.replaceState({}, "", `${legacyPath}${window.location.search}`);
  }

  return {
    path: normalizePath(window.location.pathname),
    search: window.location.search,
  };
}

export function useAppRouter() {
  const [locationState, setLocationState] = useState(() => readLocation());

  useEffect(() => {
    const sync = () => setLocationState(readLocation());

    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);

    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const navigate = useCallback((path: string, options?: { replace?: boolean }) => {
    const target = normalizePath(path);
    const method = options?.replace ? "replaceState" : "pushState";
    window.history[method]({}, "", target);
    setLocationState(readLocation());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return useMemo(
    () => ({
      path: locationState.path,
      search: locationState.search,
      searchParams: new URLSearchParams(locationState.search),
      navigate,
    }),
    [locationState.path, locationState.search, navigate],
  );
}
