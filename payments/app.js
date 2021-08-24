var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Joi = require("joi");
const moment = require("moment");

var app = express();
const {v4: uuidv4} = require('uuid');

app.use(logger('common'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

const axios = require("axios");

var requests = [];

const { URL_ADAPTER_MASTERCARD } = process.env;

app.post("/v1/payments", async (req, res) => {
  try {
    const schema = Joi.object({
      cardNumber: Joi.number().integer().min(16),
      user: Joi.number().integer(),
      amount: Joi.number()
    });

    const { error } = schema.validate(req.body);

    if (error != undefined) {
      return res.status(400).json(error.details);
    }

    const {data} = await axios.post(`${URL_ADAPTER_MASTERCARD}`, req.body);

    const transaction = transformPaymentRequest(data);

    return res.status(transaction.status == "denied" ? 400 : 200).json(transaction);
  } catch (e) {
    let status = 500;

    let message = "Ups! It was impossible to make a transaction.";

    if (e.response != undefined && [401, 404].includes(e.response.status)) {
      message = {data: e.response.data.data};
    } else if (e.response != undefined && [400].includes(e.response.status)) {
      status = e.response.status;

      message = transformPaymentRequest(e.response.data || {});
    }

    return res.status(status).json(message);
  }
});

app.get("/v1/payments/:id", (req, res) => {
  const schema = Joi.object({
    id: Joi.string().guid()
  });

  const {error} = schema.validate(req.params);

  if (error != undefined) {
    return res.status(400).json(error.details);
  }

  if (!requests.length) {
    return res.status(404).json({ data: "Not found" });
  }

  const { id } = req.params;

  const payment = requests.filter(item => item.id == id);

  if (!payment.length) {
    return res.status(404).json({ data: "Not found" });
  }

  return res.status(200).json(payment);
})

const transformPaymentRequest = (data) => {
  const transaction = {
    id: uuidv4(),
    user: data.user,
    card: {
      brandRequestId: data.id,
      brand: data.brandName,
      number: data.cardNumber,
    },
    amount: data.amount,
    status: data.status,
    timestamp: moment().toISOString(),
  };

  requests.push(transaction);
  return transaction;
}

app.use((req, res) => {
  return res.status(404).end({ message: "Not found" });
})

module.exports = app;
