export const availableBots = ["@goose", "@orbital_cli", "@gemini_cli", "@claude_code"]
export const availableUsers = ["@James Adams", "@Sam Acer", "@Erin Reyes", "@Holt Andrey"]

export const BOT_STYLES = {
  "@goose": {
    bgColor: "bg-gradient-to-r from-pink-50 to-rose-50",
    textColor: "text-pink-800",
    selectedBg: "bg-gradient-to-r from-pink-100 to-rose-100",
    selectedText: "text-pink-900",
    iconColor: "text-pink-600",
    borderColor: "border-pink-200",
  },
  "@orbital_cli": {
    bgColor: "bg-gradient-to-r from-purple-50 to-violet-50",
    textColor: "text-purple-800",
    selectedBg: "bg-gradient-to-r from-purple-100 to-violet-100",
    selectedText: "text-purple-900",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
  },
  "@gemini_cli": {
    bgColor: "bg-gradient-to-r from-blue-50 to-cyan-50",
    textColor: "text-blue-800",
    selectedBg: "bg-gradient-to-r from-blue-100 to-cyan-100",
    selectedText: "text-blue-900",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  "@claude_code": {
    bgColor: "bg-gradient-to-r from-green-50 to-emerald-50",
    textColor: "text-green-800",
    selectedBg: "bg-gradient-to-r from-green-100 to-emerald-100",
    selectedText: "text-green-900",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
} as const

export const DEFAULT_BOT_STYLE = {
  bgColor: "bg-gradient-to-r from-gray-50 to-slate-50",
  textColor: "text-gray-800",
  selectedBg: "bg-gradient-to-r from-gray-100 to-slate-100",
  selectedText: "text-gray-900",
  iconColor: "text-gray-600",
  borderColor: "border-gray-200",
}

// User mention styles
export const USER_MENTION_STYLE = {
  bgColor: "bg-gradient-to-r from-indigo-50 to-blue-50",
  textColor: "text-indigo-800",
  selectedBg: "bg-gradient-to-r from-indigo-100 to-blue-100",
  selectedText: "text-indigo-900",
  iconColor: "text-indigo-600",
  borderColor: "border-indigo-200",
}

export const getBotStyles = (bot: string) =>
  BOT_STYLES[bot as keyof typeof BOT_STYLES] || DEFAULT_BOT_STYLE

export const getUserMentionStyle = () => USER_MENTION_STYLE

// Helper function to check if a mention is a known user
export const isKnownUser = (mention: string) => availableUsers.includes(mention)