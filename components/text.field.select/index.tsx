import "./index.css";
import {
  InputAdornment,
  MenuItem,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useField } from "formik";

type SelectOption = {
  label: string;
  value: string;
};

type TextFieldSelectProps = {
  options: SelectOption[];
  noOptionsText?: string;
  isCapitalized?: boolean;
  name: string;
  label: string;
  useFormik?: boolean;
} & TextFieldProps;

export default function TextfieldSelect({
  options = [],
  noOptionsText = "No Options",
  isCapitalized = false,
  name,
  label,
  ...customProps
}: TextFieldSelectProps) {
  return (
    <TextField
      className="textfield-select"
      data-testid="textfield-select"
      select
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <KeyboardArrowDown
              sx={{
                marginRight: "-7px",
              }}
              className="down-arrow"
            />
          </InputAdornment>
        ),
      }}
      variant="outlined"
      name={name}
      label={label}
      {...customProps}
    >
      {options?.length ? (
        options?.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            data-testid="menu-item"
          >
            {isCapitalized ? option.label?.toUpperCase() : option.label}
          </MenuItem>
        ))
      ) : (
        <MenuItem data-testid="menu-item">{noOptionsText}</MenuItem>
      )}
    </TextField>
  );
}

export const TextfieldSelectFormik = (props: TextFieldSelectProps) => {
  const [field, meta] = useField(props.name);
  const handlers = { ...field, error: !!(meta.touched && meta.error) };
  return <TextfieldSelect {...props} {...handlers} />;
};
