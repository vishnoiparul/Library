const bodyParser = require('body-parser')
const random = require('randomstring')

const PayService = require('../services/PaymentService.js')

//Requiring Db files
const TransModel = require('../db/models/TransModel.js')
const UserModel = require('../db/models/UserModel.js')

module.exports = {
	openPayment : (req,res) => {
		if(req.session.user){
			var user = req.session.user
			var total = req.session.total
			var cart = req.body.cart_data
			req.session.cart = cart

			var name = user.name.split(' ')
			var paymentData = {
				productinfo: "Buying Book for "+cart,
	            txnid: random.generate(),
	            amount: 1,
	            email: user.email,
	            phone: user.contact,
	            lastname: name[name.length-1],
	            firstname: name[0],
	            surl: "http://localhost:3000/success",
	            furl: "http://localhost:3000/failure",
			}

			req.session.paymentData = paymentData
			console.log(req.session.paymentData)

			if(total.amount == 0){
				addToCollection(paymentData.email,cart)

				wait(10000).then(() => {
					var userInst = new UserModel()

					userInst.findByEmail(user.email)
						.then((user) => {
							console.log(user)
							req.session.user = user
							delete req.session.cart
							delete req.session.total
							console.log("Session updated")
							return res.render('index',{
								user : req.session.user,
								feeds : req.session.feeds,
								mostLiked : req.session.mostLiked,
								mostViewed : req.session.mostViewed,
								message : "Successfully Added to User's Collection"
							})
						})
				})
			}else{
				PayService.makePayment(paymentData)
					.then((value) => {
						console.log("I got it finally ------ " + value)
						res.redirect(value)
					})
					.catch((error) => console.log(error))
			}
			
		} else {
			res.render('login',{
				user : req.session.user,
				mostViewed : req.session.mostViewed,
				message : 'Please login to continue'
			})
		}
	},
	successPayment : (req,res) => {

		console.log(req.session.user)
		console.log(req.session.paymentData)

		if(req.session.paymentData){
			
			var paymentDataOrg = req.session.paymentData
		// 	delete req.session.paymentData
		// 	console.log(req.session.paymentData)

			var user = req.session.user
			var cart = req.session.cart

			// var cart = ['3','5']
			// var paymentData = {
			// 	txnid: 'RJPRyBhhJT2a19Np8ILeuVwJ4PH27xs1',
	  //           email: 'vishnoiparul.141995@gmail.com'
			// }

			var paymentData = {
				txnid : paymentDataOrg.txnid,
				email : user.email
			}
			
			saveTransaction(paymentData,cart)
			console.log("Adding to collection call")
			addToCollection(paymentData.email,cart)

			wait(10000).then(() => {
				var userInst = new UserModel()

				userInst.findByEmail(paymentData.email)
					.then((user) => {
						console.log(user)
						req.session.user = user
						delete req.session.cart
						delete req.session.total
						console.log("Session updated")
						return res.render('index',{
							user : req.session.user,
							feeds : req.session.feeds,
							mostLiked : req.session.mostLiked,
							mostViewed : req.session.mostViewed,
							message : "Successfully Added to User's Collection"
						})
					})
				})

		}else{
			console.log("Session Expired")
		}
	},
	failPayment : (req,res) => {
		if(req.session.paymentData){
			
			var paymentDataOrg = req.session.paymentData
			delete req.session.paymentData
			console.log(req.session.paymentData)

			var user = req.session.user

			var transObj = {}
            transObj.email = user.email
            transObj.txnid = paymentDataOrg.txnid
            transObj.paymentId = null
            transObj.amount = paymentDataOrg.amount
            transObj.mode = null 
            transObj.status = 'failure'
            transObj.item = user.cart

            var currentTime = new Date()
            var currentOffset = currentTime.getTimezoneOffset();
            var ISTOffset = 330;
            var ISTTime = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
            
            var day = ISTTime.getHours()
            var month = ISTTime.getHours()
            var year = ISTTime.getHours()
            transObj.date = ISTTime.getDate()+"-"+ISTTime.getMonth()+"-"+ISTTime.getFullYear()

            var hoursIST = ISTTime.getHours()
			var minutesIST = ISTTime.getMinutes()
            transObj.time = hoursIST + ":" + minutesIST
            // console.log(dateArr)


            transObj.error = 'No Error'
            console.log(transObj)
            var transInst = new TransModel()

			transInst.addTransaction(transObj)
	        	.then(() => {
	        		console.log('Transaction added Successfully')
	        		res.render('index',{
	        			user : req.session.user,
	        			feeds : req.session.feeds,
	        			mostLiked : req.session.mostLiked,
	        			mostViewed : req.session.mostViewed,
	        			message : "Payment Failed"
	        		})
	        	})
	        	.catch((error) => console.log(error))

		}else{
			console.log("Session Expired")
		}
	}
}

async function saveTransaction(paymentData,cart){

	await PayService.fetchDetails(paymentData)
		.then((response) => {
			response.forEach((obj) => {
				// console.log(obj)
                var transObj = {}
                transObj.email = paymentData.email
                transObj.txnid = obj.postBackParam.txnid
                transObj.paymentId = obj.postBackParam.paymentId
                transObj.amount = obj.postBackParam.amount
                transObj.mode = obj.postBackParam.mode 
                transObj.status = obj.postBackParam.status
                transObj.item = cart
                var date = obj.postBackParam.addedon
                var dateArr = date.split(' ')
                transObj.date = date
                transObj.time = dateArr[1]
                // console.log(dateArr)
                transObj.error = obj.postBackParam.error_Message
                console.log(transObj)
                var transInst = new TransModel()
                transInst.addTransaction(transObj)
                	.then(() => {
                		console.log('Transaction added Successfully')
                	})
                	.catch((error) => console.log(error))

            })
		})
		.catch((error) => console.log(error))

}

async function addToCollection (user,cart) {

	console.log('This is checking for addToCollection')
	console.log(user)
	console.log(cart)

	var userInst = new UserModel()

	await userInst.findByEmail(user)
		.then((userObj) => {
			console.log("User Fetched------------------")
			console.log(userObj)
			var coll = userObj.myCollection
			if(userObj.item == 1){
				if(coll == null){
					coll = [cart]
				}else{
					coll.push(cart)
				}
			}else{
				cart.forEach((item) => {
					if(coll == null){
						coll = [item]
					}else{
						coll.push(item)
					}
				})
			}
			console.log("Fetched Collection------------------")
			console.log(coll)
			userInst.updateUser({email : userObj.email},{myCollection : coll})
				.then(() => {
					userInst.updateUser({email : userObj.email},{cart : null})
						.then(() => {
							userInst.updateUser({email : userObj.email},{item : 0})
								.then(() => {
									
								})
						})
				})
		})
		.catch((err) => console.log(err))
}


async function savetansactionDetails (email,txnid,cart,amount) {
	var transObj = {}
	transObj.email = email
	transObj.txnid = txnid
	transObj.item = cart
	transObj.amount = amount
	transInst.addTransaction(transObj)
    	.then(() => {
    		console.log('Transaction details added Successfully')
    	})
	    .catch((error) => console.log(error))
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}