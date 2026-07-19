import { getStage } from "./pipeline";
import { daysAgoLabel } from "./followUp";

export const MESSAGE_TONES = [
  { id: "friendly", label: "Friendly" },
  { id: "professional", label: "Professional" },
  { id: "reminder", label: "Reminder" },
];

/**
 * Purely templated (no external calls) so it can never surface investment,
 * insurance, or market content — only scheduling/communication language.
 */
export function generateFollowUpMessage(client, tone = "friendly") {
  const stage = getStage(client.currentStage);
  const stageLabel = stage?.label ?? "your current step";
  const contactGap = daysAgoLabel(client.lastContactDate);
  const name = client.first;

  if (tone === "professional") {
    return [
      `Hi ${name},`,
      ``,
      `I hope this message finds you well. I wanted to follow up regarding your progress at the "${stageLabel}" stage.`,
      `Our last contact was ${contactGap.toLowerCase()}, and I'd like to check in on your availability for a brief conversation to continue where we left off.`,
      `Please let me know a time that works for you this week.`,
      ``,
      `Best regards,`,
    ].join("\n");
  }

  if (tone === "reminder") {
    return [
      `Hi ${name},`,
      ``,
      `Just a friendly reminder that we're waiting to hear back from you regarding "${stageLabel}".`,
      `It's been ${contactGap.toLowerCase()} since we last connected — whenever you have a few minutes, I'd love to schedule our next conversation.`,
      `Looking forward to hearing from you soon.`,
      ``,
      `Thanks!`,
    ].join("\n");
  }

  // friendly (default)
  return [
    `Hi ${name},`,
    ``,
    `Hope you're doing well! Just wanted to check in and see if you had any questions regarding our previous discussion at the "${stageLabel}" stage.`,
    `It's been ${contactGap.toLowerCase()} since we last spoke — let me know if you'd like to schedule our next conversation.`,
    ``,
    `Best regards,`,
  ].join("\n");
}
