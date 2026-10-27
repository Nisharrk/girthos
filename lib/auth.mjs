export function isValidApiKey(key, expectedKey) {
  return typeof key === "string" && key.length > 0 &&
    typeof expectedKey === "string" && expectedKey.length > 0 &&
    key === expectedKey;
}
