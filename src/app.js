const express = require("express");
const helmet = require("helmet");
const morgan = require("./middleware/global/morgan");
const rateLimit = require("./middleware/global/rateLimit");
const cors = require("cors");
const setUpSwagger = require("./utils/swagger/index");

const app = express();
app.use(helmet());
app.use(rateLimit);

app.use(morgan);
app.use(cors());

app.use(express.json());
setUpSwagger(app);

module.exports = app;
