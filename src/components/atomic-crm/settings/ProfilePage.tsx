import { useMutation } from "@tanstack/react-query";
import type { HttpError } from "ra-core";
import { Check, CircleX, Copy, Pencil, Save } from "lucide-react";
import {
  Form,
  useDataProvider,
  useGetIdentity,
  useGetOne,
  useLocaleState,
  useLocales,
  useNotify,
  useRecordContext,
  ResourceContextProvider,
  useTranslate,
} from "ra-core";
import { useState } from "react";
import { useFormState } from "react-hook-form";
import { ArrayInput } from "@/components/admin/array-input";
import { RecordField } from "@/components/admin/record-field";
import { SimpleFormIterator } from "@/components/admin/simple-form-iterator";
import { TextInput } from "@/components/admin/text-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { SaleDocumentsCard } from "../documents/SaleDocumentsCard";
import ImageEditorField from "../misc/ImageEditorField";
import type { CrmDataProvider } from "../providers/types";
import type { Sale, SalesFormData } from "../types";
import { useChangePassword } from "./useChangePassword";

export const ProfilePage = () => {
  const [isEditMode, setEditMode] = useState(false);
  const { identity, refetch: refetchIdentity } = useGetIdentity();
  const { data, refetch: refetchUser } = useGetOne("sales", {
    id: identity?.id,
  });
  const translate = useTranslate();
  const notify = useNotify();
  const dataProvider = useDataProvider<CrmDataProvider>();

  const { mutate } = useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data: SalesFormData) => {
      if (!identity) {
        throw new Error(
          translate("crm.profile.record_not_found", {
            _: "Record not found",
          }),
        );
      }
      return dataProvider.salesUpdate(identity.id, data);
    },
    onSuccess: () => {
      refetchIdentity();
      refetchUser();
      setEditMode(false);
      notify("crm.profile.updated", {
        messageArgs: {
          _: "Your profile has been updated",
        },
      });
    },
    onError: (error: unknown) => {
      // A calendar URL the server refuses is the user's to fix, so it gets its
      // own message instead of the generic "try again".
      const isInvalidFeed =
        (error as HttpError)?.body?.code === "invalid_ical_url";

      notify(
        isInvalidFeed
          ? "crm.profile.calendar.invalid"
          : "crm.profile.update_error",
        {
          type: "error",
          messageArgs: {
            _: isInvalidFeed
              ? "This calendar address is not valid. It must be a public https:// or webcal:// link."
              : "An error occurred. Please try again",
          },
        },
      );
    },
  });

  // The form takes its initial values from the record once, on mount.
  // Rendering it before the profile has loaded would start it from nothing,
  // and a save from that state would blank fields the user never touched.
  if (!identity || !data) return null;

  const handleOnSubmit = async (values: any) => {
    mutate(values);
  };

  return (
    <div className="max-w-lg mx-auto mt-8 space-y-4">
      <Form onSubmit={handleOnSubmit} record={data}>
        <ProfileForm isEditMode={isEditMode} setEditMode={setEditMode} />
      </Form>
    </div>
  );
};

