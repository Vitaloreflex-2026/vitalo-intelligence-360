import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Mobile } from "./TaskCreateSheet.stories";
import { useDataProvider, type DataProvider } from "ra-core";
import { buildContact, buildSale } from "@/test/StoryWrapper";

describe("TaskCreateSheet", () => {
  it("creates a task for a selected contact and updates last_seen", async () => {
    let dataProvider: DataProvider | null = null;
    const DataProviderListener = () => {
      dataProvider = useDataProvider();
      return null;
    };
    const originalLastSeen = "2025-01-02T10:00:00.000Z";

    const screen = await render(
      <Mobile
        data={{
          contacts: [
            buildContact({
              first_name: "Ada",
              id: 1,
              last_name: "Lovelace",
              last_seen: "2025-01-01T10:00:00.000Z",
              nb_tasks: 1,
            }),
            buildContact({
              first_name: "Grace",
              id: 2,
              last_name: "Hopper",
              last_seen: originalLastSeen,
            }),
          ],
          tasks: [
            {
              contact_ids: [1],
              due_date: "2025-01-03T12:00:00.000Z",
              id: 1,
              sales_ids: [0],
              text: "Existing seeded task",
              type: "email",
            },
          ],
        }}
      >
        <DataProviderListener />
      </Mobile>,
    );

    await screen
      .getByLabelText(/description/i)
      .fill("Follow up about onboarding");

    const [contactInput, typeInput] = screen.getByRole("combobox").all();
    await contactInput.click();
    await screen.getByText("Grace Hopper").click();
    // The contacts list stays open for more picks; leave it before moving on.
    await screen.getByLabelText(/description/i).click();

    await typeInput.click();
    await screen.getByText("Premier contact").click();

    const dueDateInput = screen.getByLabelText(/date and time/i);
    await dueDateInput.clear();
    await dueDateInput.fill("2026-03-06T12:30");
    await screen.getByLabelText(/end time/i).fill("14:00");

    await screen.getByRole("button", { name: /^save$/i }).click();

    await expect.element(screen.getByText("Meeting added")).toBeInTheDocument();

    await expect
      .element(screen.getByText("Create meeting"))
      .not.toBeInTheDocument();

    await expect
      .poll(async () => {
        const { data } = await dataProvider!.getList("tasks", {
          filter: {},
          pagination: { page: 1, perPage: 10 },
          sort: { field: "id", order: "ASC" },
        });
        return data.some((task) => task.text === "Follow up about onboarding");
      })
      .toBe(true);

    const tasks = await dataProvider!.getList("tasks", {
      filter: {},
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
    });
    const createdTask = tasks.data.find(
      (task) => task.text === "Follow up about onboarding",
    );

    expect(createdTask).toMatchObject({
      contact_ids: [2],
      sales_ids: [0],
      // 12:30 to 14:00: the end time is saved as the meeting's length.
      duration_minutes: 90,
      text: "Follow up about onboarding",
      type: "Premier contact",
    });
    expect(tasks.data).toHaveLength(2);

    const updatedContact = await dataProvider!.getOne("contacts", {
      id: 2,
    });
    expect(updatedContact.data.last_seen).not.toBe(originalLastSeen);
    expect(updatedContact.data.nb_tasks).toBe(1);
  });

  it("saves a meeting with several contacts and several trainers", async () => {
    // Arrange
    let dataProvider: DataProvider | null = null;
    const DataProviderListener = () => {
      dataProvider = useDataProvider();
      return null;
    };
    const screen = await render(
      <Mobile
        data={{
          contacts: [
            buildContact({ first_name: "Ada", id: 1, last_name: "Lovelace" }),
            buildContact({ first_name: "Grace", id: 2, last_name: "Hopper" }),
          ],
          sales: [
            buildSale(),
            buildSale({ id: 5, first_name: "Bruno", last_name: "Petit" }),
          ],
        }}
      >
        <DataProviderListener />
      </Mobile>,
    );
    await screen.getByLabelText(/description/i).fill("Atelier commun");
    // Contacts, meeting type, meeting mode, then trainers.
    const comboboxes = screen.getByRole("combobox");
    const contactInput = comboboxes.nth(0);
    const typeInput = comboboxes.nth(1);
    const trainerInput = comboboxes.nth(3);

    // Act
    await contactInput.click();
    await screen.getByText("Ada Lovelace").click();
    await screen.getByText("Grace Hopper").click();
    await screen.getByLabelText(/description/i).click();
    await typeInput.click();
    await screen.getByText("Premier contact").click();
    await trainerInput.click();
    await screen.getByText("Bruno Petit").click();
    await screen.getByLabelText(/description/i).click();
    await screen.getByRole("button", { name: /^save$/i }).click();
    await expect.element(screen.getByText("Meeting added")).toBeInTheDocument();

    // Assert — the meeting belongs to both contacts, and counts for each.
    const { data: tasks } = await dataProvider!.getList("tasks", {
      filter: {},
      pagination: { page: 1, perPage: 10 },
      sort: { field: "id", order: "ASC" },
    });
    const created = tasks.find((task) => task.text === "Atelier commun");
    expect([...created.contact_ids].sort()).toEqual([1, 2]);
    expect([...created.sales_ids].sort()).toEqual([0, 5]);
    for (const id of [1, 2]) {
      const { data: contact } = await dataProvider!.getOne("contacts", { id });
      expect(contact.nb_tasks).toBe(1);
    }
  });
});
