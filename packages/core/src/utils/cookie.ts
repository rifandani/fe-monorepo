interface CookieAttributes {
  value: string;
  "max-age"?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;
  httponly?: boolean;
  samesite?: "strict" | "lax" | "none";
  // oxlint-disable-next-line typescript/no-explicit-any -- cookie attribute index signature
  [key: string]: any;
}

type CookieAttrHandler = (attrObj: CookieAttributes, attrValue: string) => void;

const trimOrUndefined = (value: string): string | undefined =>
  value ? value.trim() : undefined;

const COOKIE_ATTR_HANDLERS: Record<string, CookieAttrHandler> = {
  "max-age": (attrObj, attrValue) => {
    attrObj["max-age"] = attrValue
      ? Math.trunc(Number(attrValue.trim()))
      : undefined;
  },
  expires: (attrObj, attrValue) => {
    attrObj.expires = attrValue ? new Date(attrValue.trim()) : undefined;
  },
  domain: (attrObj, attrValue) => {
    attrObj.domain = trimOrUndefined(attrValue);
  },
  path: (attrObj, attrValue) => {
    attrObj.path = trimOrUndefined(attrValue);
  },
  secure: (attrObj) => {
    attrObj.secure = true;
  },
  httponly: (attrObj) => {
    attrObj.httponly = true;
  },
  samesite: (attrObj, attrValue) => {
    attrObj.samesite = attrValue
      ? (attrValue.trim().toLowerCase() as "strict" | "lax" | "none")
      : undefined;
  },
};

const applyCookieAttribute = (
  attrObj: CookieAttributes,
  attribute: string
): void => {
  const [attrName, ...attrValueParts] = attribute.split("=");
  const attrValue = attrValueParts.join("=");
  const normalizedAttrName = attrName?.trim().toLowerCase() ?? "";
  const handler = COOKIE_ATTR_HANDLERS[normalizedAttrName];
  if (handler) {
    handler(attrObj, attrValue);
    return;
  }
  attrObj[normalizedAttrName] = attrValue ? attrValue.trim() : true;
};

export const parseSetCookieHeader = (
  setCookie: string
): Map<string, CookieAttributes> => {
  const cookies = new Map<string, CookieAttributes>();
  const cookieArray = setCookie.split(", ");
  for (const cookieString of cookieArray) {
    const parts = cookieString.split(";").map((part) => part.trim());
    const [nameValue, ...attributes] = parts;
    const [name, ...valueParts] = nameValue?.split("=") ?? [];
    const value = valueParts.join("=");
    if (!name || value === undefined) {
      continue;
    }
    const attrObj: CookieAttributes = { value };
    for (const attribute of attributes) {
      applyCookieAttribute(attrObj, attribute);
    }
    cookies.set(name, attrObj);
  }
  return cookies;
};
