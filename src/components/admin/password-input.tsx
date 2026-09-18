import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslate } from "ra-core";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password input with a button toggling the visibility of the typed value.
 *
 * Drop-in replacement for `<Input type="password">`.
 */
export const PasswordInput = ({
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "type">) => {
  const [visible, setVisible] = React.useState(false);
  const translate = useTranslate();
  const label = visible
    ? translate("crm.auth.hide_password", { _: "Hide password" })
    : translate("crm.auth.show_password", { _: "Show password" });
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-9", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={label}
        title={label}
        aria-pressed={visible}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground cursor-pointer disabled:pointer-events-none"
        disabled={props.disabled}
      >
        <Icon className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};
