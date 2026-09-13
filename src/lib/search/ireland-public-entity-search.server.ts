import "server-only"

import { getIrelandInstitutions, type IrelandInstitution } from "@/lib/institutions/ireland-institutions.server"
import { filterIrelandPublicSearchEntries } from "./ireland-public-entity-search"
import type { IrelandPublicSearchEntity } from "./ireland-public-entity-search"

export type { IrelandPublicSearchEntity, IrelandPublicSearchEntityType } from "./ireland-public-entity-search"

/**
 * Bounded server-side public Search index for Ireland. Institution records
 * come only from the cached verified reader; cities and Careers use their
 * explicit public route inventories. Degree, industry and employer nodes are
 * deliberately absent because none has a canonical public detail route.
 */
export async function searchIrelandPublicEntities(
  query: string,
): Promise<IrelandPublicSearchEntity[]> {
  let institutions: readonly IrelandInstitution[] = []
  try {
    institutions = await getIrelandInstitutions()
  } catch (error) {
    // Search remains useful for the static public country, city and Career
    // inventory if the optional verified Institution directory is unavailable.
    console.error("Unable to load verified Ireland institutions for public Search", error)
  }

  return filterIrelandPublicSearchEntries(query, institutions)
}
