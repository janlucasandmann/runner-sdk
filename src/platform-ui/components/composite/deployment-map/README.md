# Deployment Map

`PlatformDeploymentMap` is the shared, accessible world deployment map for
resource details pages.

The browser component does not perform geographic processing. The dotted SVG
is generated once with `dotted-map` and served as a cacheable image:

```bash
npm run platform-deployment-map-generate
```

The component resolves supported platform region codes to coordinates and
positions a lightweight HTML marker over the static equirectangular map.
