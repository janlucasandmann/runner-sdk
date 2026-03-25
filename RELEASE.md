# Release Checklist

1. Update version in `package.json`.
2. Run:

```bash
npm ci
npm run build
npm pack
```

3. Verify package contents include `dist/` and exclude local-only files.
4. Publish:

```bash
npm publish --access public
```

5. Tag release in Git:

```bash
git tag v<version>
git push origin v<version>
```

