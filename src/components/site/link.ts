/**
 * TanStack's <Link> adds an `active` class to the matching link by default. The original
 * layout only highlights the top navigation, so every other link opts out of that class.
 */
export const NO_AUTO_ACTIVE_CLASS = {
  activeProps: { className: "" },
  inactiveProps: { className: "" },
} as const;
