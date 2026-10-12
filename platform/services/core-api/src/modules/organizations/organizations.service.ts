import type { OrganizationsRepo } from "./organizations.repo";
import type { CreateOrganizationInput } from "./organizations.schema";

export class SlugTakenError extends Error {
  readonly statusCode = 409;
  constructor(slug: string) {
    super(`Organization slug "${slug}" is already taken`);
    this.name = "Conflict";
  }
}

/** Business rules live here; routes stay thin and repos stay dumb. */
export function createOrganizationsService(repo: OrganizationsRepo) {
  return {
    listMine: (userId: string) => repo.listForUser(userId),

    async create(userId: string, input: CreateOrganizationInput) {
      if (await repo.slugExists(input.slug)) throw new SlugTakenError(input.slug);
      return repo.create({ ...input, ownerId: userId });
    },

    get: (id: string) => repo.findById(id),
  };
}

export type OrganizationsService = ReturnType<typeof createOrganizationsService>;
