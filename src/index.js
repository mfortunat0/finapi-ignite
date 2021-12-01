const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");

app.use(express.json());
const customers = [];

app.post("/account", (request, response) => {
  const { cpf, name } = request.body;
  const customersAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customersAlreadyExists) {
    response.status(400).json({
      error: "Custumer already exists",
    });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4,
    statement: [],
  });

  return response.status(201).send();
});

app.listen(3333);
