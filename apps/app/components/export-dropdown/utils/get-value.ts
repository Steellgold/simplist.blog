export const getValue = (
  item: Record<string, unknown>,
  key: string,
): unknown => {
  return key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Record<string, unknown>)[part];
    }
    return null;
  }, item);
};
