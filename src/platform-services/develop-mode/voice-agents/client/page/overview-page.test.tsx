// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DevelopVoiceAgentsOverviewPage } from "./overview-page.js";
import type { DevelopVoiceAgentsOverviewPageProps } from "../domain/index.js";

const rows: DevelopVoiceAgentsOverviewPageProps["rows"] = [{
  id: "agent_voice",
  name: "Voice Concierge",
  description: "Customer support voice agent",
  mode: "web_and_phone",
  model: "grok-voice-latest",
  voiceId: "eve",
  languageHint: "en",
  instructions: "Be concise and helpful.",
  phoneNumber: "+1 555 0100",
  phoneStatus: "active",
  creator: {
    type: "user",
    id: "user_creator",
    userId: "user_creator",
    name: "Creator Person",
    email: "creator@example.com",
    avatarUrl: "",
  },
  owner: {
    type: "user",
    id: "user_owner",
    userId: "user_owner",
    name: "Owner Person",
    email: "owner@example.com",
    avatarUrl: "",
  },
  enabled: true,
  webEnabled: true,
  phoneEnabled: true,
  sessionThreadId: "thread_voice",
  realtimeUrl: "wss://voice.example.test/session",
  searchText: "Voice Concierge agent_voice eve grok web phone",
}];

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    clip: vi.fn(),
    createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fill: vi.fn(),
    rect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
  } as never);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderPage(overrides: Partial<DevelopVoiceAgentsOverviewPageProps> = {}) {
  const props: DevelopVoiceAgentsOverviewPageProps = {
    rows,
    period: "month",
    onPeriodChange: vi.fn(),
    operationalMetrics: {
      labels: ["Jul 20", "Jul 21"],
      series: {
        voiceCalls: [2, 3],
        voiceMinutes: [8, 12],
      },
      totals: {
        voiceCalls: 5,
        voiceMinutes: 20,
      },
    },
    controlsPortalId: "voice-agent-test-controls",
    modeOptions: [
      { id: "off", label: "Off" },
      { id: "web", label: "Web" },
      { id: "phone", label: "Phone" },
      { id: "web_and_phone", label: "Web and Phone" },
    ],
    modelOptions: [{ id: "grok-voice-latest", label: "Grok Voice" }],
    onRefresh: vi.fn(),
    onChange: vi.fn(),
    onSave: vi.fn(),
    onTest: vi.fn(),
    onProvision: vi.fn(),
    onDisablePhone: vi.fn(),
    onOpenThread: vi.fn(),
    ...overrides,
  };
  const result = render(
    <>
      <div id="voice-agent-test-controls" data-testid="voice-agent-controls" />
      <DevelopVoiceAgentsOverviewPage {...props} />
    </>,
  );
  return { ...result, props };
}

describe("DevelopVoiceAgentsOverviewPage", () => {
  it("opens voice agents in the shared detail shell and preserves configuration actions", async () => {
    const user = userEvent.setup();
    const { container, props } = renderPage();

    expect(screen.getByRole("table", { name: "Voice agents" })).not.toBeNull();
    expect(screen.queryByRole("combobox", { name: "Voice mode for Voice Concierge" })).toBeNull();

    await user.click(screen.getByText("Voice Concierge"));

    expect(container.querySelector(".playground-server-detail-page.is-voice-agent-detail")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Voice Concierge", level: 1 })).not.toBeNull();
    expect(screen.getByRole("region", { name: "Voice Agent details for Voice Concierge" })).not.toBeNull();
    expect(screen.getByText("Voice Agent Activity")).not.toBeNull();
    expect(screen.getByText("Creator Person")).not.toBeNull();
    expect(screen.getByText("Owner Person")).not.toBeNull();
    const propertyRows = Array.from(
      container.querySelectorAll(".playground-voice-agent-detail-properties-card .playground-project-overview-sidebar-row"),
    );
    expect(propertyRows.at(-1)?.textContent).toContain("Owner");
    expect(propertyRows.at(-1)?.classList.contains("playground-server-detail-sidebar-owner-row")).toBe(true);
    expect(within(screen.getByTestId("voice-agent-controls")).getByRole("button", { name: /Save Changes/i })).not.toBeNull();

    await user.click(screen.getByRole("tab", { name: "Settings" }));
    expect(screen.getByRole("button", { name: "Voice mode for Voice Concierge" })).not.toBeNull();
    expect(screen.getByRole("textbox", { name: "Voice instructions for Voice Concierge" })).not.toBeNull();

    await user.click(within(screen.getByTestId("voice-agent-controls")).getByRole("button", { name: /Save Changes/i }));
    expect(props.onSave).toHaveBeenCalledWith(rows[0]);

    await user.click(screen.getByRole("button", { name: "All Voice Agents" }));
    expect(screen.getByRole("table", { name: "Voice agents" })).not.toBeNull();
  });

  it("uses centralized selectors for voice mode changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderPage({ onChange });

    await user.click(screen.getByText("Voice Concierge"));
    await user.click(screen.getByRole("tab", { name: "Settings" }));
    await user.click(screen.getByRole("button", { name: "Voice mode for Voice Concierge" }));
    await user.click(screen.getByRole("option", { name: "Web" }));

    expect(onChange).toHaveBeenCalledWith(rows[0], { mode: "web" });
  });
});
