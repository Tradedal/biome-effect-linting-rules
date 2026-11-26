# Roadmap

## Completed matcher batch

All three changes were published in `@tradedal/linteffect@0.1.1-dev.3` under npm's `dev` tag. [Release](https://github.com/Tradedal/biome-effect-linting-rules/releases/tag/v0.1.1-dev.3)

- [x] **React APIs in shared controls.** Allow direct reads of supported React Aria control contexts. Report other context and ref uses individually so a control can suppress its own use while application state from the same import still receives diagnostics. [Consumer guide](docs/linting.md#react-state-and-synchronization)
- [x] **Evaluated Effect values and complete Layers.** Allow evaluated `Effect.runSync` values and completed Layer pipelines that end in `Layer.unwrap` or `Layer.provideMerge`. Keep diagnostics for intermediate Effect declarations. [Staging rule](rules/no-effect-step-const-staging.grit)
- [x] **Work inside Match branches.** Allow a single lookup with a property projection and account for deferred CLI handlers. Keep diagnostics for dependent Effect work that the branch itself sequences. [Match rule](rules/no-match-effect-branch.grit)

The consumer rerun verified the React, Effect staging, and short lookup cases. A generic fixture covers deferred CLI handlers. The full suite passed all 159 tests with the checkout rules enabled, and both typechecks passed.

## Rule policy decisions

- **Dynamic imports in CLI entry points.** Decide whether [`prevent-dynamic-imports`](rules/prevent-dynamic-imports.grit) should permit a CLI to load a selected command tree when the tree depends on code that the CLI generates. Keep coverage for dynamic imports inside domain operations.

- **Layer provision per invocation.** Decide when [`no-inline-runtime-provide`](rules/no-inline-runtime-provide.grit) should permit a build, tool, or test invocation to acquire and release a fresh graph. Keep coverage for reusable services whose callers expect shared dependencies.

- **Assertions on trusted recordings.** Decide whether [`no-model-overlay-cast`](rules/no-model-overlay-cast.grit) should allow a direct assertion on imported JSON when a fixture treats the recording as trusted input. If the rule allows it, keep diagnostics for transformed values, operation inputs, and local bindings that shadow the import.

- **Logging-only `Effect.tap`.** Define a matcher for the documented convention. Cover data-first and curried forms, aliases, direct logging, and callbacks that combine logging with business mutations. [Effect composition guide](docs/linting.md)

- **Compound collection predicates.** Decide whether to require Effect predicate combinators for inline and named collection callbacks. A rewrite must preserve equality and short-circuit behavior. Use a diagnostic without a fix when the matcher cannot establish equivalence.

## Performance on generated source

Measure the current full preset and individual rules on real large generated TypeScript modules. Use the baseline to identify expensive matchers before changing them. Keep the timing inputs and results outside tracked files when they contain nonpublic data. [Rule development guide](docs/rules-development.md#verify-preset-and-package-use)

## Package and CLI proposals

- Consider `core` as the default preset for CLI trials. The current default is `full`.
- Consider a `/full` package export alongside the root and `/recommended` exports.
- Explore a `rewrite` command for deterministic fixes that preserve behavior. Use fixtures to establish where each rewrite applies and verify equivalent results, failure behavior, and side-effect order.

Keep the CLI and presets in one package while they share runtime dependencies and a release schedule. Revisit packaging if their requirements diverge.
