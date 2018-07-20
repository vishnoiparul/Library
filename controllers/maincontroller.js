const bodyParser = require('body-parser')
const random = require('randomstring')

//Requiring Db files
const BookModel = require('../db/models/BookModel.js')
const UserModel = require('../db/models/UserModel.js')
const LikeModel = require('../db/models/LikeModel.js')
const SubsModel = require('../db/models/SubsModel.js')
const FeedModel = require('../db/models/FeedModel.js')
const MailService = require('../services/MailService.js')
const BillService = require('../services/BillService.js')
const seeder = require('../seeders/seeder.js')

module.exports = {
	viewShop : (req,res) => {
		var bookInst = new BookModel()
		bookInst.findBook()
			.then((book) => {
				req.session.book = book
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
			})
	},
	addToCart : (req,res) => {
		console.log('Add to cart request')
		console.log(req.body.bookdetail)
		
		if(req.session.user){
			var userInst = new UserModel()
			var bid = req.body.bookdetail
			var user = req.session.user
			console.log(user.email+"----------"+bid)
			userInst.findByEmail(user.email)
				.then((user) => {
					if(user){
						var cart = user.cart
						var coll = user.myCollection
						console.log("fetched cart---------"+cart)
						if(cart == null){
							cart = [bid]
						}else{
							var z = true
							for(var f = 1;f<=cart.length;f++){
								if(bid == cart[f]){
									z = false
									return res.render('shop',{
										user : req.session.user,
										book : req.session.book,
										filter : 'null',
										mostViewed : req.session.mostViewed,
										message : 'Item already in users cart'
									})
								}
							}
							if(z) {
								cart.push(bid)
							}
							
						}
						var z = true
						if(coll != null){
							coll.forEach((item) => {
								if(item == bid){
									z = false
									console.log("Item already in cart-----------")
									return res.render('shop',{
										user : req.session.user,
										book : req.session.book,
										filter : 'null',
										mostViewed : req.session.mostViewed,
										message : 'Item already in users cart'
									})
								}
							})
						}
						if(z) {
						if(cart != null){
							console.log("Updated cart-------" +cart)
							userInst.updateUser({email : user.email},{cart : cart})
								.then(() => {
									var item = user.item
									item = item + 1
									userInst.updateUser({email : user.email},{item : item})
										.then(() => {
											user.cart = cart
											user.item = item
											req.session.user = user
											console.log("User revised\n" + user)
											console.log('No of item updated')
											return res.render('shop',{
												user : req.session.user,
												book : req.session.book,
												filter : 'null',
												mostViewed : req.session.mostViewed,
												message : 'Item added to cart'
											})
										})
								})
						}
					}
					}
				})
		}else{
			res.render('login',{
				user : null,
				message : 'Please login to add books in cart'
			})
		}
	},
	viewCart : (req,res) => {
		if(req.session.user){
			console.log("------------------------- view cart --------------------------")
			var bookObj = null
			var user = req.session.user
			console.log("-----------Actual Cart------"+user.cart)
			var cart = user.cart
			var item = user.item
			console.log(cart)
			console.log(item)
			var i = 0
			if(cart == null){
				return res.render('checkout',{
					user : req.session.user,
					mostViewed : req.session.mostViewed,
					cart : null,
					message : 'Cart is empty'
				})
			}else{
				amount = 0
				cart.forEach((cartItem) => {
					// console.log("Viewing cart item to be processed")
					// console.log(cartItem)
					var books = Promise.resolve(getBook(cartItem))
					// console.log("Book Object------" + bookObj)
					books.then((value) => {
						// console.log(value)
						// console.log("-------- price of item --------")
						// console.log(value.oprice)
						amount = amount + value.oprice
						if(bookObj == null){
							bookObj = [value]
							i++
						}else{
							bookObj.push(value)
							i++
						}
						// console.log(bookObj)
						if(i == item) {
							req.session.cartObj = bookObj
							console.log("Item counted------------")
							console.log("Generating bill noww------------")
							var billObj = BillService.generateTotal(amount)
							// console.log(billObj)
							req.session.total = billObj
							bookObj = null
							return res.render('checkout',{
								user : req.session.user,
								mostViewed : req.session.mostViewed,
								cart : req.session.cartObj,
								total : req.session.total,
								message : null
							})
						}
					})
				})
			}	
		}else{
			res.render('login',{
				user : null,
				message : 'Please Login First!'
			})
		}
	},
	viewProduct : (req,res) => {
		var bid = req.query.bid
		console.log(bid)
		var bookInst = new BookModel()
		bookInst.findById(bid)
			.then((book) => {
				console.log(book)
				var view = book.view
				view = view + 1
				bookInst.updateBook({bid : book.bid},{view : view})
				.then(() => {
					if(req.session.user){
					var user = req.session.user
					var coll = user.myCollection
					console.log("User collection items")
					console.log(coll)
					var no = coll.length
					var message = null
					var i = 0
					coll.forEach((item) => {
						i++
						console.log("Item already in collection---" + no)
						if(item == bid){
							message = 'Item in cart'
							console.log('Item matched')
						}
						if(no == i){
							generateLid(user.email,bid)
							.then((lid) => {
								var likeInst = new LikeModel()
								likeInst.findUser(lid)
								.then((like) => {
									if(like){
										console.log('Like found')
										if(like.flag == true){
											message = 'Item liked'
										}
										console.log(message)
										req.session.book = book
										return res.render('single_product',{
											user : req.session.user,
											mostViewed : req.session.mostViewed,
											book : req.session.book,
											message : message
										})
									}else{
										console.log('No like')
										req.session.book = book
										return res.render('single_product',{
											user : req.session.user,
											mostViewed : req.session.mostViewed,
											book : req.session.book,
											message : message
										})
									}
									
								})
								.catch((err) => console.log(err))
								// .catch(() => {
								
								// })
							})
							
							
						}
					})
				}
				else{
					return res.render('single_product',{
						user : null,
						mostViewed : req.session.mostViewed,
						book : book,
						message : null
					})	
				}
				})
			})
	},
	subsRequest : (req,res) => {
		console.log('Received subscription request....')
		var subEm = req.body.usermail
		console.log(subEm)
		var userInst = new UserModel()
		userInst.findByEmail(subEm)
			.then((user) => {
				var enroll = false
				if(user) {
					enroll = true
				}
				var subsObj = {
					email : subEm,
					enroll : enroll,
					flag : true
				}
				var subsInst = new SubsModel()
				subsInst.subsRequest(subsObj)
					.then(() => {
						if(req.session.user) {
							console.log('User registered, subscribe successfully')
							return res.render('index',{
								user : req.session.user,
								mostLiked : req.session.mostLiked,
								feeds : req.session.feeds,
								mostViewed : req.session.mostViewed,
								message : 'Successfully subscribed, We will keep you updated about our new collection.'
							})
						}else{
							console.log('Subscribe successfully')
							return res.render('index',{
								user : null,
								mostLiked : req.session.mostLiked,
								feeds : req.session.feeds,
								mostViewed : req.session.mostViewed,
								message : 'Successfully subscribed, We will keep you updated about our new collection.'
							})
						}
					})	
			})
			.catch((err) => {
				console.log(err)
			})
	},
	viewContact : (req,res) =>{
		if(req.session.user){
			return res.render('contact', {
				user : req.session.user,
				message : 'null'
			})
		}else{
			return res.render('contact', {
				user : 'null',
				message : 'No User'
			})
		}
	},
	contactForm : (req,res) => {
		var data = req.body
		// console.log(data)
		var userObj = {
			name : data.fname +" "+ data.lname,
			email : data.email,
			message : data.query
		}
		fetchAdminEmail(userObj)
		
		if(req.session.user){
			return res.render('contact', {
				user : req.session.user,
				message : 'Successfully contacted. We will reply you soon'
			})
		}else{
			return res.render('contact', {
				user : 'null',
				message : 'Successfully contacted. We will reply you soon'
			})
		}
	},
	saveFeedback : (req,res) => {
		console.log(req.body)
		var feedObj = {
			name : req.body.fname,
			title : req.body.title,
			feedback :req.body.content
		}
		var feedInst = new FeedModel()
		feedInst.addFeedback(feedObj)
			.then(() => {
				console.log('feedback added successfully')
				res.redirect('/')
			})
	},
	removeItem : (req,res) => {
		console.log(req.body)
		var book_id = req.body.book_id
		var user = req.session.user
		var cart = user.cart
		console.log(cart)
		var index = cart.indexOf(book_id);
		if (index > -1) {
			if(cart.length == 1){
				cart = null
			}else{
				cart.splice(index, 1);
			}
		}

		console.log(cart)
		var userInst = new UserModel()
		userInst.updateUser({email : user.email},{cart : cart})
			.then(() => {
				var item = user.item
				item = item - 1
				userInst.updateUser({email : user.email},{item : item})
					.then(() => {
						user.cart = cart
						user.item = item
						req.session.user = user
						// console.log(req.session.user)
						var cartObj = req.session.cartObj
						for(var f = 0;f < cartObj.length;f++) {
							if(cartObj[f].bid == book_id){
								if(cartObj.length == 0){
									cartObj = null
								}else{
									delete cartObj[f]
								}
								break
							}
						}
						console.log(cartObj)
						req.session.cartObj = cartObj
						return res.render('checkout',{
							user : req.session.user,
							mostViewed : req.session.mostViewed,
							cart : req.session.cartObj,
							total : req.session.total,
							message : null
						})
					})
			})
	}
}

async function getBook(item) {
	let book
	var bookInst = new BookModel()
	try{
		book = await bookInst.findById(item)
	}catch(err){
		console.log(err)
	}
	console.log("Book fetched-------------- with id " + item)
	console.log(book)
	return book
}

async function getAdmin() {
	var admin = await seeder.fetchAdminEmail()
	return admin
}

async function generateLid(email,id) {
	var i = email.indexOf('@')
	var str = email.substr(0,i)
	var lid = str + "_" + id
	console.log(lid)
	return lid
}

async function fetchAdminEmail(userObj){
	var userInst = new UserModel()
	await userInst.findByRole('admin')
		.then((admin) => {
			console.log(admin)
			MailService.sendMail(userObj,admin,'contact')
			MailService.sendMail(userObj,admin,'acknowledge')
		})
}