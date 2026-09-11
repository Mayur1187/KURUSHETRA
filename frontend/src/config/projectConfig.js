/**
 * CENTRAL PROJECT CONFIGURATION
 *
 * This is the single place to change branding, copy, and enabled
 * features once the hackathon problem statement is known. Nothing
 * else in the core app should hardcode a project name, tagline, or
 * feature toggle - it should all read from here.
 */

export const projectConfig = {
  projectName: "AI Platform",
  shortName: "AIP",
  tagline: "A reusable AI-powered problem-solving platform",
  description:
    "Build once, adapt quickly. This platform provides a complete auth, " +
    "dashboard, project workspace, and AI processing workflow ready to be " +
    "pointed at any hackathon problem statement.",

  branding: {
    primaryColor: "#4F46E5",
    accentColor: "#22D3EE",
    logoText: "AI",
  },

  landing: {
    heroTitle: "Turn any problem statement into a working AI product",
    heroSubtitle:
      "A reusable core platform - auth, dashboard, project workspace, and " +
      "AI processing - so your team can spend the hackathon on the idea, not the plumbing.",
    features: [
      {
        title: "Modular by design",
        description: "Swap the domain module without touching the core platform.",
      },
      {
        title: "AI provider agnostic",
        description: "OpenAI-compatible, Gemini, Claude, HuggingFace, or a custom model.",
      },
      {
        title: "Demo-mode ready",
        description: "Works end-to-end with sample data even with no API keys yet.",
      },
    ],
    howItWorks: [
      "Create a project",
      "Provide your input",
      "Let the AI process it",
      "Review and save your result",
    ],
  },

  features: {
    textInput: true,
    fileUpload: true,
    imageUpload: false,
    history: true,
    export: false,
    admin: false,
    demoMode: true,
  },

  ai: {
    provider: "configurable", // mirrors backend AI_PROVIDER env var
    model: "configurable",
  },

  quickActions: [
    { id: "new-project", label: "New Project", path: "/workspace" },
    { id: "view-history", label: "View History", path: "/history" },
  ],
};

export default projectConfig;
