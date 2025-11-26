from __future__ import annotations

from collections import defaultdict, deque
from typing import DefaultDict, Dict, Iterable, List, Tuple

Edge = Tuple[str, str, int]


def build_capacity(edges: Iterable[Edge]) -> DefaultDict[str, Dict[str, int]]:
    capacity: DefaultDict[str, Dict[str, int]] = defaultdict(dict)
    for u, v, cap in edges:
        capacity[u][v] = capacity[u].get(v, 0) + cap  # allow parallel edges
        capacity[v]  # ensure key exists for easy iteration
    return capacity


def edmonds_karp(capacity: DefaultDict[str, Dict[str, int]], source: str, sink: str):
    """Classic Edmonds-Karp implementation returning max flow and residual graph."""
    residual: DefaultDict[str, Dict[str, int]] = defaultdict(lambda: defaultdict(int))

    # Initialize residual graph with forward capacities and zero backward capacities
    for u in capacity:
        for v, cap in capacity[u].items():
            residual[u][v] += cap
            residual[v]  # ensure reverse node exists

    max_flow = 0

    def bfs() -> Tuple[int, Dict[str, str]]:
        visited = {source}
        parent: Dict[str, str] = {}
        q: deque[Tuple[str, int]] = deque([(source, float("inf"))])

        while q:
            node, flow = q.popleft()
            for nxt, cap in residual[node].items():
                if nxt not in visited and cap > 0:
                    visited.add(nxt)
                    parent[nxt] = node
                    new_flow = min(flow, cap)
                    if nxt == sink:
                        return new_flow, parent
                    q.append((nxt, new_flow))
        return 0, parent

    while True:
        path_flow, parent = bfs()
        if path_flow == 0:
            break
        max_flow += path_flow

        v = sink
        while v != source:
            u = parent[v]
            residual[u][v] -= path_flow
            residual[v][u] += path_flow
            v = u

    return max_flow, residual


def summarize_flows(
    capacity: DefaultDict[str, Dict[str, int]], residual: DefaultDict[str, Dict[str, int]]
) -> List[Tuple[str, str, int]]:
    """Return (u, v, flow) for each original edge."""
    flows: List[Tuple[str, str, int]] = []
    for u in capacity:
        for v, cap in capacity[u].items():
            used = cap - residual[u][v]
            if used:
                flows.append((u, v, used))
    return sorted(flows)


def main():
    # Problem data
    super_source = "Source"
    sink = "L.A."

    edges: List[Edge] = [
        # supply edges
        (super_source, "NY", 40_000),
        (super_source, "Philadelphia", 30_000),
        # routing arcs from the provided table
        ("NY", "Indy", 17_000),
        ("NY", "Cleveland", 29_000),
        ("Philadelphia", "Indy", 22_000),
        ("Philadelphia", "Cleveland", 11_000),
        ("Indy", "Denver", 13_000),
        ("Indy", "Dallas", 24_000),
        ("Cleveland", "Denver", 20_000),
        ("Cleveland", "Dallas", 28_000),
        ("Denver", sink, 45_000),
        ("Dallas", sink, 25_000),
    ]

    capacity = build_capacity(edges)
    max_flow, residual = edmonds_karp(capacity, super_source, sink)
    flows = summarize_flows(capacity, residual)

    print(f"Maximum packets delivered to {sink}: {max_flow:,}")
    print("Flow on each arc (excluding zero flows):")
    for u, v, f in flows:
        if u == super_source:
            continue  # skip supply edges for clarity
        print(f"  {u:12s} -> {v:10s}: {f:,}")

    delivered_from_ny = next((f for u, v, f in flows if u == super_source and v == "NY"), 0)
    delivered_from_phl = next((f for u, v, f in flows if u == super_source and v == "Philadelphia"), 0)
    print()
    print(f"Packets accepted from NY: {delivered_from_ny:,} / 40,000")
    print(f"Packets accepted from Philadelphia: {delivered_from_phl:,} / 30,000")


if __name__ == "__main__":
    main()
