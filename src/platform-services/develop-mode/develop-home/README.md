# Develop Home service

Owns the Develop mode landing surface, navigation projection, operational-metrics
loader, responsive page styling, and the browser renderer used by the demo host.

The host supplies shared transport, chart, resource, settings, and shell
primitives. This package deliberately emits browser-script fragments so the
legacy single-document demo can compose the service without changing runtime
behavior while ownership moves out of `examples/demo-server.mjs`.
