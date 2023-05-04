const express = require("express");
var bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");

const app = express();

dotenv.config();

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer().array());

app.get("/", (_req, res) => {
  res.json({ message: "Role and Permission API" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

const roleRoute = require("./app/routes/v1/roleRoute");
const permissionRoute = require("./app/routes/v1/permissionRoute");
const adminRoute = require("./app/routes/v1/adminRoute");

app.use("/api/v1/roles", roleRoute);
app.use("/api/v1/permissions", permissionRoute);
app.use("/api/v1/admins/", adminRoute);
