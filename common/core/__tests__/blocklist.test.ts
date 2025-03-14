import { test, expect } from "vitest";
import { parseDomainFromURL } from "../blocklist";

test("parseDomainFromURL", () => {
  expect(parseDomainFromURL("https://www.google.com")).toBe("www.google.com");
  expect(parseDomainFromURL("https://www.google.com/")).toBe("www.google.com");
  expect(parseDomainFromURL("https://www.google.com/search?q=hello")).toBe(
    "www.google.com",
  );
  expect(parseDomainFromURL("https://www.google.com/search?q=hello#")).toBe(
    "www.google.com",
  );
  expect(parseDomainFromURL("https://www.google.com/search?q=hello#foo")).toBe(
    "www.google.com",
  );
  expect(
    parseDomainFromURL("https://www.google.com/search?q=hello#foo/bar"),
  ).toBe("www.google.com");
  expect(
    parseDomainFromURL("https://www.google.com/search?q=hello#foo/bar/"),
  ).toBe("www.google.com");
});
