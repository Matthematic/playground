import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styled from "styled-components";
import { Typography } from "@mui/material";
import { useEffect } from "react";

const ErrorFallback = ({ error, message = "Unable to load." }) => {
  useEffect(() => {
    console.error(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <ErrorContainer role="alert">
      <ErrorOutlineIcon />
      <Typography component="div">{message}</Typography>
    </ErrorContainer>
  );
};

const ErrorContainer = styled.div`
  text-align: center;
  justify-content: center;
`;

export default ErrorFallback;
