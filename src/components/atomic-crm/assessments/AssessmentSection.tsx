import type { ComponentType, ReactNode, SVGProps } from "react";
import { useTranslate } from "ra-core";

/**
 * A numbered section of the discovery form, with the green pictogram badge and
 * the navy heading of the printed document.
 */
export const AssessmentSection = ({
  number,
  title,
  icon: Icon,
  hint,
  children,
}: {
  /** Omitted for the few side panels that carry no number on the form. */
  number?: number;
  /** i18n key of the section heading. */
  title: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** i18n key of the question printed under the heading, when there is one. */
  hint?: string;
  children: ReactNode;
}) => {
  const translate = useTranslate();
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="flex flex-row items-center gap-2 border-b border-brand/40 pb-1 text-base font-semibold text-brand-heading">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
            <Icon className="size-4" />
          </span>
          {number != null && <span className="text-brand">{number}.</span>}
          {translate(title)}
        </h3>
        {hint && (
          <p className="text-sm text-muted-foreground">{translate(hint)}</p>
        )}
      </div>
      {children}
    </section>
  );
};
