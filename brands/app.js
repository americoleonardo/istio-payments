var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const Joi = require("joi");

var app = express();
const moment = require("moment");

const { v4: uuidv4 } = require('uuid');


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(logger('common'));

const MASTERCARD_BRAND = 5255;

var requests = [];

app.get("/v1/brands/:cardNumber", (req, res) => {
  try {
    const schema = Joi.object().keys({
      cardNumber: Joi.number().integer().min(16),
    });

    const { error } = schema.validate(req.params);

    if (error != undefined) {
      return res.status(400).json({ data: error.details });
    }

    const { cardNumber } = req.params;

    if (cardNumber.substring(0, 4) != MASTERCARD_BRAND) {
      return res.status(401).json({ data: "Brand not authorized." });
    }

    const item = {
      id: uuidv4(),
      brandName: "Mastercard",
      authorizatedAt: moment().toISOString(),
      ...req.params
    };

    requests.push(item);

    return res.status(200).json(item);
  } catch (e) {
    return res.status(500).json({data: "Error to validate a card number"});
  }
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    microservice: "brands-ms",
    timestamp: moment().toISOString(),
    status: "UP",
    version: "0.0.1",
  });
})

app.use((req, res) => {
  return res.status(404).end();
})

module.exports = app;
