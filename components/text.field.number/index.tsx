import "./index.css";
import {
  InputAdornment,
  TextField,
  Stack,
  TextFieldProps,
  OutlinedInputProps,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import React from "react";
import { useField } from "formik";

export type TextfieldNumberProps = {
  inputProps?: Partial<OutlinedInputProps>;
  name: string;
  onArrow?: any;
  value?: string;
} & TextFieldProps;

/**
 * This component is used to customize the up/down spin icons for the MUI TextField, which are native to the html number input itself.
 */
export default function TextfieldNumber({
  inputProps,
  onArrow,
  value,
  ...customProps
}: TextfieldNumberProps) {
  const increment = inputProps?.step || "1";
  const max = inputProps?.max || Infinity;
  const min = inputProps?.min || -Infinity;

  return (
    <TextField
      {...customProps}
      className="textfield-number"
      data-testid="textfield.number"
      type="number"
      inputProps={{
        ...inputProps,
        onWheel: (e: React.WheelEvent<HTMLInputElement>) =>
          (e.target as HTMLInputElement).blur(),
      }}
      InputProps={{
        autoComplete: "off",
        endAdornment: (
          <InputAdornment position="end">
            <Stack
              sx={{
                marginRight: "-7px",
                cursor: "pointer",
              }}
            >
              <KeyboardArrowUp
                className="up-arrow"
                data-testid="up-arrow"
                onClick={() => {
                  if (value !== undefined) {
                    const newVal = +value + +increment;
                    if (typeof onArrow === "function" && newVal <= max) {
                      onArrow(newVal);
                    }
                  }
                }}
              />
              <KeyboardArrowDown
                className="down-arrow"
                data-testid="down-arrow"
                onClick={() => {
                  if (value !== undefined) {
                    const newVal = +value - +increment;
                    if (typeof onArrow === "function" && newVal >= min) {
                      onArrow(newVal);
                    }
                  }
                }}
              />
            </Stack>
          </InputAdornment>
        ),
      }}
      variant="outlined"
      {...customProps}
      value={value}
    />
  );
}

export const TextFieldNumberFormik = (props: TextfieldNumberProps) => {
  const [field, meta, form] = useField(props.name);
  const handlers = { ...field, error: !!(meta.touched && meta.error) };
  return (
    <TextfieldNumber
      {...props}
      {...handlers}
      onArrow={(newVal: number) => form.setValue(newVal)}
    />
  );
};
