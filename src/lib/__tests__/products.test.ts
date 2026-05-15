import { describe, it, expect } from "vitest";
import { getRoastLabel } from "@/lib/products";

describe("getRoastLabel", () => {
  it("lightを「浅煎り」に変換する", () => {
    expect(getRoastLabel("light")).toBe("浅煎り");
  });

  it("mediumを「中煎り」に変換する", () => {
    expect(getRoastLabel("medium")).toBe("中煎り");
  });

  it("darkを「深煎り」に変換する", () => {
    expect(getRoastLabel("dark")).toBe("深煎り");
  });

  it("未知の値はそのまま返す", () => {
    expect(getRoastLabel("extra-dark")).toBe("extra-dark");
  });
});
