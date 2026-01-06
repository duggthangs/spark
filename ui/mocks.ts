import type { Experience } from "../engine/schema";

export const MOCK_EXPERIENCE: Experience = {
  id: "demo-experience",
  title: "IAEE Prototype",
  description: "Production-ready integration test",
  sections: [
    { 
      id: "intro", 
      type: "info", 
      title: "Welcome", 
      content: "This is a centralized mock experience." 
    },
    {
      id: "theme-setup",
      type: "live-component",
      title: "Branding",
      defaultCode: "export default () => <div className='p-4 bg-blue-500 text-white rounded-xl shadow-lg'>Hello from IAEE</div>"
    },
    {
      id: "options",
      type: "choice",
      title: "Features",
      options: [
        { id: "auth", label: "Authentication" },
        { id: "db", label: "Database" },
        { id: "storage", label: "Storage" }
      ],
      multiSelect: true
    },
    {
        id: "priority",
        type: "rank",
        title: "Priority",
        items: [
            { id: "speed", label: "Speed" },
            { id: "security", label: "Security" },
            { id: "cost", label: "Cost" }
        ]
    },
    {
        id: "feedback",
        type: "text-review",
        title: "Feedback",
        content: "Please provide your feedback on the prototype."
    },
    {
        id: "workflow",
        type: "kanban",
        title: "Workflow",
        columns: [
            { id: "todo", label: "To Do" },
            { id: "doing", label: "Doing" },
            { id: "done", label: "Done" }
        ],
        items: [
            { id: "task1", label: "Design UI", columnId: "todo" },
            { id: "task2", label: "Implement Backend", columnId: "todo" }
        ]
    },
    {
        id: "gallery",
        type: "image-choice",
        title: "Select Theme",
        images: [
            { id: "light", src: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop", label: "Light" },
            { id: "dark", src: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&h=200&fit=crop", label: "Dark" }
        ]
    },
    {
        id: "api",
        type: "api-builder",
        title: "API Definition",
        basePath: "/v1",
        allowedMethods: ["GET", "POST", "PUT"]
    },
    {
        id: "mapping",
        type: "data-mapper",
        title: "Data Mapping",
        sources: [
            { id: "user_id", label: "User ID" },
            { id: "email", label: "Email" }
        ],
        targets: [
            { id: "external_id", label: "External ID" },
            { id: "contact", label: "Contact" }
        ]
    },
    {
        id: "budget",
        type: "numeric-inputs",
        title: "Budget Allocation",
        items: [
            { id: "infra", label: "Infrastructure", max: 1000 },
            { id: "marketing", label: "Marketing", max: 500 }
        ]
    },
    {
        id: "personas",
        type: "card-deck",
        title: "Personas",
        template: {
            name: "string",
            role: "string",
            bio: "string"
        },
        initialCards: [
            { name: "Alice", role: "Developer", bio: "Loves TypeScript" }
        ]
    },
    { 
      id: "conclusion", 
      type: "decision", 
      title: "Finalize", 
      message: "Ready to deploy the experience?" 
    }
  ]
};
