import { buildStagesForCurrent } from "../lib/pipeline";

function isoOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getDemoClients() {
  return [
    {
      id: 1,
      first: "John",
      last: "Smith",
      phone: "(555) 214-7788",
      email: "john.smith@email.com",
      priority: "High",
      color: "av-blue",
      joined: isoOffset(-42),
      followUpDate: isoOffset(0),
      nextFollowUp: "Today",
      lastContact: "Phone call, 2 days ago",
      interests: ["Retirement planning", "Life insurance"],
      currentStage: "fc2",
      stages: buildStagesForCurrent("fc2"),
      notes: [
        {
          text: "Interested in bundling life insurance with retirement plan. Wants to review options for spouse too.",
          date: isoOffset(-3),
        },
      ],
    },
    {
      id: 2,
      first: "Sarah",
      last: "Chen",
      phone: "(555) 903-4471",
      email: "sarah.chen@email.com",
      priority: "High",
      color: "av-purple",
      joined: isoOffset(-70),
      followUpDate: isoOffset(0),
      nextFollowUp: "Today",
      lastContact: "Email, yesterday",
      interests: ["Investment strategy", "Estate planning"],
      currentStage: "strategy",
      stages: buildStagesForCurrent("strategy"),
      notes: [
        {
          text: "Ready to move forward with proposed portfolio allocation. Needs final sign-off meeting scheduled.",
          date: isoOffset(-1),
        },
      ],
    },
    {
      id: 3,
      first: "Robert",
      last: "Kim",
      phone: "(555) 662-1029",
      email: "robert.kim@email.com",
      priority: "High",
      color: "av-red",
      joined: isoOffset(-21),
      followUpDate: isoOffset(-4),
      nextFollowUp: "Overdue",
      lastContact: "Voicemail left, 6 days ago",
      interests: ["Business succession"],
      currentStage: "setmeet",
      stages: buildStagesForCurrent("setmeet"),
      notes: [
        {
          text: "Trying to lock down a meeting slot around his business travel schedule.",
          date: isoOffset(-6),
        },
      ],
    },
    {
      id: 4,
      first: "Maria",
      last: "Santos",
      phone: "(555) 348-9902",
      email: "maria.santos@email.com",
      priority: "Medium",
      color: "av-teal",
      joined: isoOffset(-10),
      followUpDate: isoOffset(4),
      nextFollowUp: "This week",
      lastContact: "In-person meeting, 4 days ago",
      interests: ["College savings plan"],
      currentStage: "setmeet",
      stages: buildStagesForCurrent("setmeet"),
      notes: [
        {
          text: "Wants to explore 529 plan options for two kids before the next meeting.",
          date: isoOffset(-4),
        },
      ],
    },
  ];
}
