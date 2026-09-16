import {
  RecordContextProvider,
  useGetList,
  useGetOne,
  useTranslate,
} from "ra-core";
import { useState } from "react";
import { useWatch } from "react-hook-form";
import { Link } from "react-router-dom";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Company, Contact } from "../types";
import { Avatar } from "./Avatar";

// The count phrase is a link inside the sentence, so the catalog leaves a
// %{link} placeholder that we split on to render it as a button.
const LINK_PLACEHOLDER = "%{link}";

/**
 * Hint under the company input telling how many contacts the selected company
 * already has, so the user notices they are joining an existing account.
 * The count itself opens a dialog listing those contacts.
 */
export const CompanyContactsCount = () => {
  const translate = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const companyId = useWatch({ name: "company_id" });
  const { data: company } = useGetOne<Company>(
    "companies",
    { id: companyId },
    { enabled: companyId != null && companyId !== "" },
  );

  if (!company) return null;

  const contactsCount = company.nb_contacts ?? 0;
  const [before, after] = translate(
    "resources.contacts.company_contacts_count",
    { smart_count: contactsCount },
  ).split(LINK_PLACEHOLDER);
  const countLabel = translate(
    "resources.contacts.company_contacts_count_link",
    { smart_count: contactsCount },
  );

  return (
    <>
      <p className="text-sm text-muted-foreground -mt-2">
        {before}
        {contactsCount > 0 ? (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="font-bold underline hover:text-foreground cursor-pointer"
          >
            {countLabel}
          </button>
        ) : (
          countLabel
        )}
        {after}
      </p>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {translate("resources.contacts.company_contacts_dialog_title", {
                company: company.name,
              })}
            </DialogTitle>
          </DialogHeader>
          <CompanyContactsList
            companyId={company.id}
            onContactClick={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

const CompanyContactsList = ({
  companyId,
  onContactClick,
}: {
  companyId: Company["id"];
  onContactClick: () => void;
}) => {
  const { data: contacts, isPending } = useGetList<Contact>(
    "contacts_summary",
    {
      filter: { company_id: companyId },
      sort: { field: "last_name", order: "ASC" },
      pagination: { page: 1, perPage: 100 },
    },
  );

  if (isPending || !contacts) return null;

  return (
    <ul className="flex flex-col gap-3">
      {contacts.map((contact) => (
        <RecordContextProvider key={contact.id} value={contact}>
          <li>
            <Link
              to={`/contacts/${contact.id}/show`}
              onClick={onContactClick}
              className="flex items-center gap-3 text-sm rounded-md px-2 py-1 -mx-2 hover:bg-muted transition-colors"
            >
              <Avatar width={25} height={25} />
              <div className="min-w-0">
                <div className="font-medium">
                  {`${contact.first_name} ${contact.last_name}`}
                </div>
                {contact.title ? (
                  <div className="text-muted-foreground">{contact.title}</div>
                ) : null}
              </div>
            </Link>
          </li>
        </RecordContextProvider>
      ))}
    </ul>
  );
};
