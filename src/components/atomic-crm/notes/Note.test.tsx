import { ResourceContextProvider, useDataProvider } from "ra-core";
import type { DataProvider } from "ra-core";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

import { StoryWrapper, buildContact } from "@/test/StoryWrapper";
import type { ContactNote } from "../types";
import { Note } from "./Note";

const note: ContactNote = {
  id: 1,
  contact_id: 1,
  sales_id: 0,
  text: "Called Ada",
  date: "2025-01-02T10:00:00.000Z",
  status: "warm",
};

describe("Note", () => {
  it("keeps the note's date when the date input is emptied while editing", async () => {
    let dataProvider: DataProvider | null = null;
    const DataProviderListener = () => {
      dataProvider = useDataProvider();
      return null;
    };
    const screen = await render(
      <StoryWrapper
        data={{ contacts: [buildContact()], contact_notes: [note] }}
      >
        <ResourceContextProvider value="contact_notes">
          <Note note={note} isLast />
          <DataProviderListener />
        </ResourceContextProvider>
      </StoryWrapper>,
    );

    // The pencil is the note's first action; it only carries a tooltip.
    await screen.getByRole("button").first().click();
    await screen.getByPlaceholder("Add a note").fill("Called Ada again");
    await screen.getByRole("button", { name: "Show options" }).click();
    await screen.getByLabelText("Date").clear();
    await screen.getByRole("button", { name: /update note/i }).click();

    await expect
      .poll(async () => {
        const { data } = await dataProvider!.getOne("contact_notes", { id: 1 });
        return { text: data.text, date: data.date };
      })
      .toEqual({ text: "Called Ada again", date: note.date });
  });
});
