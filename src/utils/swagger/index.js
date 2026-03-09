const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "CareerMate API",
      version: "1.0.0",
      description: "description",
    },
  },
  apis: ["./src/utils/swagger/swagger.yml"],
};

const setUpSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(options)));
};

module.exports = setUpSwagger;
