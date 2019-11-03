const express = require('express')
const app = express()
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost/expenseDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const Expense = require("../server/models/Expense")
const data = require('./expenses.json')

data.forEach(e => new Expense({
    name: e.item,
    amount: e.amount,
    date: e.date,
    group: e.group
}).save())

const port = process.env.SERVER_PORT || 3000
app.listen(port, () => console.log(`Running server on port ${ port }`))