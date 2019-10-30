const express = require('express')
const router = express.Router()
const moment = require('moment')

const Expense = require('../models/Expense')

// const data = require('../models/expenses.json')

// data.forEach(e => new Expense({
//     name: e.item,
//     amount: e.amount,
//     date: e.date,
//     group: e.group
// }).save())

router.get('/expenses', function (req, res) {
    let d1 = req.query.d1
    let d2 = req.query.d2 || new Date()
    if (d1) {
        Expense.find({
            $and: [
                {date: { $gte: d1}},
                {date: { $lte: d2}}
            ]          
        })
        .sort({ date: -1 })
        .exec(function (err, expense) {
            res.send(expense)
        })
    } else {
        Expense.find({})
        .sort({ date: -1 })
        .exec(function (err, expense) {
            res.send(expense)
        })
    }
})

router.post('/new', function(req, res) {
    let expense = new Expense({
        name: req.body.name,
        amount: req.body.amount,
        date: req.body.date ? moment(req.body.date).format('LLLL') : moment(new Date).format('LLLL'),
        group: req.body.group
    })
    expense.save().then((expense) => console.log(`Spent ${expense.amount} on ${expense.name}`))
    res.end()
})

router.put('/update', function(req, res) {
    Expense.findOneAndUpdate({ group: req.body.group1 }, { $set: { group: req.body.group2 } }, {new: true},
        function(err, expense) {
            res.send(`Changed ${expense.name} to ${expense.group}`)
        })
})

router.get('/expenses/:group', function(req, res) {
    if (!req.query.total) {
        Expense.find({ group: req.params.group },
            function(err, group) {
                res.send(group)
            })
    } else {
        Expense.aggregate([
            { $match: {
                group: req.params.group 
            }},
            { $group: {
                _id: `${req.params.group}`,
                total: {
                    $sum: "$amount"
                }
            }}
        ])
        .exec(function( err, total) {
            console.log(total)
            
            res.send(total)
        })
    }
})

module.exports = router
