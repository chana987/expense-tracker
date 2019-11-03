const express = require("express")
const router = express.Router()
const moment = require("moment")

const Expense = require("../models/Expense")

// const data = require('../models/expenses.json')

// data.forEach(e => new Expense({
//     name: e.item,
//     amount: e.amount,
//     date: e.date,
//     group: e.group
// }).save())

router.get("/expenses", function(req, res) {
	let group = req.query.group
	let d1 = req.query.d1 || 0
	let d2 = req.query.d2 || moment(new Date()).format("LLLL")
	let min = req.query.min || 0
	let max = req.query.max || Infinity

	if (group) {
		Expense.find({
			$and: [
				{ date: { $gte: d1, $lte: d2 } },
				{ amount: { $gte: min, $lte: max } },
				{ group: group }
			]
		}).exec((err, data) => res.send(data))
	} else {
		Expense.find({
			$and: [
				{ date: { $gte: d1, $lte: d2 } },
				{ amount: { $gte: min, $lte: max } }
			]
		}).exec((err, data) => res.send(data))
	}
})

router.get("/total", function(req, res) {
	let d1 = req.query.d1 || 0
	let d2 = req.query.d2 || moment(new Date()).format("LLLL")

	Expense.aggregate([
		{
			$match: { date: { $gte: new Date(d1), $lte: new Date(d2) } }
		},
		{
			$group: {
				_id: "$group",
				total: {
					$sum: "$amount"
				}
			}
		} 
	], (err, data) => res.send(data))
})

router.post("/new", function(req, res) {
	let expense = new Expense({
		name: req.body.name,
		amount: req.body.amount,
		date: req.body.date
			? moment(req.body.date).format("LLLL")
			: moment(new Date()).format("LLLL"),
		group: req.body.group
	})
	expense
		.save()
		.then((err, expense) =>
			res.send(`Spent ${expense.amount} on ${expense.name}`)
		)
})

router.put("/update/group", function(req, res) {
	Expense.findOneAndUpdate(
		{ name: req.body.name },
		{ $set: { group: req.body.group } },
		{ new: true }
	).exec((err, expense) =>
		res.send(`Changed group of ${expense.name} to ${expense.group}`)
	)
})

router.put("/update/amount", function(req, res) {
	Expense.findOneAndUpdate(
		{ name: req.body.name },
		{ $set: { amount: req.body.amount } },
		{ new: true }
	).exec((err, expense) =>
		res.send(`Changed amount of ${expense.name} to ${expense.amount}`)
	)
})

router.delete("/delete", function(req, res) {
	Expense.findOneAndDelete({ name: req.body.name }).exec((err, expense) =>
		res.send(`Removed ${expense.name} from expenses`)
	)
})

module.exports = router
