# Contributing

## Local setup

```bash
npm install
npm run build
```

## Contribution rules

- Keep the core transport and event-normalization logic headless.
- Additive changes only for event support: do not remove existing event mappings without a migration note.
- Keep browser compatibility in mind (the SDK is intended for web runtimes).
- Update `README.md` when adding new public exports.

## Pull request checklist

- Build passes (`npm run build`)
- Public types are updated
- README usage examples still match API

