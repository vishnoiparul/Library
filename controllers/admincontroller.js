const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')

//For Image
var Storage1 =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/images');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
})

var fupload = multer({
     storage: Storage1
 }).single('input-fa')

//For file
var Storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/pdf');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
})

var pupload = multer({
     storage: Storage
 }).single('pdf')


//Requiring Db files
const BookModel = require('../db/models/BookModel.js')

module.exports = {
	addbook	  : (req,res) => {
					console.log("Adding book request")
					var data = req.body
					var today = new Date()
					var day = today.getDate()
					var month = today.getMonth() + 1
					var year = today.getFullYear()
					today = {
						day : day,
						month : month,
						year : year
					}
					console.log(today)
					// Fetching Book Id
					var bookInst = new BookModel()
					bookInst.getId()
						.then((result) => {
							console.log('Id fetched...')
							console.log(result)
							result = result + 1
							var offer
							var actual
							var discount
							if(data.option == 'free'){
								offer = 0
								actual = 0
								discount = 0
							}else{
								discount = data.discount
								actual = data.aprice
								offer = actual - (actual*discount/100)
								
							}
							var bookObj = {
								bid : result,
								bname : data.bname,
								aname : data.aname,
								category : data.category,
								language : data.language,
								description : data.description,
								option : data.option,
								nationality : data.nationality,
								discount : discount,
								aprice : actual,
								oprice : offer,
								date : today
							}
							console.log(bookObj)
							bookInst.addBook(bookObj)
								.then((book) => {
									console.log('Book Added')
									console.log(bookObj)
									req.session.bid = bookObj.bid
									res.render('admin',{
										user : req.session.user,
										mostViewed : req.session.mostViewed,
										bid : req.session.bid,
										form : 2,
										message : null
									})
								})
								.catch((err) => {
									console.log('Request Failed')
								})
						})
						.catch((err) => console.log(err))
				},
	addimage  : (req,res) => {
					console.log('Request for adding Image')
					var id = req.session.bid
					console.log(req.session.bid)
					fupload(req,res,(err) => {
						if(err){
							console.log(err)
						}else{
							console.log('Uploaded Successfully')
							var bookInst = new BookModel()
							console.log('uploaded files---------')
							
							console.log(req.session.bid)
							bookInst.updateBook({bid : id},{image : req.file.filename})
								.then((book) => {
									console.log('Image Uploaded')
									res.render('admin',{
										user : req.session.user,
										mostViewed : req.session.mostViewed,
										bid : req.session.bid,
										form : 3,
										message : null
									})
								})
								.catch((err) => {
									console.log('Image not uploaded')
								})
						}
					})
				},
	addfile : (req,res) => {
					console.log('Request for adding PDF file')
					var id = req.session.bid
					console.log(id)
					pupload(req,res,(err) => {
						if(err){
							console.log(err)
						}else{
							console.log(req.file.filename)
							var bookInst = new BookModel()
							bookInst.updateBook({bid : id},{pdf : req.file.filename})
								.then(() => {
									console.log('File Uploaded')
									delete req.session.bid
									fetchAdminEmail()
									res.render('index',{
										user : req.session.user,
										feeds : req.session.feeds,
										mostLiked : req.session.mostLiked,
										mostViewed : req.session.mostViewed,
										message : 'Book Added Successfully'
									})
								})
								.catch((err) => {
									console.log('File not uploaded')
								})
						}
					})
				}
}

async function fetchAdminEmail(){
	var userInst = new UserModel()
	await userInst.findByRole('admin')
		.then((email) => {
			console.log(email)
			userInst.findByRole('user')
				.then((users) => {
					users.forEach((userObj) => {
						MailService.sendMail(userObj,email,'upgradebook')
					})
				})
		})
}


// #e85342   #f7c052