const ProfileForm = ({
  isEditMode,
  setEditMode,
}: {
  isEditMode: boolean;
  setEditMode: (value: boolean) => void;
}) => {
  const notify = useNotify();
  const translate = useTranslate();
  const record = useRecordContext<Sale>();
  const { identity, refetch } = useGetIdentity();
  const { isDirty } = useFormState();
  const dataProvider = useDataProvider<CrmDataProvider>();

  const { changePassword, isPending: isChangingPassword } = useChangePassword();

  const { mutate: mutateSale } = useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data: SalesFormData) => {
      if (!record) {
        throw new Error(
          translate("crm.profile.record_not_found", {
            _: "Record not found",
          }),
        );
      }
      return dataProvider.salesUpdate(record.id, data);
    },
    onSuccess: () => {
      refetch();
      notify("crm.profile.updated", {
        messageArgs: {
          _: "Your profile has been updated",
        },
      });
    },
    onError: () => {
      notify("crm.profile.update_error", {
        type: "error",
        messageArgs: {
          _: "An error occurred. Please try again.",
        },
      });
    },
  });
  if (!identity) return null;

  const handleAvatarUpdate = async (values: any) => {
    mutateSale(values);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <div className="mb-4 flex flex-row justify-between">
            <h2 className="text-xl font-semibold text-muted-foreground">
              {translate("crm.profile.title")}
            </h2>
          </div>

          <div className="space-y-4 mb-4">
            <ImageEditorField
              source="avatar"
              type="avatar"
              onSave={handleAvatarUpdate}
              linkPosition="right"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextRender source="first_name" isEditMode={isEditMode} />
              <TextRender source="last_name" isEditMode={isEditMode} />
            </div>
            <TextRender source="email" isEditMode={isEditMode} />
            <LanguageSelector />
          </div>

          <ExternalCalendarField isEditMode={isEditMode} />

          <div className="flex flex-row justify-end gap-2">
            {!isEditMode && (
              <>
                <Button
                  variant="outline"
                  type="button"
                  disabled={isChangingPassword}
                  onClick={() => changePassword()}
                >
                  {translate("crm.profile.password.change")}
                </Button>
              </>
            )}

            <Button
              type="button"
              variant={isEditMode ? "ghost" : "outline"}
              onClick={() => setEditMode(!isEditMode)}
              className="flex items-center"
            >
              {isEditMode ? <CircleX /> : <Pencil />}
              {isEditMode
                ? translate("ra.action.cancel")
                : translate("ra.action.edit")}
            </Button>

            {isEditMode && (
              <Button type="submit" disabled={!isDirty} variant="outline">
                <Save />
                {translate("ra.action.save")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Each document saves on its own, independently of the form around it. */}
      <SaleDocumentsCard />
      {import.meta.env.VITE_INBOUND_EMAIL && (
        <Card>
          <CardContent>
            <div className="space-y-4 justify-between">
              <h2 className="text-xl font-semibold text-muted-foreground">
                {translate("crm.profile.inbound.title")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {translate("crm.profile.inbound.description", {
                  _: "You can start sending emails to your server's inbound email address, e.g. by adding it to the Cc: field. Atomic CRM will process the emails and add notes to the corresponding contacts.",
                  field: "Cc:",
                })}
              </p>
              <CopyPaste value={import.meta.env.VITE_INBOUND_EMAIL} />
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardContent>
          <div className="space-y-4 justify-between">
            <h2 className="text-xl font-semibold text-muted-foreground">
              {translate("crm.profile.mcp.title", {
                _: "MCP Server",
              })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {translate("crm.profile.mcp.description", {
                _: "Use this URL to connect your AI assistant to your CRM data via the Model Context Protocol (MCP).",
              })}
            </p>
            <CopyPaste
              value={`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mcp`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/** Order matters only for reading: the most common one first. */
const CALENDAR_PROVIDERS = ["google", "apple"] as const;

/**
 * The user's own external calendar feeds. Read-only for the CRM: the dashboard
 * overlays them as busy time and never writes back, so the field carries the
 * explanation of where each address is found rather than leaving the user to
 * guess which of a calendar app's several URLs is the right one.
 */
const ExternalCalendarField = ({ isEditMode }: { isEditMode: boolean }) => {
  const translate = useTranslate();

  return (
    <div className="space-y-2 mb-4">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {translate("crm.profile.calendar.title", { _: "External calendars" })}
      </h3>
      <p className="text-xs text-muted-foreground">
        {translate("crm.profile.calendar.description")}
      </p>
      {isEditMode ? (
        <>
          {/* The profile is a standalone form, not a resource page, and the
              iterator's rows read the resource from context — so name it. */}
          <ResourceContextProvider value="sales">
            <ArrayInput source="ical_urls" label={false} helperText={false}>
              <SimpleFormIterator disableReordering>
                <TextInput
                  source=""
                  label={false}
                  helperText={false}
                  placeholder={translate("crm.profile.calendar.placeholder")}
                />
              </SimpleFormIterator>
            </ArrayInput>
          </ResourceContextProvider>
          {/* Each calendar app buries this address somewhere different, and
              picking the wrong one of the several URLs they offer is the usual
              way this fails — so spell out the path. */}
          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
            {CALENDAR_PROVIDERS.map((provider) => (
              <li key={provider}>
                {translate(`crm.profile.calendar.help.${provider}`)}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            {translate("crm.profile.calendar.caution")}
          </p>
        </>
      ) : (
        <ExternalCalendarList />
      )}
    </div>
  );
};

/**
 * A feed address is long, opaque and not meant to be read — it only has to be
 * recognisable. So each line is clipped to the card's width with an ellipsis,
 * and the full address stays available on hover rather than wrapping over four
 * lines and pushing the rest of the form down.
 */
const ExternalCalendarList = () => {
  const translate = useTranslate();
  const record = useRecordContext<Sale>();
  const urls = record?.ical_urls ?? [];

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">
        {translate("resources.sales.fields.ical_urls")}
      </p>
      {urls.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {translate("crm.profile.calendar.empty", { _: "No calendar" })}
        </p>
      ) : (
        <ul className="space-y-1">
          {urls.map((url) => (
            <li key={url} className="text-sm truncate" title={url}>
              {url}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const LanguageSelector = () => {
  const translate = useTranslate();
  const locales = useLocales();
  const [locale, setLocale] = useLocaleState();

  if (locales.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {translate("crm.language")}
      </p>
      <Select value={locale} onValueChange={setLocale}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {locales.map((language) => (
            <SelectItem key={language.locale} value={language.locale}>
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const TextRender = ({
  source,
  isEditMode,
  className,
}: {
  source: string;
  isEditMode: boolean;
  className?: string;
}) => {
  const label = `resources.sales.fields.${source}`;
  if (isEditMode) {
    return (
      <TextInput
        source={source}
        label={label}
        helperText={false}
        className={className}
      />
    );
  }
  return (
    <div className={className}>
      <RecordField source={source} label={label} />
    </div>
  );
};

const CopyPaste = ({ value }: { value: string }) => {
  const translate = useTranslate();
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(value);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            onClick={handleCopy}
            variant="ghost"
            className="normal-case justify-between w-full"
          >
            <span className="overflow-hidden text-ellipsis">{value}</span>
            {copied ? (
              <Check className="h-4 w-4 ml-2" />
            ) : (
              <Copy className="h-4 w-4 ml-2" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {copied
              ? translate("crm.common.copied")
              : translate("crm.common.copy")}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

ProfilePage.path = "/profile";
