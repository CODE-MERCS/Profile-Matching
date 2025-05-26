const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Melayani file statis dari folder public
app.use("/public", express.static(path.join(__dirname, "../public")));

module.exports = app;
