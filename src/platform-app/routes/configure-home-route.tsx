import { Bot, Monitor, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAgentResourceRepository } from "../../platform-resources/agents/client/index.js";
import { useComputerResourceRepository } from "../../platform-resources/computers/client/index.js";
import { useSkillResourceRepository } from "../../platform-resources/skills/client/index.js";
import { navigatePlatformClient } from "../routing/platform-browser-navigation.js";
import { ConfigureHomeOverviewPage } from "../routing/platform-lazy-pages.js";
import { usePlatformRuntime } from "../runtime/platform-runtime.js";

export function ConfigureHomeRoute() {
  const runtime = usePlatformRuntime();
  const agentRepository = useAgentResourceRepository();
  const computerRepository = useComputerResourceRepository();
  const skillRepository = useSkillResourceRepository();
  const [counts, setCounts] = useState({
    agents: 0,
    computers: 0,
    skills: 0,
  });

  const load = useCallback(
    async (signal?: AbortSignal) => {
      const results = await Promise.allSettled([
        agentRepository.list(signal),
        computerRepository.list(signal),
        skillRepository.list(signal),
      ]);
      if (signal?.aborted) return;
      const [agentResult, computerResult, skillResult] = results;
      setCounts({
        agents: agentResult.status === "fulfilled" ? agentResult.value.length : 0,
        computers: computerResult.status === "fulfilled" ? computerResult.value.length : 0,
        skills: skillResult.status === "fulfilled" ? skillResult.value.length : 0,
      });
    },
    [agentRepository, computerRepository, skillRepository],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const cards = useMemo(
    () => [
      {
        id: "agents",
        title: "Agents",
        description: "Agents available for workspace runs.",
        value: counts.agents.toLocaleString("en-US"),
        icon: Bot,
        onClick: () => navigatePlatformClient("agents"),
      },
      {
        id: "computers",
        title: "Computers",
        description: "Persistent workspaces agents can use.",
        value: counts.computers.toLocaleString("en-US"),
        icon: Monitor,
        onClick: () => navigatePlatformClient("computers"),
      },
      {
        id: "skills",
        title: "Skills",
        description: "Capabilities agents can call during work.",
        value: counts.skills.toLocaleString("en-US"),
        icon: Sparkles,
        onClick: () => navigatePlatformClient("skills"),
      },
    ],
    [counts],
  );
  const documentationOrigin = runtime.aiosOrigin || "https://computer-agents.com";

  return (
    <ConfigureHomeOverviewPage
      cards={cards}
      onOpenNotifications={() => navigatePlatformClient("notifications")}
      onOpenEvaluations={() => navigatePlatformClient("evaluations")}
      onOpenGuardrails={() => navigatePlatformClient("guardrails")}
      onOpenPricing={() =>
        window.open("https://computer-agents.com/pricing", "_blank", "noopener,noreferrer")
      }
      onOpenDocumentation={() =>
        window.open(`${documentationOrigin}/developers`, "_blank", "noopener,noreferrer")
      }
    />
  );
}
