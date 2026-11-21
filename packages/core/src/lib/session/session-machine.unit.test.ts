import { sessionMachine } from "@workspace/core/session/session-machine";
import { describe, expect, it } from "vitest";
import { machineToJSON } from "xstate";
import { toDirectedGraph } from "xstate/graph";

interface GraphNode {
  readonly id: string;
  readonly children: readonly GraphNode[];
  readonly edges: readonly {
    readonly source: { readonly id: string };
    readonly target: { readonly id: string };
    readonly transition: { readonly eventType: string };
  }[];
}

const edgesOf = (node: GraphNode): string[] => [
  ...node.edges.map(
    (edge) =>
      `${edge.source.id} -[${edge.transition.eventType}]-> ${edge.target.id}`
  ),
  ...node.children.flatMap(edgesOf),
];

describe("sessionMachine", () => {
  it("should show every transition to graph tools", () => {
    const graph = toDirectedGraph(sessionMachine);

    const edges = edgesOf(graph);

    expect(graph.analysis?.transitionTargetsComplete).toBe(true);
    expect(edges.toSorted()).toEqual([
      "session -[END]-> session.ending",
      "session -[START]-> session.starting",
      "session.ending -[xstate.done.actor]-> session.idle",
      "session.ending -[xstate.error.actor]-> session.idle",
      "session.idle -[ACCESS_REJECTED]-> session.refreshing",
      "session.refreshing -[xstate.done.actor]-> session.idle",
      "session.refreshing -[xstate.error.actor]-> session.ending",
      "session.starting -[xstate.done.actor]-> session.idle",
      "session.starting -[xstate.error.actor]-> session.idle",
    ]);
  });

  it("should export as JSON that names the work of each state", () => {
    const json = machineToJSON(sessionMachine);

    const sources = Object.entries(json.states ?? {}).map(
      ([state, config]) =>
        [
          state,
          [config.invoke ?? []].flat().map((invoke) => invoke.src),
        ] as const
    );

    expect(sources).toEqual([
      ["idle", []],
      ["starting", ["start"]],
      ["refreshing", ["refresh"]],
      ["ending", ["end"]],
    ]);
  });
});
