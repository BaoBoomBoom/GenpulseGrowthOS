import { useState } from "react";
import type { AgentId } from "../types";
import { useStore } from "../store-context";

const LABELS: Record<AgentId, { title: string; role: string }> = {
  scientist: {
    title: "AI Scientist",
    role: "Truth & credibility gatekeeper",
  },
  creative: {
    title: "AI Creative Director",
    role: "Style & expression brain",
  },
  growth: {
    title: "AI Growth Manager",
    role: "Growth resource allocator",
  },
};

export function AgentChat({
  agent,
  placeholders,
}: {
  agent: AgentId;
  placeholders?: string[];
}) {
  const { agentMessages, sendAgentMessage } = useStore();
  const [text, setText] = useState("");
  const meta = LABELS[agent];
  const messages = agentMessages[agent];

  return (
    <div className="agent-chat panel">
      <div className="panel-head">
        <div>
          <h2>{meta.title}</h2>
          <div className="muted-sm">{meta.role}</div>
        </div>
      </div>
      <div className="panel-body agent-chat-body">
        <div className="chat-log">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`chat-bubble ${m.role === "user" ? "user" : "agent"}`}
            >
              <div className="chat-role">{m.role === "user" ? "You" : meta.title}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
        {placeholders?.length ? (
          <div className="chip-row">
            {placeholders.map((p) => (
              <button
                key={p}
                type="button"
                className="chip"
                onClick={() => sendAgentMessage(agent, p)}
              >
                {p}
              </button>
            ))}
          </div>
        ) : null}
        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            sendAgentMessage(agent, text.trim());
            setText("");
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Ask ${meta.title}…`}
          />
          <button type="submit" className="btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
