import { TextField, Chip, Autocomplete } from "@mui/material";
import { get } from "lodash";
import { useFormikContext } from "formik";

type TextFieldChipProps = {
  label: string;
  name: string;
  helperText?: string;
  required?: boolean;
  value?: string[];
  error?: boolean;
};

const TextFieldChip = ({
  label,
  name,
  helperText = "Type out a value and hit the 'Enter' key",
  required = false,
  value,
  error,
  ...customProps
}: TextFieldChipProps) => {
  return (
    <Autocomplete
      multiple
      options={[]}
      freeSolo
      renderTags={(value, getTagProps) => {
        return value.map((option, index) => (
          <Chip
            color="primary"
            label={option}
            {...getTagProps({ index })}
            key={option}
          />
        ));
      }}
      {...customProps}
      value={value}
      clearOnBlur
      renderInput={(params) => (
        <TextField
          {...params}
          error={error}
          variant="outlined"
          label={label}
          name={name}
          helperText={helperText}
          required={required ? value?.length === 0 : false} // Needed to pass form validation checks
        />
      )}
    />
  );
};

export default TextFieldChip;

export const TextFieldChipFormik = (props: TextFieldChipProps) => {
  const formik = useFormikContext();
  const handlers = {
    onChange: (e: React.SyntheticEvent<Element, Event>, newValue: string[]) =>
      formik.setFieldValue(props.name, newValue),
    onBlur: (e: React.FocusEvent<HTMLInputElement, Element>) => {
      const existingValues = get(formik.values, props.name);
      if (e.target.value.length) {
        if (
          Array.isArray(existingValues) &&
          !existingValues.includes(e.target.value)
        ) {
          formik.setFieldValue(props.name, [...existingValues, e.target.value]);
        } else {
          formik.setFieldValue(props.name, [e.target.value]);
        }
      }
      formik.handleBlur(e);
    },
    value: get(formik.values, props.name) || [],
    error:
      !!get(formik.touched, props.name) && !!get(formik.errors, props.name),
  };

  return <TextFieldChip {...props} required={props.required} {...handlers} />;
};
