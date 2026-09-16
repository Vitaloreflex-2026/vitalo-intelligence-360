import type { ChoicesProps, InputProps, RaRecord } from "ra-core";
import { FieldTitle, useChoices, useInput, useResourceContext } from "ra-core";
import { cn } from "@/lib/utils";
import { FormError, FormField, FormLabel } from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

/**
 * Multi-select input rendered as a list of checkboxes, storing an array of values.
 *
 * Use `<CheckboxGroupInput>` when the user may pick several options among a short,
 * fixed list and should see them all at once. For long lists, prefer
 * `<AutocompleteArrayInput>`.
 *
 * @example
 * import { Edit, SimpleForm, CheckboxGroupInput } from '@/components/admin';
 *
 * const PostEdit = () => (
 *   <Edit>
 *     <SimpleForm>
 *       <CheckboxGroupInput
 *         source="topics"
 *         columns={2}
 *         choices={[
 *           { id: 'tech', name: 'Tech' },
 *           { id: 'people', name: 'People' },
 *         ]}
 *       />
 *     </SimpleForm>
 *   </Edit>
 * );
 */
export const CheckboxGroupInput = (props: CheckboxGroupInputProps) => {
  const {
    choices = [],
    className,
    columns = 1,
    helperText,
    label,
    optionText,
    optionValue = "id",
    source,
    translateChoice,
    ...rest
  } = props;

  const resource = useResourceContext(props);
  const { id, field, isRequired } = useInput({ source, ...rest });
  const { getChoiceText, getChoiceValue } = useChoices({
    optionText,
    optionValue,
    translateChoice,
  });

  const values: string[] = Array.isArray(field.value) ? field.value : [];

  const toggle = (value: string, isChecked: boolean) =>
    field.onChange(
      isChecked ? [...values, value] : values.filter((item) => item !== value),
    );

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <div
        className={cn(
          "gap-2",
          columns === 1 && "grid",
          // CSS multi-column flows top-to-bottom then to the next column, which
          // is how the options are laid out on the paper form.
          columns === 2 && "sm:columns-2",
          columns === 3 && "sm:columns-2 lg:columns-3",
        )}
      >
        {choices.map((choice) => {
          const value = getChoiceValue(choice);
          return (
            <div
              key={value}
              className="flex flex-row items-center gap-2 break-inside-avoid py-1"
            >
              <Checkbox
                id={`${id}-${value}`}
                checked={values.includes(value)}
                onCheckedChange={(isChecked) =>
                  toggle(value, isChecked === true)
                }
              />
              <Label
                htmlFor={`${id}-${value}`}
                className="text-sm font-normal cursor-pointer"
              >
                {getChoiceText(choice)}
              </Label>
            </div>
          );
        })}
      </div>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};

export interface CheckboxGroupInputProps
  extends Omit<Partial<InputProps>, "source">,
    ChoicesProps {
  source: string;
  choices?: RaRecord[];
  className?: string;
  /** Lay the checkboxes out on several columns on wide screens, like a paper form. */
  columns?: 1 | 2 | 3;
  label?: string | false;
}
