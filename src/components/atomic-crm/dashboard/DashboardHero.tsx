import { Plus } from "lucide-react";
import { useGetIdentity, useLocaleState, useTranslate } from "ra-core";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const QUICK_ACTIONS = [
  { to: "/contacts/create", label: "resources.contacts.action.create" },
  { to: "/companies/create", label: "resources.companies.action.create" },
];

/**
 * Welcome band at the top of the dashboard: the website's forest green as a
 * surface, with its orange and light green as decoration, so the home page
 * opens on the brand instead of on a grid of white cards.
 */
export const DashboardHero = () => {
  const translate = useTranslate();
  const [locale] = useLocaleState();
  const { identity } = useGetIdentity();

  const firstName = identity?.fullName?.split(" ")[0] ?? "";
  const today = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <section className="relative flex flex-wrap items-center gap-4 overflow-hidden rounded-2xl bg-vitalo-band px-6 py-5 text-white shadow-md">
      <div
        aria-hidden
        // Smaller on a phone, where the full-size disc would sit under the text.
        className="absolute -top-10 -right-8 size-28 rounded-full bg-vitalo-orange sm:-top-20 sm:-right-12 sm:size-64"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 right-40 hidden size-44 rounded-full bg-vitalo-green/80 sm:block"
      />
      <div className="relative min-w-60 flex-1">
        <p className="text-sm first-letter:uppercase">{today}</p>
        <h2 className="font-heading text-3xl font-bold">
          {translate("crm.dashboard.hero.greeting", {
            name: firstName,
            _: "Hello %{name}",
          })}
        </h2>
        <p className="text-sm">
          {translate("crm.dashboard.hero.subtitle", {
            _: "Here is your day at a glance.",
          })}
        </p>
      </div>
      <div className="relative flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.to}
            asChild
            className="rounded-full bg-white text-vitalo-ink shadow-sm hover:bg-white/90"
          >
            <Link to={action.to}>
              <Plus className="size-4" />
              {translate(action.label)}
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
};
