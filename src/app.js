const express = require("express");
const helmet = require("helmet");
const morgan = require("./middleware/global/morgan");
const rateLimit = require("./middleware/global/rateLimit");
const cors = require("cors");
const setUpSwagger = require("./utils/swagger/index");
const errorHandler = require("./middleware/error/error.middleware");
const v1Router = require("./routes");

const app = express();
app.set("trust proxy", 2);

app.use(helmet());
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use(rateLimit);
app.use(morgan);
app.use(cors());

app.use(express.json());
setUpSwagger(app);

app.use("/v1", v1Router);
app.use(errorHandler);

module.exports = app;
