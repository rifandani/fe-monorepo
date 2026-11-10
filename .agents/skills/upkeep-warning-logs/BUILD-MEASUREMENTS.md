# Build measurements

Use this reference when taking the baseline and evaluating build improvements.

## Comparable measurements

Record the command, source revision or working-tree state, tool versions, build mode, relevant environment settings, and cache state. Use the same machine and conditions for the baseline and candidate.

Measure elapsed build time and identify the expensive stages with the build tool's existing reports or profiling support. Distinguish a real build from a task-cache hit that restores output. Separate cold builds from warm or incremental builds. Reset only the relevant generated output or task cache through supported controls; keep dependency installations and unrelated caches intact. Run measurements without competing builds. Repeat comparable runs and report the median and range when startup costs or machine load cause variation. Treat changes within that variation as inconclusive.

Measure deployable output separately from caches and intermediate files. Record raw size and the compressed transfer size where relevant. For browser apps, distinguish initial JavaScript and CSS, lazy chunks, assets, and total output. State the compression method. Use the same artifact set and compression settings in both measurements. For other platforms, use the applicable package or artifact size. Mark unsupported metrics as unavailable with a reason.

## Find candidates

Use evidence to select candidates:

- Slow stages: repeated transforms or type generation, duplicate tasks, broad file scans, expensive plugins, and independent work run in sequence.
- Cache misses: incomplete or unstable cache keys, unnecessary invalidation, and missing task inputs or outputs. Verify cache correctness as well as speed.
- Large output: duplicated dependencies, retained unused code, broad imports, unnecessary locales or polyfills, and oversized assets. Use bundle reports or dependency traces to identify the source.
- Initial browser load: code and assets loaded before use. Check whether a supported import boundary or deferred asset improves the initial load without an unacceptable delay on the affected route.

Keep improvements tied to the measured cost. Chunk rearrangement alone does not prove that total output is smaller. A cache hit alone does not prove that the build itself is faster. State tradeoffs when time, size, and runtime loading move in different directions.
