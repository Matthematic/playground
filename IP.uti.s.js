import ipaddr from "ipaddr.js";

const RANGE_REGEX =
  /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})-(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;
const CIDR_REGEX = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/;

export function ipsBetween(start, end) {
  start = start.split(".");

  return (
    end.split(".").reduce(function (sum, x, i) {
      return (sum << 8) + Number(x) - Number(start[i]);
    }, 0) + 1
  );
}

export function isValidIPAddress(address) {
  try {
    if (!address || address.split(".").length < 4) {
      // only support full length notation x.x.x.x
      return false;
    }
    if (address.match(RANGE_REGEX) || address.match(CIDR_REGEX)) {
      return true;
    }
    const ip = ipaddr.parse(address);
    return ip.kind() !== "ipv6" || ip.isIPv4MappedAddress() || ip.isIPv4();
  } catch (e) {
    return false;
  }
}

export function countIPAddresses(ip) {
  // Parse the input string to check for range or CIDR notation
  const rangeMatch = ip.match(RANGE_REGEX);
  const cidrMatch = ip.match(CIDR_REGEX);

  if (rangeMatch !== null) {
    // Calculate the number of IP addresses in the range
    const rangeSize = ipsBetween(rangeMatch[1], rangeMatch[2]);
    return rangeSize;
  } else if (cidrMatch !== null) {
    // Calculate the number of IP addresses in the CIDR block
    const cidrPrefixLength = parseInt(cidrMatch[2]);
    const numHosts = Math.pow(2, 32 - cidrPrefixLength);
    return numHosts;
  } else {
    // Count the single IP address
    return 1;
  }
}
