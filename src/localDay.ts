import { useSyncExternalStore } from "react";

export function localCalendarDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function subscribeToLocalDay(onChange: () => void) {
  let timeout: ReturnType<typeof setTimeout>;

  function refresh() {
    clearTimeout(timeout);
    onChange();
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timeout = setTimeout(refresh, midnight.getTime() - now.getTime());
  }

  refresh();
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("focus", refresh);
  return () => {
    clearTimeout(timeout);
    document.removeEventListener("visibilitychange", refresh);
    window.removeEventListener("focus", refresh);
  };
}

// The server does not know the browser's timezone. Defer date badges until hydration.
export function useLocalDay() {
  return useSyncExternalStore(subscribeToLocalDay, localCalendarDate, () => "");
}
