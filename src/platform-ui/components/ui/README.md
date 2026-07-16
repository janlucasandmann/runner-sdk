# UI components

Small, domain-agnostic primitives live in this directory. A UI component should have a narrow API, remain useful without platform-specific data, and compose naturally into larger interfaces.

- `button`: primary and secondary action hierarchy and sizing.
- `label`: compact categorical labels with shared color variants.
- `search`: controlled search input with the shared icon, states, and control height.
- `selector`: single-value and button-triggered popup selectors with consistent portaled surfaces and keyboard behavior.
- `switch`: controlled segmented selection and keyboard behavior.

Import primitives through `platform-ui/components/ui`, or through a specific canonical subpath such as `platform-ui/components/ui/button`.

`selector` is the only UI control allowed to depend on a composite component: it deliberately composes the canonical popup surface so selectors cannot introduce another overlay implementation.
