# Fulfillment

Shipping, returns

| Folder      | Nx tags                         | Purpose                                          |
| ----------- | ------------------------------- | ------------------------------------------------ |
| `domain/`   | scope:fulfillment, type:domain  | Entities, schemas, rules (no framework code)     |
| `frontend/` | scope:fulfillment, type:feature | UI + `product manifest` mounted by apps/web      |
| `db/`       | scope:fulfillment, type:data    | Migrations for the `fulfillment` Postgres schema |

Rules: this product may import only `scope:fulfillment` and `scope:shared` code. Talk to other products through events and APIs.
