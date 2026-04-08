# Datasets

These small CSVs ship with the repo so the ML pipeline can train end-to-end
without any external data. In production they're regenerated nightly from the
MongoDB activity collection.

| File           | Schema                                              |
|----------------|-----------------------------------------------------|
| `activity.csv` | `user_id, product_id, event_type, ts`               |
| `sales.csv`    | `product_id, day, units`                            |
| `reviews.csv`  | `text, label`  (label=1 → fake)                     |

`product_images/<product_id>/*.jpg` is used by the image-search builder.
