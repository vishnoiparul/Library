var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser')

var log_control = require('../controllers/logincontroller')
var adm_control = require('../controllers/admincontroller')
var main_control = require('../controllers/maincontroller')
var user_control = require('../controllers/usercontroller')
var filt_control = require('../controllers/filtercontroller')
var pay_control = require('../controllers/paycontroller')
var sett_control = require('../controllers/settingcontroller')

//Requiring Db files
const BookModel = require('../db/models/BookModel.js')
const FeedModel = require('../db/models/FeedModel.js')



//Index Page Request
router.route('/')
	.get((req, res) => {
		var bookInst = new BookModel()
		bookInst.mostLiked()
			.then((books) => {
				// console.log("Liked book")
				// console.log(books)
				req.session.mostLiked = books
				bookInst.mostViewed()
				.then((views) => {
					// console.log("Viewed book")
					// console.log(views)
					req.session.mostViewed = views
					var feedInst = new FeedModel()
					feedInst.getFeedback()
					.then((feeds) => {
						// console.log(feeds)
						req.session.feeds = feeds
						if(req.session.user){
							return res.render('index', {
								user : req.session.user,
								feeds : req.session.feeds,
								mostLiked : req.session.mostLiked,
								mostViewed : req.session.mostViewed,
								message : null
							})
						}else{
							return res.render('index', {
								user : null,
								mostLiked : req.session.mostLiked,
								feeds : req.session.feeds,
								mostViewed : req.session.mostViewed,
								item : 0,
								message : 'No User'
							})
						}
					})
					
				})
			})
	})

// ContactUs route
router.route('/contact')
	.get(main_control.viewContact)

//Contact form control
router.route('/contactform')
	.post(main_control.contactForm)

//----------------------------Shopping Controls
//Viewing Shop Route
router.route('/shop')
	.get(main_control.viewShop)

//View Cart Route
router.route('/viewCart')
	.get(main_control.viewCart)

//Add to Cart Route
router.route('/addCart')
	.post(main_control.addToCart)

//Remove Item route
router.route('/removeItem')
	.post(main_control.removeItem)

//Product detail log
router.route('/single_product')
	.get(main_control.viewProduct)

//Subscription Route
router.route('/subscribe')
	.post(main_control.subsRequest)

//Feedback Route
router.route('/Feedback')
	.post(main_control.saveFeedback)


//------------------------------Login Controls
//Get SignUp Page Request
router.route('/signup')
	.get(log_control.viewLogin)
	.post(log_control.register)


//Post Login Request
router.route('/login')
	.post(log_control.loginRequest)

//Email Verification request
router.route('/email-verification')
	.get(log_control.verifyEmail)

//Logout Request Route
router.route('/logout')
	.get(log_control.logoutRequest)

//-----------------------------Users Profile Controls

//my collection route
router.route('/myBook')
	.get(user_control.viewCollection)

//Book preview route
router.route('/preview')
	.get(user_control.previewBook)

//Like route
router.route('/like')
	.get(user_control.likeBook)

//User account details route
router.route('/account')
	.get(user_control.viewAccount)

//Purchase history route
router.route('/purchase_history')
	.get(user_control.viewHistory)

//-----------------------------Admin Controls

//Viewing Admin Controls
router.route('/admin')
	.get((req,res) => {
		if(req.session.user){
			return res.render('admin',{
				user : req.session.user,
				form : 1,
				message : null
			})
		}else{
			return res.render('login',{
				user : null,
				message : 'Please, login to continue'
			})
		}
	})

//Adding Book Route
router.route('/addbook')
	.post(adm_control.addbook)

//Adding Image Route
router.route('/addimage')
	.post(adm_control.addimage)

//Adding File Route
router.route('/addfile')
	.post(adm_control.addfile)

//Reply Query Controls
router.route('/reply_query')
	.get((req,res) => {
		if(req.session.user){
			return res.render('replyQuery',{
				user : req.session.user,
				message : null
			})
		}else{
			return res.render('replyQuery',{
				user : null,
				message : 'Please, login to continue'
			})
		}
	})

//--------------------------------Filter Controls

//Filtering route
router.route('/shop')
	.post(filt_control.applyFilter)

//International Material route
router.route('/international')
	.get(filt_control.getInternational)

//Indian Material route
router.route('/indian')
	.get(filt_control.getIndian)

//Search bar route
router.route('/search')
	.post(filt_control.searchReq)


//---------------------------------Payment Controls

//Payment Route
router.route('/payment')
	.post(pay_control.openPayment)

//Successful Payment Route
router.route('/success')
	.post(pay_control.successPayment)

//Fail Payment Route
router.route('/failure')
	.post(pay_control.failPayment)

//----------------------------------Setting Controls

//Edit Profile route
router.route('/edit_profile')
	.post(sett_control.editProfile)

//Edit Photo route
router.route('/edit_photo')
	.post(sett_control.editPhoto)

//Edit Account route
router.route('/edit_acc')
	.post(sett_control.editAccount)

//changePassword route
router.route('/changePass')
	.post(sett_control.changePassword)

//------------------------------------------------------------------SCRATCH CODE--------------------------------

module.exports = router;
