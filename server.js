const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "public"), {
  extensions: ["html"],
  maxAge: "1h"
}));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", app: "FitDeck Pro" });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`FitDeck Pro running on port ${PORT}`);
});
