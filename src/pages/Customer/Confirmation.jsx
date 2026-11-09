import React from "react";
import { Check } from "lucide-react";

export default function Confirmation({ orderNum, fulfillment, payment, onHome }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", maxWidth: 500, margin: "0 auto" }}>
      <div style={{ width: 80, height: 80, background: "#E4F1E6", color: "#3C6E47", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
        <Check size={40} />
      </div>
      <h1 style={{ fontSize: 32, margin: "0 0 16px 0" }}>Order Placed!</h1>
      <p style={{ fontSize: 16, color: "#666", marginBottom: 32, lineHeight: 1.5 }}>
        Your order <strong>#{orderNum}</strong> has been received. 
        {fulfillment === "delivery" ? " We'll deliver it to you shortly." : " It will be ready for pickup soon."}
        <br/><br/>
        {payment === "cod" ? "Please keep cash ready." : "Payment received successfully."}
      </p>
      <button className="mm-btn-primary" style={{ margin: "0 auto" }} onClick={onHome}>Return to Home</button>
    </div>
  );
}
