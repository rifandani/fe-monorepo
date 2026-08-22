interface CookieAttributes {
  value: string;
  "max-age"?: number;
  expires?: Date;
  domain?: string;
  path?: string;
  secure?: boolean;
  httponly?: boolean;
  samesite?: "strict" | "lax" | "none";
  /**
   * Attributes outside the set above: `name=value` keeps the trimmed value,
   * a bare flag becomes `true`.
   */
  [key: string]: string | number | boolean | Date | undefined;
}

type CookieAttrHandler = (attrObj: CookieAttributes, attrValue: string) => void;

const trimOrUndefined = (value: string): string | undefined =>
  value ? value.trim() : undefined;

const COOKIE_ATTR_HANDLERS = {
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
    // SAFETY: `SameSite` is validated by the consumer, not the parser - the
    // header value is echoed through lowercased so callers see what was sent.
    attrObj.samesite = attrValue
      ? (attrValue.trim().toLowerCase() as "strict" | "lax" | "none")
      : undefined;
  },
} satisfies Record<string, CookieAttrHandler>;

const isKnownCookieAttr = (
  name: string
): name is keyof typeof COOKIE_ATTR_HANDLERS =>
  Object.hasOwn(COOKIE_ATTR_HANDLERS, name);

const applyCookieAttribute = (
  attrObj: CookieAttributes,
  attribute: string
): void => {
  // Split on the *first* `=` only: an attribute value may itself contain `=`.
  const separatorIndex = attribute.indexOf("=");
  const hasValue = separatorIndex !== -1;
  const attrValue = hasValue ? attribute.slice(separatorIndex + 1) : "";
  const normalizedAttrName = (
    hasValue ? attribute.slice(0, separatorIndex) : attribute
  )
    .trim()
    .toLowerCase();
  if (isKnownCookieAttr(normalizedAttrName)) {
    COOKIE_ATTR_HANDLERS[normalizedAttrName](attrObj, attrValue);
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
    const semicolonIndex = cookieString.indexOf(";");
    const hasAttributes = semicolonIndex !== -1;
    const nameValue = (
      hasAttributes ? cookieString.slice(0, semicolonIndex) : cookieString
    ).trim();
    const attributes = hasAttributes
      ? cookieString
          .slice(semicolonIndex + 1)
          .split(";")
          .map((part) => part.trim())
      : [];
    // A valueless cookie (`novalue`) keeps an empty value; a nameless one is dropped.
    const equalsIndex = nameValue.indexOf("=");
    const name =
      equalsIndex === -1 ? nameValue : nameValue.slice(0, equalsIndex);
    const value = equalsIndex === -1 ? "" : nameValue.slice(equalsIndex + 1);
    if (!name) {
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
