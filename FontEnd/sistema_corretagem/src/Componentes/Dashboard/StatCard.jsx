// src/componentes/Dashboard/StatCard.jsx
import React from "react";
import "./Dashboard.css"; // Pode usar o mesmo CSS

const StatCard = ({ title, value, type = "default" }) => (
  <div className={`card-item ${type}`}>
    <h3>{title}</h3>
    <p>{value}</p>
  </div>
);

export default StatCard;
