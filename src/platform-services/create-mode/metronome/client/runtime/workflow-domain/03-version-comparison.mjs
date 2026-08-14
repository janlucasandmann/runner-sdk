export const METRONOME_WORKFLOW_DOMAIN_03_FRAGMENT = String.raw`
        const METRONOME_VERSION_NODE_RUNTIME_KEYS = new Set([
          "ioContract",
          "dynamicReferences",
        ]);
        const METRONOME_VERSION_NODE_DATA_RUNTIME_KEYS = new Set([
          "runState",
          "onNodeSelect",
          "onInlineNoteChange",
          "onLoopResizeStart",
        ]);

        function stripMetronomeVersionNodeRuntimeFields(node) {
          if (!node || typeof node !== "object" || Array.isArray(node)) return node;
          const nextNode = Object.keys(node).reduce((result, key) => {
            if (!METRONOME_VERSION_NODE_RUNTIME_KEYS.has(key)) result[key] = node[key];
            return result;
          }, {});
          if (nextNode.data && typeof nextNode.data === "object" && !Array.isArray(nextNode.data)) {
            nextNode.data = Object.keys(nextNode.data).reduce((result, key) => {
              if (!METRONOME_VERSION_NODE_DATA_RUNTIME_KEYS.has(key)) result[key] = nextNode.data[key];
              return result;
            }, {});
          }
          return nextNode;
        }

        function canonicalizeMetronomeVersionValue(value) {
          if (value === null) return null;
          if (typeof value === "string" || typeof value === "boolean") return value;
          if (typeof value === "number") return Number.isFinite(value) ? value : null;
          if (typeof value === "undefined" || typeof value === "function") return undefined;
          if (Array.isArray(value)) {
            return value
              .map((item) => canonicalizeMetronomeVersionValue(item))
              .filter((item) => item !== undefined);
          }
          if (typeof value !== "object") return String(value);
          return Object.keys(value)
            .sort((left, right) => left.localeCompare(right))
            .reduce((result, key) => {
              const nextValue = canonicalizeMetronomeVersionValue(value[key]);
              if (nextValue !== undefined) result[key] = nextValue;
              return result;
            }, {});
        }

        function createMetronomeVersionPersistedGraphSnapshot(nodes, edges) {
          const persistedNodes = createMetronomePersistedNodes(nodes || []);
          const persistedEdges = normalizeMetronomeEdgesForNodes(
            createMetronomePersistedEdges(edges || []),
            persistedNodes
          );
          return {
            nodes: persistedNodes,
            edges: persistedEdges,
          };
        }

        function createMetronomeVersionComparableDefinition(nodes, edges) {
          const persistedGraph = createMetronomeVersionPersistedGraphSnapshot(nodes, edges);
          const persistedNodes = persistedGraph.nodes;
          const persistedEdges = persistedGraph.edges;
          const comparableNodes = persistedNodes
            .map((node) => canonicalizeMetronomeVersionValue(
              stripMetronomeVersionNodeRuntimeFields(node)
            ))
            .sort((left, right) => String(left?.id || "").localeCompare(String(right?.id || "")));
          const comparableEdges = persistedEdges
            .map((edge) => canonicalizeMetronomeVersionValue(edge))
            .sort((left, right) => {
              const leftKey = [left?.source, left?.sourceHandle, left?.target, left?.targetHandle, left?.id]
                .map((value) => String(value || ""))
                .join("::");
              const rightKey = [right?.source, right?.sourceHandle, right?.target, right?.targetHandle, right?.id]
                .map((value) => String(value || ""))
                .join("::");
              return leftKey.localeCompare(rightKey);
            });
          return { nodes: comparableNodes, edges: comparableEdges };
        }

        function createMetronomeVersionGraphSignature(nodes, edges) {
          return JSON.stringify(createMetronomeVersionComparableDefinition(nodes, edges));
        }

        function areMetronomeVersionGraphsEqual(leftNodes, leftEdges, rightNodes, rightEdges) {
          return createMetronomeVersionGraphSignature(leftNodes, leftEdges)
            === createMetronomeVersionGraphSignature(rightNodes, rightEdges);
        }

        function readMetronomeVersionGraph(deployment) {
          const source = deployment && typeof deployment === "object" ? deployment : {};
          const definition = source.definition && typeof source.definition === "object"
            ? source.definition
            : {};
          return {
            nodes: Array.isArray(source.nodes)
              ? source.nodes
              : (Array.isArray(definition.nodes) ? definition.nodes : []),
            edges: Array.isArray(source.edges)
              ? source.edges
              : (Array.isArray(definition.edges) ? definition.edges : []),
          };
        }

        function resolveMetronomeVersionGraphBase(
          deployments,
          sourceNodes,
          sourceEdges,
          preferredDeploymentId = ""
        ) {
          const candidates = Array.isArray(deployments) ? deployments.filter(Boolean) : [];
          if (!candidates.length) return null;
          const normalizedPreferredId = String(preferredDeploymentId || "").trim();
          const preferredDeployment = normalizedPreferredId
            ? candidates.find((deployment) => String(deployment?.id || "") === normalizedPreferredId) || null
            : null;
          const matchesSourceGraph = (deployment) => {
            const graph = readMetronomeVersionGraph(deployment);
            return areMetronomeVersionGraphsEqual(
              sourceNodes || [],
              sourceEdges || [],
              graph.nodes,
              graph.edges
            );
          };
          if (preferredDeployment && matchesSourceGraph(preferredDeployment)) {
            return preferredDeployment;
          }
          return candidates.find(matchesSourceGraph)
            || preferredDeployment
            || candidates.find((deployment) => String(deployment?.status || "").toLowerCase() === "active")
            || candidates[0]
            || null;
        }
`;
