import TopBar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect } from "react";

type InboxMessage = {
  id: number;
  sender: string;
  title: string;
  preview: string;
  time: string;
  date: string;
  body: JSX.Element | string;
};

function buildBody(
  sender: string,
  time: string,
  title: string,
  bodyText: string,
  avatarColor: string,
  avatarTextColor: string,
  avatarBg: string
) {
  return (
    <>
      <div className="font-semibold text-lg mb-2">{title}</div>
      <div className="flex items-center space-x-2 mb-6">
        <div className={`w-8 h-8 ${avatarBg} rounded-full flex items-center justify-center`}>
          <span className={`text-base font-bold ${avatarTextColor}`}>{sender[0].toUpperCase()}</span>
        </div>
        <div>
          <div className="font-medium">{sender}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
      </div>
      <div>{bodyText}</div>
    </>
  );
}

const initialInboxData: Omit<InboxMessage, "body">[] = [
  {
    id: 1,
    sender: "itachi-99",
    title: "Re: neo4j schema discussion",
    preview: "Hey, I've pushed the latest updates to the sch...",
    time: "10:15 AM",
    date: "Today",
  },
  {
    id: 2,
    sender: "joyboy-54",
    title: "API Rate Limiting",
    preview: "We need to discuss the rate limiting strategy f...",
    time: "9:45 AM",
    date: "Today",
  },
  {
    id: 3,
    sender: "Orbital Bot",
    title: "Deployment Successful: Staging",
    preview: "The latest build has been successfully deploy...",
    time: "Yesterday",
    date: "Yesterday",
  },
];

const avatarStyles = {
  "itachi-99": { avatarBg: "bg-red-200", avatarTextColor: "text-red-700" },
  "joyboy-54": { avatarBg: "bg-green-200", avatarTextColor: "text-green-700" },
  "Orbital Bot": { avatarBg: "bg-blue-100", avatarTextColor: "text-blue-700" },
};

const bodyTexts: Record<number, string> = {
  1: "Hey, I've pushed the latest updates to the schema. Let me know if you see any issues.",
  2: "We need to discuss the rate limiting strategy for our upcoming API endpoints.",
  3: `This is an automated notification.
The latest build (commit #a1b2c3d) has been successfully deployed to the staging environment.
You can view the deployment here.`,
};

const Inbox = () => {
  const [inboxData, setInboxData] = useState<InboxMessage[]>([]);
  const [selectedId, setSelectedId] = useState<number>(3);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const mapped = initialInboxData.map((msg) => {
      const style = avatarStyles[msg.sender] || { avatarBg: "bg-slate-200", avatarTextColor: "text-slate-700" };
      let bodyElem: JSX.Element;
      if (msg.id === 3) {
        bodyElem = (
          <>
            <div className="font-semibold text-lg mb-2">{msg.title}</div>
            <div className="flex items-center space-x-2 mb-6">
              <div className={`w-8 h-8 ${style.avatarBg} rounded-full flex items-center justify-center`}>
                <span className={`text-base font-bold ${style.avatarTextColor}`}>{msg.sender[0].toUpperCase()}</span>
              </div>
              <div>
                <div className="font-medium">{msg.sender}</div>
                <div className="text-xs text-gray-500">{msg.date}</div>
              </div>
            </div>
            <div className="mb-2">This is an automated notification.</div>
            <div className="mb-2">
              The latest build (commit <a href="#" className="text-blue-600 hover:underline">#a1b2c3d</a>) has been successfully deployed to the staging environment.
            </div>
            <div>
              You can view the deployment <a href="#" className="text-blue-600 hover:underline">here</a>.
            </div>
          </>
        );
      } else {
        bodyElem = buildBody(
          msg.sender,
          `${msg.date}, ${msg.time}`,
          msg.title,
          bodyTexts[msg.id],
          style.avatarTextColor,
          style.avatarTextColor,
          style.avatarBg
        );
      }
      return { ...msg, body: bodyElem };
    });
    setInboxData(mapped);
  }, []);

  const filtered = inboxData.filter(
    (msg) =>
      msg.title.toLowerCase().includes(search.toLowerCase()) ||
      msg.preview.toLowerCase().includes(search.toLowerCase())
  );

  const selected =
    filtered.find((x) => x.id === selectedId) || filtered[0] || null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <TopBar
          searchValue={search}
          setSearchValue={setSearch}
          placeholder="Search inbox..."
          showLogout={true}
          className=""
        />
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[340px] border-r bg-white flex flex-col">
            <div className="h-16 flex items-center px-6 font-semibold text-xl border-b">Inbox</div>
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="p-6 text-gray-400 text-center">No messages found.</div>
              )}
              <ul>
                {filtered.map((msg) => (
                  <li
                    key={msg.id}
                    onClick={() => setSelectedId(msg.id)}
                    className={`px-6 py-4 border-b cursor-pointer transition
                      ${
                        selectedId === msg.id
                          ? "bg-slate-50 border-l-4 border-slate-400"
                          : ""
                      }
                      hover:bg-gray-50`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-medium text-sm ${
                          selectedId === msg.id ? "text-slate-700" : "text-gray-900"
                        }`}
                      >
                        {msg.sender}
                      </span>
                      <span className="text-xs text-gray-400">{msg.time}</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-[15px] truncate">
                      {msg.title}
                    </div>
                    <div className="text-xs text-gray-500 truncate">{msg.preview}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex-1 bg-gray-50 p-12 min-h-full flex flex-col">
            {selected ? (
              <div>
                {selected.body}
              </div>
            ) : (
              <div className="text-gray-400">Select a message to read</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;