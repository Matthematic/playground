export const IP_PATTERN =
  "(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
export const CIDR_PATTERN = "($|\\/\\b([0-9]{1,2}|1[01][0-9]|12[0-8]))";
export const IP_LIST_PATTERN = `^(${IP_PATTERN}((-${IP_PATTERN})?|${CIDR_PATTERN})(?:\\s*,\\s*|$))+$`;
