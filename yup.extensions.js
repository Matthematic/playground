import * as Yup from "yup";
import moment from "moment";
import { countIPAddresses, isValidIPAddress } from "./IP.utils";

/**
 * Adds a new Yup schema for strings that, assuming they are a valid timestamp,
 * will enforce them to not be in the past
 */
Yup.addMethod(Yup.string, "isNotPast", function isNotPast(message) {
  return this.test(
    "modulo",
    message || "Time cannot be in the past",
    function (originalValue) {
      const { path, createError } = this;
      const error = createError({
        path,
        message: message || "Time cannot be in the past",
      });
      if (
        !originalValue ||
        (originalValue && !moment(originalValue).isValid())
      ) {
        return error;
      }
      const val = moment(originalValue) >= moment();
      return val || error;
    }
  );
});

/**
 * Adds a new Yup schema for strings that, assuming they are a valid timestamp,
 * will enforce the minutes to be in an interval of 5
 */
Yup.addMethod(Yup.string, "modulo", function modulo(operand, message) {
  return this.test(
    "modulo",
    message || `Value must be an increment of ${operand}`,
    function (originalValue) {
      const { path, createError } = this;
      const error = createError({
        path,
        message: message || `Value must be an increment of ${operand}`,
      });
      if (
        !originalValue ||
        (originalValue && !moment(originalValue).isValid())
      ) {
        return error;
      }
      const value = moment(originalValue).utc().minute() % operand;
      return value === 0 ? true : error;
    }
  );
});

/**
 * Adds a new Yup schema for strings that validates a comma-separated list of IP addresses and ensures
 * they are below a maximum number.
 */
Yup.addMethod(Yup.string, "validateTargets", function validateTargets(max) {
  return this.test(
    "validateTargets",
    `Invalid targets value`,
    function (originalValue) {
      const { path, createError } = this;

      const addresses = originalValue
        .split(",")
        .filter(Boolean)
        .map((addr) => addr.trim());
      let count = 0;
      for (let i = 0; i < addresses.length; i++) {
        const addr = addresses[i];
        if (!isValidIPAddress(addr)) {
          return createError({
            path,
            message: `Invalid target format supplied.`,
          });
        }
        if (Number(max)) {
          count += countIPAddresses(addr);
        }
      }
      if (count > max) {
        return createError({
          path,
          message: `Max targets is ${max}. You have entered ${count}.`,
        });
      }
      return true;
    }
  );
});

export default Yup;
