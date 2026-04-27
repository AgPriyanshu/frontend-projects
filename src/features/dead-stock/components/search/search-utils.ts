import type { DsSearchPage } from "api/dead-stock";

export const flattenResults = (pages?: DsSearchPage[]) =>
  pages?.flatMap((page) => page.items) ?? [];
