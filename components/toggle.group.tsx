import {
    Box,
    InputLabel,
    ToggleButton,
    ToggleButtonGroup,
  } from "@mui/material";
  import { useFormikContext } from "formik";
  import { get } from "lodash";
  import React from "react";
  
  interface Option {
    value: NonNullable<unknown>;
    label: string;
  }
  
  const ToggleGroup = ({
    label,
    name,
    options,
  }: {
    label?: string;
    name: string;
    options: Option[];
  }) => {
    const formik = useFormikContext();
    const formikProps = formik
      ? {
          onChange: (
            e: React.MouseEvent<HTMLElement, MouseEvent>,
            values: NonNullable<unknown>
          ) => {
            formik.setFieldValue(name, values === "null" ? null : values);
          },
          onBlur: formik.handleBlur,
          value:
            get(formik.values, name) === null ? "null" : get(formik.values, name),
        }
      : {};
  
    return (
      <Box display="flex" flexDirection="row">
        <Box alignSelf="center">
          {label ? <InputLabel>{label}</InputLabel> : null}
        </Box>
        <ToggleButtonGroup
          exclusive
          fullWidth
          sx={{
            marginLeft: "10px",
          }}
          {...formikProps}
        >
          {options.map((o, idx: number) => (
            <ToggleButton key={idx} value={o.value}>
              {o.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    );
  };
  
  export default ToggleGroup;
  