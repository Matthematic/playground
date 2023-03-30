import { TextField, TextFieldProps } from "@mui/material";
import { useField } from "formik";

type TextFieldRawFormikProps = {
  label: string;
  name: string;
} & TextFieldProps;

const TextfieldRaw = ({
  label,
  name,
  ...customProps
}: TextFieldRawFormikProps) => {
  return <TextField label={label} name={name} fullWidth {...customProps} />;
};

export default TextfieldRaw;

export const TextFieldRawFormik = (props: TextFieldRawFormikProps) => {
  const [field, meta] = useField(props.name);
  const handlers = { ...field, error: !!(meta.touched && meta.error) };
  return <TextfieldRaw {...props} {...handlers} />;
};
