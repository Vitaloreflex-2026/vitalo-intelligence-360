import { matchHeaderSection } from "./headerSections";

describe("matchHeaderSection", () => {
  it("matches the dashboard only on the root path", () => {
    expect(matchHeaderSection("/")).toBe("/");
    expect(matchHeaderSection("/contacts")).not.toBe("/");
  });

  it("matches a section from any of its sub-routes", () => {
    expect(matchHeaderSection("/contacts")).toBe("/contacts");
    expect(matchHeaderSection("/contacts/12/show")).toBe("/contacts");
    expect(matchHeaderSection("/assessments/3")).toBe("/assessments");
    expect(matchHeaderSection("/deals/create")).toBe("/deals");
  });

  it("returns false outside the top-level sections", () => {
    expect(matchHeaderSection("/settings")).toBe(false);
    expect(matchHeaderSection("/sales/4")).toBe(false);
  });
});
