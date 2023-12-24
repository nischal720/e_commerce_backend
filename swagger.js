const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
      description: "API documentation",
    },
    securityDefinitions: {
      Bearer: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
      },
    },
  },
  apis: ["./routes/*.js"], // Add the path to your route files
};

const specs = swaggerJsdoc(options);

module.exports = specs;
