import {
    FormControlLabel,
    Switch,
    SwitchProps,
    Typography,
  } from "@mui/material";
  import { useField } from "formik";
  
  type ToggleProps = {
    label: string;
    name: string;
  } & SwitchProps;
  
  const Toggle = ({ label, name, ...customProps }: ToggleProps) => {
    return (
      <FormControlLabel
        label={
          <Typography noWrap variant="body2">
            {label}
          </Typography>
        }
        control={<Switch color="success" name={name} {...customProps} />}
      />
    );
  };
  
  export default Toggle;
  
  export const ToggleFormik = (props: ToggleProps) => {
    const [field, meta, form] = useField(props.name);
    const handlers = {
      ...field,
      error: !!(meta.touched && meta.error),
      onChange: (e: any) => form.setValue(e.target.checked),
      checked: field.value,
    };
    return <Toggle {...props} {...handlers} />;
  };
  