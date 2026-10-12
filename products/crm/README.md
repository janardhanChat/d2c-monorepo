# CRM

Customers, retention

| Folder      | Nx tags                 | Purpose                                      |
| ----------- | ----------------------- | -------------------------------------------- |
| `domain/`   | scope:crm, type:domain  | Entities, schemas, rules (no framework code) |
| `frontend/` | scope:crm, type:feature | UI + `product manifest` mounted by apps/web  |
| `db/`       | scope:crm, type:data    | Migrations for the `crm` Postgres schema     |

Rules: this product may import only `scope:crm` and `scope:shared` code. Talk to other products through events and APIs.
