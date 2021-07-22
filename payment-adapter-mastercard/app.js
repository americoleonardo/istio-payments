var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Joi = require("joi");
const moment = require("moment");

var app = express();
const { v4: uuidv4 } = require('uuid');

app.use(logger('common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const axios = require("axios");

var requests = [];

const { URL_BRANDS } = process.env;

app.post("/v1/transactions", async (req, res) => {
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

    const { cardNumber } = req.body;
    const { data } = await axios.get(`${URL_BRANDS}/${cardNumber}`);

    const transaction = createRandomTransaction(req.body, data);

    requests.push(transaction);

    return res.status(transaction.status == "denied" ? 400 : 200).json(transaction);
  } catch (e) {
    let status = 500;

    let message = "Ups! It was impossible to make a transaction.";

    if (e.response != undefined && [400, 401, 404].includes(e.response.status)) {
      status = e.response.status;

      message = e.response.data.data;
    }


    return res.status(status).json({ data: message });
  }
});

const createRandomTransaction = (randomData, brandResponse) => {
  return {
    id: uuidv4(),
    user: randomData.user,
    brandName: brandResponse.brandName,
    cardNumber: brandResponse.cardNumber,
    brandRequestId: brandResponse.id,
    amount: randomData.amount,
    status: Math.floor(Math.random() * 10) % 2 == 0 ? "authorized" : "denied",
    timestamp: moment().toISOString(),
  };
}

app.use((req, res) => {
  return res.status(404).end();
})

module.exports = app;
