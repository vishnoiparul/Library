const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const randomstring = require('randomstring')

//Requiring Db files
const UserModel = require('../db/models/UserModel.js')
const MailService = require('../services/MailService.js')
const seeder = require('../seeders/seeder.js')

module.exports = {
	viewLogin : (req,res) => {
					if(req.session && req.session.user){
						console.log("Viewing user login page")
						res.render('index',{
							user : req.session.user,
							mostLiked : req.session.mostLiked,
							feeds : req.session.feeds,
							mostViewed : req.session.mostViewed,
							message : 'User already login'
						})
					}else{
						console.log("Viewing user login page")
						res.render('login',{
							user : null,
							mostViewed : req.session.mostViewed,
							message : null
						})
					}
				},

	register : (req,res) => {
					console.log("User Signup request registering....")
					var data = req.body
					console.log("user email : "+data.email)
					console.log("user email : "+data.password)
					var userInst = new UserModel()
					bcrypt.hash(data.password,10,function(err,hash){
						if(err)
							console.log(err)
						var userObj = {
							email : data.email,
							name : data.username,
							contact : data.contact,
							password : hash,
							token: randomstring.generate(),
							role : "user",
							item : 0,
							myCollection : null,
							profile : null
						}
						console.log(userObj)
						userInst.findByEmail(userObj.email)
							.then((user) => {
								if(user){
									console.log(user);
							        return res.json({
							          status : 'failure',
							          message : 'Email already exists, Please try with another email'
							        })
								}else{
									console.log("User not found, Registering User")
									userInst.createUser(userObj)
									.then(() => {
										console.log(userObj)
										console.log("Request for sending email")
										var verify = false
										fetchAdminEmail(userObj,verify)
										console.log('User registered successfully')
									})
									.catch((err) => console.log(err))
									// toastr.success('Registered successfully')
									res.redirect('/signup')
								}
							})
					})
				},
	loginRequest : (req,res) => {
					console.log("User login request registering....")
					var data = req.body
					var userInst = new UserModel()
					var userObj = {
						uname : data.username,
						pass : data.password
					}
					userInst.findByEmail(userObj.uname)
						.then((user) => {
							if(user.email == userObj.uname){
								console.log('User Found, Checking for password')
								bcrypt.compare(userObj.pass, user.password, function(err,result) {
									if(result){
										console.log('Password Match, Login user....')
										userObj = {
											email : user.email,
											name : user.name,
											contact : user.contact,
											verified : user.verified,
											token : user.token,
											role : user.role,
											cart : user.cart,
											item : user.item,
											myCollection : user.myCollection,
											profile : user.profile
										}
										console.log(userObj)
										req.session.user = userObj
										if(user.role == 'admin'){
											res.render('index',{
												user : req.session.user,
												feeds : req.session.feeds,
												mostLiked : req.session.mostLiked,
												mostViewed : req.session.mostViewed,
												message : 'Welcome Admin'
											})
										}else {

											if(user.verified == 0){
												res.render('index',{
														user : req.session.user,
														feeds : req.session.feeds,
														mostLiked : req.session.mostLiked,
														mostViewed : req.session.mostViewed,
														message : 'User not verified. Email has been sent to your registered email address.'
													})
												}else{
													res.render('index',{
														user : req.session.user,
														feeds : req.session.feeds,
														mostLiked : req.session.mostLiked,
														mostViewed : req.session.mostViewed,
														message : null
													})
												}
											}
										}else{
											console.log('Password not Match')
												res.render('login',{
													user : null,
													mostViewed : req.session.mostViewed,
													message : 'Password not Match'
												})
										}
								})
							}
						})
						.catch((err) => {
							console.log('User not Found')
							console.log(err)
							res.render('login',{
								user : null,
								mostViewed : req.session.mostViewed,
								message : 'User not Found'
							})
						})
				},
	verifyEmail	: (req,res) => {
					console.log('Request for Email Verification')
					var token = req.query.token
					console.log(token)
					var userInst = new UserModel()
					userInst.findByToken(token)
						.then((user) => {
							console.log('User found')
							userInst.updateUser({token : token},{verified : 1})
								.then(() => {
									console.log('User Verified Successfully')
									var verify = true
									fetchAdminEmail(user,verify)
									if(req.session.user){
										return res.render('index',{
											user : null,
											mostLiked : req.session.mostLiked,
											feeds : req.session.feeds,
											mostViewed : req.session.mostViewed,
											message : 'User Verified Successfully'
										})
									}else{
										res.render('login',{
											user : null,
											mostViewed : req.session.mostViewed,
											message : 'User Verified Successfully, Login to continue'
										})
									}
								})
						})

				},
	logoutRequest	: (req,res) => {
					console.log('Request for logout')
						if(req.session){
							delete req.session.user
							res.render('login',{
							user : null,
							mostViewed : req.session.mostViewed,
							message : 'Successfully Logout'
						})
					}
					
				}
}	

async function fetchAdminEmail(userObj,verify){
	var userInst = new UserModel()
	await userInst.findByRole('admin')
		.then((email) => {
			console.log(email)
			if(verify){
				MailService.sendMail(userObj,email,'verification')
			}else{
				MailService.sendMail(userObj,email,'register')
			}	
		})
}	