import { test, expect } from "./fixtures";

// Supabase's own invite email points at the site root and carries the session
// tokens in the URL fragment. supabase-js consumes that fragment at startup, so
// without the interception in index.html the invited user lands on the
// dashboard already signed in, with no password of their own.
test("invited user chooses a password before entering the app", async ({
  page,
  createSales,
  inviteUser,
  baseURL,
}) => {
  // Arrange: an existing administrator, so the CRM is already initialized
  await createSales({
    first_name: "John",
    last_name: "Doe",
    email: "john@doe.com",
    password: "password",
    administrator: true,
  });
  const invitationLink = await inviteUser({
    email: "jane@doe.com",
    first_name: "Jane",
    last_name: "Doe",
    redirectTo: baseURL!,
  });

  // Act: the invited user follows the link from their email
  await page.goto(invitationLink);

  // Assert: they are asked for a password instead of being let straight in
  await expect(
    page.getByRole("heading", { name: "Choose your password" }),
  ).toBeVisible();

  await page
    .getByRole("textbox", { name: "Password", exact: true })
    .fill("new-password");
  await page
    .getByRole("textbox", { name: "Confirm password" })
    .fill("new-password");
  await page.getByRole("button", { name: "Save" }).click();

  // And once set, the password gets them into the app
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole("link", { name: "Contacts" })).toBeVisible();
});
