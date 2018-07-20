var fs = require('fs')
// var PDFJS = require('pdfjs-dist-for-node')

const UserModel = require('../db/models/UserModel.js')
const BookModel = require('../db/models/BookModel.js')
const LikeModel = require('../db/models/LikeModel.js')
const TransModel = require('../db/models/TransModel.js')

module.exports = {
	viewCollection : (req,res) => {
		if(req.session.user) {
			var user = req.session.user
			var coll = user.myCollection
			if(coll == null){
				console.log("If Collection is empty")
				res.render('myBook',{
					user : req.session.user,
					message : 'Collection is empty'
				})
			}else {
				var no = coll.length
				console.log("Checking no of item...." + no )
				var bookObj = null
				var i = 0
				coll.forEach((id) => {
					console.log(id)
					var bookInst = new BookModel()
					bookInst.findById(id)
						.then((book) => {
							// console.log("Book Object---" + bookObj)
							if(bookObj == null) {
								bookObj = [book]
								i++
							}
							else{
								bookObj.push(book)
								i++
							}
							if(i == no){
								console.log("Required book object------")
								console.log(bookObj)
								collObj = bookObj
								res.render('myBook',{
									user : req.session.user,
									mostViewed : req.session.mostViewed,
									collection : collObj,
									message : null
								})
							}
						})
				})
			}
		}
	},
	previewBook : (req,res) => {
		if(req.session.user){
			var id = req.query.bid 
			console.log("Previewing Book")
			console.log(id)
			var bookInst = new BookModel()
			bookInst.findById(id)
				.then((book) => {
					console.log(book)
					// var pdffile = book.pdf
					// var filename = '/uploads/pdf/'+pdffile
					if(book.pdf != null){
						return res.render('preview',{
							user : req.session.user,
							mostViewed : req.session.mostViewed,
							book : book,
							message : null
						})
					}else{
						return res.render('preview',{
							user : req.session.user,
							mostViewed : req.session.mostViewed,
							book : null,
							message : 'No file fetched, go back and try again'
						})
					}
				})
		}
		else{
			return res.render('login',{
				user : null,
				message : null
			})
		}
	},
	likeBook : (req,res) => {
		if(req.session.user) {
			var id = req.query.bid
			console.log("Liking Book")
			console.log(id)
			var user = req.session.user
			var likeInst = new LikeModel()
			var lid = generateLid(user.email,id)
			var likeObj = {
				lid : lid,
				bid : id,
				userId : user.email,
				flag : true
			}
			// console.log(req.session.book)
			var bookInst = new BookModel()
			bookInst.findById(likeObj.bid)
				.then((book) => {
					var count = book.like
					console.log("Like count ---- " +count)
					likeInst.findUser(lid)
						.then((like) => {
							if(like) {
								console.log('Like found')
			  					console.log(like)
								var f
								if(like.flag == false){
									console.log('Liking book')
									f = true
									count = count + 1
									message = 'Item liked'
								} else {
									console.log('User has already liked the item, Unliking it')
									f = false
									count = count - 1
									message = 'Item in cart'
								}
								var id = book.bid
								console.log(id +"----------------"+ count)
								likeInst.updateLike({lid : likeObj.lid},{flag : f})
									.then(() => {
										bookInst.updateBook({bid : book.bid},{like : count})
											.then(() => {
												return res.render('single_product',{
													user : req.session.user,
													mostViewed : req.session.mostViewed,
													book : req.session.book,
													message : message
												})
											})
										
									})
							} else {
								likeInst.addLike(likeObj)
									.then(() => {
										count++
										bookInst.updateBook({bid : likeObj.bid},{like : count})
											.then(() => {
												console.log('Liked book')
												message = 'Item liked'
												return res.render('single_product',{
													user : req.session.user,
													mostViewed : req.session.mostViewed,
													book : req.session.book,
													message : message
												})
											})
									})
							}
						})
				})
			
		}else{
			return res.render('login',{
				user : null,
				mostViewed : req.session.mostViewed,
				message : 'Please, login to like...'
			})
		}
	},
	viewAccount : (req,res) => {
		if(req.session.user){
			return res.render('account',{
				user : req.session.user,
				mostViewed : req.session.mostViewed,
				message : null
			})
		}else{
			return res.render('login',{
				user : null,
				mostViewed : req.session.mostViewed,
				message : null
			})
		}
	},
	viewHistory : (req,res) => {
		if(req.session.user){
			var transInst = new TransModel()
			transInst.findTrans(req.session.user.email)
				.then((trans) => {
					console.log(trans)
					return res.render('purchase_history',{
						user : req.session.user,
						transaction : trans,
						mostViewed : req.session.mostViewed,
						message : null
					})
				})
		}else{
			return res.render('login',{
				user : null,
				mostViewed : req.session.mostViewed,
				message : "You haven't made any transaction, buy something from our impressive collection"
			})
		}
	}
}

function generateLid(email,id) {
	var i = email.indexOf('@')
	var str = email.substr(0,i)
	var lid = str + "_" + id
	console.log(lid)
	return lid
}
