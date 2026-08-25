import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { HuddlePresentationFacilitatorGuide } from "../../types";
import { HuddleTalkTrackPanel } from "./HuddleTalkTrackPanel";

const completeGuide: HuddlePresentationFacilitatorGuide = {
  sessionIntroduction: "Guide introduction",
  keyTalkingPoints: ["Talking point one", "Talking point two"],
  discussionQuestions: ["Question one?", "Question two?"],
  suggestedTransitions: ["Transition one", "Transition two"],
  wrapUpGuidance: "Guide wrap-up",
  preparationChecklist: [],
  facilitatorQuestions: [],
  listenFor: [],
  fallbackGuidance: null,
  reflectPrompt: null,
  commitPrompt: null,
  bringBackEvidence: [],
};

function render(guide: HuddlePresentationFacilitatorGuide | null): string {
  return renderToStaticMarkup(<HuddleTalkTrackPanel guide={guide} onClose={() => undefined} />);
}

function findElements(node: ReactNode, predicate: (element: ReactElement<Record<string, unknown>>) => boolean): ReactElement<Record<string, unknown>>[] {
  if (!isValidElement<Record<string, unknown>>(node)) return [];
  const matches = predicate(node) ? [node] : [];
  const children = node.props.children;
  if (Array.isArray(children)) return [...matches, ...children.flatMap((child) => findElements(child, predicate))];
  return [...matches, ...findElements(children as ReactNode, predicate)];
}

describe("HuddleTalkTrackPanel", () => {
  it("renders the complete governed facilitator guide", () => {
    const markup = render(completeGuide);

    expect(markup).toContain("Guide introduction");
    expect(markup).toContain("Talking point one");
    expect(markup).toContain("Question one?");
    expect(markup).toContain("Transition one");
    expect(markup).toContain("Guide wrap-up");
  });

  it("shows a restrained unavailable state when the guide is missing", () => {
    const markup = render(null);

    expect(markup).toContain("Facilitator guidance");
    expect(markup).toContain("Content unavailable");
  });

  it("shows unavailable states for empty individual fields and collections", () => {
    const markup = render({
      sessionIntroduction: null,
      keyTalkingPoints: [],
      discussionQuestions: [],
      suggestedTransitions: [],
      wrapUpGuidance: null,
      preparationChecklist: [],
      facilitatorQuestions: [],
      listenFor: [],
      fallbackGuidance: null,
      reflectPrompt: null,
      commitPrompt: null,
      bringBackEvidence: [],
    });

    expect(markup.match(/Content unavailable/g)).toHaveLength(5);
  });

  it("preserves the API-provided ordering of every facilitator list", () => {
    const markup = render(completeGuide);

    expect(markup.indexOf("Talking point one")).toBeLessThan(markup.indexOf("Talking point two"));
    expect(markup.indexOf("Question one?")).toBeLessThan(markup.indexOf("Question two?"));
    expect(markup.indexOf("Transition one")).toBeLessThan(markup.indexOf("Transition two"));
  });

  it("wires both close and back controls to the supplied close callback", () => {
    const onClose = vi.fn();
    const panel = HuddleTalkTrackPanel({ guide: completeGuide, onClose });
    const closeControls = findElements(panel, (element) => element.props.onClick === onClose);

    expect(closeControls).toHaveLength(2);
    closeControls.forEach((control) => (control.props.onClick as () => void)());
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("does not substitute unrelated topic or activity content", () => {
    const markup = render(null);

    expect(markup).not.toContain("Topic description fallback");
    expect(markup).not.toContain("Activity expected output fallback");
    expect(markup).not.toContain("Key takeaway fallback");
  });

  it("does not render the AI assistance block", () => {
    const markup = render(completeGuide);

    // Removed on the manager's instruction: the four actions were permanently disabled placeholders
    // for a backend that is not configured, so the panel advertised a capability it did not have.
    ["Suggest an icebreaker", "Generate an alternate prompt", "Summarize the current phase", "Show common pitfalls"]
      .forEach((label) => expect(markup).not.toContain(label));
    expect(markup).not.toContain("AI assistance");
    expect(markup).not.toContain("no approved AI backend is configured");
    expect(markup).not.toContain('disabled=""');
  });
});
