# Platform widgets

The initial platform home screen widgets share one compositional base:

- `PlatformDefaultWidget` owns the common shell, class composition, and accessible keyboard activation.
- `PlatformProjectWidget` renders the active project and task surface.
- `PlatformCalendarWidget` renders the compact week and schedule view.
- `PlatformUsageWidget` renders remaining usage and its meter.

Concrete widgets compose `PlatformDefaultWidget`; they do not duplicate shell interaction behavior. Their existing `playground-thread-widget*` DOM classes and inline CSS custom properties are intentionally preserved because the platform stylesheet remains the source of truth for their visual design.

Keep data loading, normalization, routing, and billing calculations outside this directory. Pass display-ready values and callbacks into the widgets.
