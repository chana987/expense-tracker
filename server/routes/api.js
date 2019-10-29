const express = require('express')
const router = express.Router()

const Person = require('../models/Expense')

router.get('/people', function (req, res) {
    Person.find({}, function (err, people) {
        res.send(people)
    })
})

module.exports = router
