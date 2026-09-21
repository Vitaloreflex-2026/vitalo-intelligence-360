import { RecordContextProvider, ResourceContextProvider } from "ra-core";
import { render } from "vitest-browser-react";
import {
  buildCompany,
  buildContact,
  buildDeal,
  StoryWrapper,
} from "@/test/StoryWrapper";
import { ContactDealsList } from "./ContactDealsList";

const renderForContact = (
  contact: ReturnType<typeof buildContact>,
  deals: ReturnType<typeof buildDeal>[] = [],
) =>
  render(
    <StoryWrapper
      data={{ companies: [buildCompany()], contacts: [contact], deals }}
    >
      <ResourceContextProvider value="contacts">
        <RecordContextProvider value={contact}>
          <ContactDealsList />
        </RecordContextProvider>
      </ResourceContextProvider>
    </StoryWrapper>,
  );

describe("ContactDealsList", () => {
  it("links to the deal creation form prefilled with the contact and its company", async () => {
    const contact = buildContact({ company_id: 1 });

    const screen = await renderForContact(contact);

    const link = screen.getByRole("link", { name: "Add contract" });
    await expect.element(link).toBeVisible();
    expect(await link.element().getAttribute("href")).toBe(
      `/deals/create?source=${encodeURIComponent(
        JSON.stringify({ company_id: 1, contact_ids: [contact.id] }),
      )}`,
    );
  });

  it("links to the plain deal creation form when the contact has no company", async () => {
    const screen = await renderForContact(buildContact({ company_id: null }));

    const link = screen.getByRole("link", { name: "Add contract" });
    await expect.element(link).toBeVisible();
    expect(await link.element().getAttribute("href")).toBe("/deals/create");
  });

  it("lists the contact's deals instead of the create link", async () => {
    const contact = buildContact({ company_id: 1 });
    const screen = await renderForContact(contact, [
      buildDeal({ contact_ids: [contact.id], name: "Dossier en cours" }),
    ]);

    await expect.element(screen.getByText("Dossier en cours")).toBeVisible();
    expect(
      screen.getByRole("link", { name: "Add contract" }).elements(),
    ).toHaveLength(0);
  });
});
