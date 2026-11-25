import { afterEach, describe, expect, it, vi } from "vitest";
import { localCalendarDate } from "./localDay";

afterEach(() => vi.unstubAllEnvs());

describe("the user's local calendar day", () => {
  it.each([
    ["America/Detroit", "2026-11-25T01:00:00Z", "2026-11-24"],
    ["Pacific/Auckland", "2026-11-24T12:00:00Z", "2026-11-25"],
    ["America/Detroit", "2026-03-08T06:59:59Z", "2026-03-08"],
    ["America/Detroit", "2026-03-08T07:00:00Z", "2026-03-08"],
  ])("uses %s at %s", (timezone, instant, expected) => {
    vi.stubEnv("TZ", timezone);
    expect(localCalendarDate(new Date(instant))).toBe(expected);
  });
});
