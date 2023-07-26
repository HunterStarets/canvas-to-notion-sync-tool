const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/data", (req, res) => {
  // Handle the POST request here
  // You can access the data sent in the request with req.body
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
