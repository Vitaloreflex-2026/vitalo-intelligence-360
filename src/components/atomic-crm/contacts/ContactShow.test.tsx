import {
  ResourceContextProvider,
  ShowBase,
  useDataProvider,
  type DataProvider,
} from "ra-core";
import { render } from "vitest-browser-react";
import { buildContact, StoryWrapper } from "@/test/StoryWrapper";
import { ContactAside } from "./ContactAside";
import { MobileSuccess } from "./ContactShow.mobile.stories";

const mockIsMobile = vi.hoisted(() => vi.fn(() => true));
vi.mock("@/hooks/use-mobile", () => ({
  useIsMobile: mockIsMobile,
}));

describe("ContactShow", () => {
  beforeEach(() => {
    mockIsMobile.mockReturnValue(true);
  });

  it("renders a safe zero-meeting label before nb_tasks is available", async () => {
    const screen = await render(<MobileSuccess />);

    await expect
      .element(screen.getByRole("tab", { name: "0 meetings" }))
      .toBeVisible();
    await expect
      .poll(
        () => screen.container.textContent?.includes("%{smart_count}") ?? false,
      )
      .toBe(false);
    await expect
      .poll(() => screen.container.textContent?.includes("||||") ?? false)
      .toBe(false);
  });

  it("lists the contact's done meetings after the pending ones in the aside", async () => {
    mockIsMobile.mockReturnValue(false);

    const contact = buildContact();
    const screen = await render(
      <StoryWrapper
        data={{
          contacts: [contact],
          tasks: [
            {
              contact_id: contact.id,
              done_date: "2025-01-02T10:00:00.000Z",
              due_date: "2025-01-01T10:00:00.000Z",
              id: 1,
              sales_id: 0,
              text: "Rendez-vous traite",
              type: "meeting",
            },
            {
              contact_id: contact.id,
              due_date: "2099-01-01T10:00:00.000Z",
              id: 2,
              sales_id: 0,
              text: "Rendez-vous a venir",
              type: "meeting",
            },
          ],
        }}
      >
        <ResourceContextProvider value="contacts">
          <ShowBase id={contact.id}>
            <ContactAside />
          </ShowBase>
        </ResourceContextProvider>
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByText("Rendez-vous traite"))
      .toBeInTheDocument();

    // Sorted by due date the done meeting would come first; it must not.
    const asideText = screen.container.textContent ?? "";
    expect(asideText.indexOf("Rendez-vous a venir")).toBeLessThan(
      asideText.indexOf("Rendez-vous traite"),
    );
  });

  it("updates the contact status from the aside", async () => {
    mockIsMobile.mockReturnValue(false);

    let dataProvider: DataProvider | null = null;
    const contact = buildContact({ status: "warm" });

    const DataProviderListener = () => {
      dataProvider = useDataProvider();
      return null;
    };

    const screen = await render(
      <StoryWrapper data={{ contacts: [contact] }}>
        <DataProviderListener />
        <ResourceContextProvider value="contacts">
          <ShowBase id={contact.id}>
            <ContactAside />
          </ShowBase>
        </ResourceContextProvider>
      </StoryWrapper>,
    );

    await expect
      .element(screen.getByRole("combobox"))
      .toHaveTextContent("Warm");

    await screen.getByRole("combobox").click();
    await screen.getByRole("option", { name: /hot/i }).click();

    await expect
      .poll(async () => {
        const { data } = await dataProvider!.getOne("contacts", {
          id: contact.id,
        });
        return data.status;
      })
      .toBe("hot");

    await expect.element(screen.getByRole("combobox")).toHaveTextContent("Hot");
  });
});
