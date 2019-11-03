const moment = require('moment')
const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost/expenseDB", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useFindAndModify: false
})

const Expense = require("../models/Expense")

Expense.aggregate(
	[
		{
			$match: { date: { $gte: new Date(2018, 01, 01)} }
		}
		// {
		//     $group: {
		//         _id: "$group",
		//         total: {
		//             $sum: "$amount"
		//         }
		//     }
		// }
	],
	(err, data) => console.log(data)
)
Expense.find({ date: "2018-05-05T11:06:00.000Z" }, (err, data) =>
	console.log(data)
)
