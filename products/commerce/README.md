# Commerce

Products, orders, sales

| Folder      | Nx tags                      | Purpose                                       |
| ----------- | ---------------------------- | --------------------------------------------- |
| `domain/`   | scope:commerce, type:domain  | Entities, schemas, rules (no framework code)  |
| `frontend/` | scope:commerce, type:feature | UI + `product manifest` mounted by apps/web   |
| `db/`       | scope:commerce, type:data    | Migrations for the `commerce` Postgres schema |

Rules: this product may import only `scope:commerce` and `scope:shared` code. Talk to other products through events and APIs.
