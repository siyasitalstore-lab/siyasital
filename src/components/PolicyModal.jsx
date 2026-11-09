import React from "react";
import { X } from "lucide-react";

export default function PolicyModal({ policy, onClose }) {
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", justifyContent: "flex-end" }} onClick={onClose}>
      <div style={{ background: "white", padding: 40, borderRadius: 16, maxWidth: 600, width: "90%", margin: "auto", position: "relative", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
        <button className="mm-iconbtn" style={{ position: "absolute", top: 20, right: 20, background: "#f0f0f0", borderRadius: "50%" }} onClick={onClose}><X size={20} /></button>
        <h2 style={{ marginTop: 0, fontSize: 24, marginBottom: 20 }}>{policy.title}</h2>
        <div style={{ lineHeight: 1.6, color: "#444", fontSize: 16, whiteSpace: "pre-wrap" }}>
          {policy.body}
        </div>
        <button className="mm-btn-primary" style={{ marginTop: 32, width: "100%" }} onClick={onClose}>Understood, Close</button>
      </div>
    </div>
  );
}
