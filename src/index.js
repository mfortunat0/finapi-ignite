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
      error: "Customer already exists",
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

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;
  const statementOperation = {
    description,
    amount,
    createdAt: new Date(),
    type: "credit",
  };
  customer.statement.push(statementOperation);
  response.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;
  const balance = getBalance(customer.statement);
  if (balance < amount) {
    return response.status(400).json({
      error: "Insufficient funds",
    });
  }
  const statementOption = {
    amount,
    createdAt: new Date(),
    type: "debit",
  };

  customer.statement.push(statementOption);
  return response.status(201).send();
});

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === "credit") {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
  return balance;
}

app.listen(3333);
