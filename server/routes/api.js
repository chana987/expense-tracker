const express = require("express")
const router = express.Router()
const moment = require("moment")
const Expense = require("../models/Expense")

router.get("/expenses", function(req, res) {
	let group = req.query.group
	let fromDate = req.query.d1 || 0
	let toDate = req.query.d2 || moment(new Date()).format("LLLL")
	let minAmount = req.query.min || 0
	let maxAmount = req.query.max || Infinity
	let queries = [
		{ date: { $gte: new Date(fromDate), $lte: new Date(toDate) } },
		{ amount: { $gte: minAmount, $lte: maxAmount } },
	]
	if (group) { 
		queries.push({ group: group })
	}
		
	Expense.find({
		$and: queries
	}).exec((err, data) => res.send(data))
})

router.get("/total", function(req, res) {
	let fromDate = req.query.d1 || 0
	let toDate = req.query.d2 || moment(new Date()).format("LLLL")

	Expense.aggregate([
		{
			$match: { date: { $gte: new Date(fromDate), $lte: new Date(toDate) } }
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
	).exec((err, expense) => {
		if (expense) {
			res.send(`Changed amount of ${expense.name} to ${expense.group}`)
		} else {
			res.send(`${req.body.name} does not exist in database`)
		}
	}
	)
})

router.put("/update/amount", function(req, res) {
	Expense.findOneAndUpdate(
		{ name: req.body.name },
		{ $set: { amount: req.body.amount } },
		{ new: true }
	).exec((err, expense) => {
		if (expense) {
			res.send(`Changed amount of ${expense.name} to ${expense.amount}`)
		} else {
			res.send(`${req.body.name} does not exist in database`)
		}
	}
	)
})

router.delete("/delete/:name", function(req, res) {
	Expense.findOneAndDelete({ name: req.params.name }).exec((err, expense) => {
		if (expense) {
			res.send(`Removed ${expense.name} from expenses`)
		} else {
			res.send(`${req.params.name} does not exist in database`)
		}
	})
})

module.exports = router
