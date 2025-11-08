/**
 * Parses user agent string to extract device and browser information
 */
export function parseUserAgent(userAgent: string | null | undefined): {
  device: string;
  browser: string;
} {
  if (!userAgent) {
    return { device: "Unknown", browser: "Unknown" };
  }

  const ua = userAgent.toLowerCase();

  // Detect device
  let device = "Desktop";
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    device = "Mobile";
  } else if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device = "Tablet";
  }

  // Detect browser
  let browser = "Unknown";
  if (ua.includes("chrome") && !ua.includes("edg")) {
    browser = "Chrome";
  } else if (ua.includes("firefox")) {
    browser = "Firefox";
  } else if (ua.includes("safari") && !ua.includes("chrome")) {
    browser = "Safari";
  } else if (ua.includes("edg")) {
    browser = "Edge";
  } else if (ua.includes("opera") || ua.includes("opr")) {
    browser = "Opera";
  }

  return { device, browser };
}

