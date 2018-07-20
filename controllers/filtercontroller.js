const bodyParser = require('body-parser')

const BookModel = require('../db/models/BookModel.js')

module.exports = {
	applyFilter : (req,res) => {
		console.log('Filtering request')
		var Category = req.body.category
		var PriceRange = req.body.priceRange
		var Arrival = req.body.arrival
		var Language = req.body.language
		var Discount = req.body.discount
		var Filter = 'null'
		var filterObj = {}
		// console.log('arrival='+Arrival)

		// Category filter-----------------------------------------------
		if(Category != "null"){
			// console.log("category----"+Category)
			var cat = Category.split(',')
			var arr = []
			cat.forEach((item) => {
				if(Filter == 'null'){
					Filter = [item]
					// arr = item
					arr.push(item)
				}else{
					Filter.push(item)
					arr.push(item)
				}
			})
			filterObj["category"] = { $in: arr}
		}
		
		// Person.
		//   find({
		//     occupation: /host/,
		//     'name.last': 'Ghost',
		//     age: { $gt: 17, $lt: 66 },
		//     likes: { $in: ['vaporizing', 'talking'] }
		//   }).
		//   limit(10).
		//   sort({ occupation: -1 }).
		//   select({ name: 1, occupation: 1 }).
		//   exec(callback);

		// Price Range filter ----------------------------------------------------
		if(PriceRange != 'null'){
			// console.log("price----" + PriceRange)
			var pr = PriceRange.split(',')
			var l = pr.length
			console.log("Length-----" +l)
			var arr = []
			var cond
			pr.forEach((item) => {
				if(Filter == 'null'){
					Filter = [item]
				}else{
					Filter.push(item)
				}
				var range = item.split('-')
				console.log(range)
				var left = range[0]
				var right = range[range.length-1]
				console.log(left+"--------"+right)
				cond = { $gt : left, $lt : right}
				console.log(cond)
				arr.push(cond)
			})	
			console.log(arr)
			filterObj["oprice"] = cond
		}

		// Arrival  filter-----------------------------------------------------------
		if(Arrival != "null"){
			console.log(Arrival)
			var arr = []
			var cond
			var ar = Arrival.split(',')
			ar.forEach((item) => {
				if(Filter == "null"){
					Filter = [item]
					// arr.push(item)
				}else{
					Filter.push(item)
					// arr.push(item)
				}
				item = item.replace('less than ','')
				console.log('Trimmed value')
				console.log(item)
				var d = new Date()
				console.log('Current date')
				console.log(d)
				var day = d.getDate()
				var month = d.getMonth()
				var year = d.getYear()
				var new_d = new Date(year,month,day-item)
				console.log('Date before item days')
				var day = new_d.getDate()
				var month = new_d.getMonth()
				var year = new_d.getYear()
				console.log(day+"---"+month+"---"+year)
				cond = { $gt : month, $gt : day}
			})
		}

		// Language filter---------------------------------------------------------
		if(Language != "null"){
			console.log(Language)
			var arr = []
			var lag = Language.split(',')
			lag.forEach((item) => {
				if(Filter == "null"){
					Filter = [item]
					arr.push(item)
				}else{
					Filter.push(item)
					arr.push(item)
				}
			})
			filterObj["language"] = { $in: arr}
		}

		//Discount filter------------------------------------------------------------
		if(Discount != "null"){
			console.log(Discount)
			var dis = Discount.split(',')
			var arr = []
			dis.forEach((item) => {
				if(Filter == "null"){
					Filter = [item]
					arr.push(item)
				}else{
					Filter.push(item)
					arr.push(item)
				}
				if(item == 'free'){
					cond = 0
				}else if(item == '60% or more'){
					var left = item
					left = left.replace('% or more','')
					cond = { $gt : left}
				}else{
					var range = item.split('-')
					console.log(range)
					var left = range[0]
					left = left.replace('%','')
					var right = range[range.length-1]
					right = right.replace('%','')
					console.log(left+"--------"+right)
					cond = { $gt : left, $lt : right}
					console.log(cond)
				}
			})
			filterObj["discount"] = cond
		}
		console.log('Printing filter')
		console.log(Filter)
		console.log("searching object-----")
		console.log(filterObj)

		//Filtering book based on category------------------------------------------------------
		var bookInst = new BookModel()
		bookInst.findBook(filterObj)
			.then((books) => {
				// console.log(books)
				var message = 'null'

				if(!books){
					message = "Sorry Folks! No book in this collection"
				}else{
					req.session.book = books
				}
				if(req.session.user){
					return res.render('shop',{
						user : req.session.user,
						mostViewed : req.session.mostViewed,
						book : req.session.book,
						filter : Filter,
						message : message
					})
				}else{
					return res.render('shop',{
						user : 'null',
						book : req.session.book,
						mostViewed : req.session.mostViewed,
						filter : Filter,
						message : message
					})
				}
			})
	},
	getInternational : (req,res) => {
		console.log('Filter for international content')
		var bookInst = new BookModel()
		bookInst.findBook({nationality : 'International'})
			.then((books) => {
				var message = 'null'

				if(!books){
					message = "Sorry Folks! No book in this collection"
					req.session.book = null
				}else{
					req.session.book = books
				}
				if(req.session.user){
					return res.render('shop',{
						user : req.session.user,
						mostViewed : req.session.mostViewed,
						book : req.session.book,
						filter : 'null',
						message : message
					})
				}else{
					return res.render('shop',{
						user : 'null',
						mostViewed : req.session.mostViewed,
						book : req.session.book,
						filter : 'null',
						message : message
					})
				}
			})
	},
	getIndian : (req,res) => {
		console.log('Filter for indian content')
		var bookInst = new BookModel()
		bookInst.findBook({nationality : 'Indian'})
			.then((books) => {
				console.log("Indian books" + books)
				var message

				if(books){
					req.session.book = books
					message = 'null'
				}else{
					message = "Sorry Folks! No book in this collection"
					req.session.book = null
				}
				if(req.session.user){
					return res.render('shop',{
						user : req.session.user,
						mostViewed : req.session.mostViewed,
						book : req.session.book,
						filter : 'null',
						message : message
					})
				}else{
					return res.render('shop',{
						user : 'null',
						mostViewed : req.session.mostViewed,
						book : req.session.book,
						filter : 'null',
						message : message
					})
				}
			})
	},
	searchReq : (req,res) => {
		console.log(req.body)
		var search = req.body.Search.toUpperCase()
		var bookInst = new BookModel()
		var bookObj = []
		bookInst.findBook()
			.then((books) => {
				var l = books.length
				var i = 1
				books.forEach((book) => {
					var bstr = book.bname.toUpperCase()
					var astr = book.aname.toUpperCase()
					if((bstr.includes(search))||(astr).includes(search)) {
						// console.log("Book match")
						bookObj.push(book)
					}
					if(i == l){
						console.log(bookObj)
						req.session.book = bookObj
						if(req.session.user){
							return res.render('shop', {
								user : req.session.user,
								mostViewed : req.session.mostViewed,
								book : req.session.book,
								filter : 'null',
								message : 'null'
							})
						}else{
							return res.render('shop', {
								user : 'null',
								mostViewed : req.session.mostViewed,
								book : req.session.book,
								filter : 'null',
								message : 'No User'
							})
						}
					}
					i++
				})
			})
	}
}