import type { KeyboardEvent, ReactElement, ReactNode } from "react";
import { Children, Fragment, isValidElement, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { FormProps } from "ra-core";
import { Form, useTranslate } from "ra-core";
import { useFormContext } from "react-hook-form";
import { CancelButton } from "@/components/admin/cancel-button";
import { SaveButton } from "@/components/admin/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A multi-step form layout: inputs are split into steps, and the user moves from
 * one step to the next only once the current one is valid.
 *
 * Only the current step is mounted, and react-hook-form skips validation for
 * unmounted fields, so "Next" validates the current step only. Values entered in
 * the other steps are kept and submitted together on the last step.
 *
 * With a single step, the step indicator is hidden and the form behaves like a
 * <SimpleForm>.
 *
 * @example
 * import { Create, WizardForm, WizardFormStep, TextInput } from '@/components/admin';
 *
 * const PostCreate = () => (
 *   <Create>
 *     <WizardForm>
 *       <WizardFormStep label="Identity">
 *         <TextInput source="title" />
 *       </WizardFormStep>
 *       <WizardFormStep label="Content">
 *         <TextInput source="body" />
 *       </WizardFormStep>
 *     </WizardForm>
 *   </Create>
 * );
 */
export const WizardForm = ({
  children,
  className,
  initialStep = 0,
  ...rest
}: WizardFormProps) => {
  const steps = flattenSteps(children);
  return (
    <Form
      className={cn("flex flex-col gap-6 w-full max-w-lg", className)}
      {...rest}
    >
      <WizardFormContent steps={steps} initialStep={initialStep} />
    </Form>
  );
};

/**
 * A single step of a <WizardForm>, holding the inputs the user fills at this stage.
 *
 * @param label The step title, shown in the step indicator. Translated when it is an i18n key.
 */
export const WizardFormStep = ({ children }: WizardFormStepProps) => (
  <div className="flex flex-col gap-4">{children}</div>
);

export type WizardFormProps = {
  children: ReactNode;
  className?: string;
  /** Step to open on, when earlier ones are already filled in. */
  initialStep?: number;
} & FormProps;

export type WizardFormStepProps = {
  children: ReactNode;
  label: string;
};

type WizardFormStepElement = ReactElement<WizardFormStepProps>;

const isWizardFormStep = (child: ReactNode): child is WizardFormStepElement =>
  isValidElement(child) && child.type === WizardFormStep;

// Steps are often grouped in a fragment to be shared between the create and the
// edit view, so look inside fragments instead of ignoring them.
const flattenSteps = (children: ReactNode): WizardFormStepElement[] =>
  Children.toArray(children).flatMap((child) => {
    if (isWizardFormStep(child)) return [child];
    if (isValidElement(child) && child.type === Fragment) {
      return flattenSteps((child.props as { children?: ReactNode }).children);
    }
    return [];
  });

const WizardFormContent = ({
  steps,
  initialStep,
}: {
  steps: WizardFormStepElement[];
  initialStep: number;
}) => {
  const [stepIndex, setStepIndex] = useState(
    Math.min(Math.max(initialStep, 0), steps.length - 1),
  );
  const { trigger } = useFormContext();
  const translate = useTranslate();

  const isLastStep = stepIndex === steps.length - 1;

  const handleNext = async () => {
    // Validates the mounted inputs, i.e. those of the current step.
    const isStepValid = await trigger(undefined, { shouldFocus: true });
    if (isStepValid) {
      setStepIndex((index) => index + 1);
    }
  };

  // A step with a single input submits the form when the user hits Enter
  // (implicit submission), which would save a half-filled record.
  const preventImplicitSubmit = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;
    if (event.target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
  };

  return (
    <>
      <WizardFormStepper
        steps={steps}
        currentIndex={stepIndex}
        onStepClick={setStepIndex}
      />
      <div onKeyDown={isLastStep ? undefined : preventImplicitSubmit}>
        {steps[stepIndex]}
      </div>
      <div role="toolbar" className="flex flex-row justify-between gap-2">
        <CancelButton />
        <div className="flex flex-row gap-2">
          {stepIndex > 0 && (
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => setStepIndex((index) => index - 1)}
            >
              <ArrowLeft />
              {translate("crm.wizard.previous", { _: "Previous" })}
            </Button>
          )}
          {isLastStep ? (
            <SaveButton />
          ) : (
            <Button
              type="button"
              className="cursor-pointer"
              onClick={handleNext}
            >
              {translate("crm.wizard.next", { _: "Next" })}
              <ArrowRight />
            </Button>
          )}
        </div>
      </div>
    </>
  );
};

const WizardFormStepper = ({
  steps,
  currentIndex,
  onStepClick,
}: {
  steps: WizardFormStepElement[];
  currentIndex: number;
  onStepClick: (index: number) => void;
}) => {
  const translate = useTranslate();

  // A one-step wizard is just a form: no need for an indicator.
  if (steps.length < 2) return null;

  return (
    <ol className="flex flex-row flex-wrap items-center gap-x-2 gap-y-1">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isCompleted = index < currentIndex;
        return (
          <li
            key={index}
            className="flex flex-row items-center gap-2"
            aria-current={isCurrent ? "step" : undefined}
          >
            <button
              type="button"
              disabled={!isCompleted}
              onClick={() => onStepClick(index)}
              className={cn(
                "flex flex-row items-center gap-2 text-sm",
                isCompleted ? "cursor-pointer" : "cursor-default",
                isCurrent
                  ? "font-medium text-brand-heading"
                  : "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "flex items-center justify-center size-6 rounded-full border text-xs",
                  isCurrent && "bg-brand text-brand-foreground border-brand",
                  isCompleted && "border-brand text-brand",
                )}
              >
                {isCompleted ? <Check className="size-3" /> : index + 1}
              </span>
              {translate(step.props.label, { _: step.props.label })}
            </button>
            {index < steps.length - 1 && (
              <span aria-hidden className="w-6 border-t" />
            )}
          </li>
        );
      })}
    </ol>
  );
};
