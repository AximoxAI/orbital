import React from "react"

export const MessageAvatar = ({ type }: { type: "ai" | "human" }) => {
  if (type === "human") {
    return (
      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src="https://randomuser.me/api/portraits/men/40.jpg"
          alt="User Avatar"
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 font-inter bg-gradient-to-br from-slate-600 to-slate-700 text-white font-semibold">
      🤖
    </div>
  )
}