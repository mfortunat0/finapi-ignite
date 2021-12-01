const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");

app.use(express.json());
const customers = [];

function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find((customer) => customer.cpf === cpf);
  if (!customer) {
    response.status(400).json({
      error: "Customer not found",
    });
  }

  request.customer = customer;
  return next();
}

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

app.get("/statement/", verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.listen(3333);
