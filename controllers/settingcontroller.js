const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const multer = require('multer')
const path = require('path')

//Requiring Db files
const UserModel = require('../db/models/UserModel.js')
const MailService = require('../services/MailService.js')
const seeder = require('../seeders/seeder.js')

var Storage1 =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/uploads/profile');
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  }
})

var fupload = multer({
     storage: Storage1
 }).single('input-fa')


module.exports = {
	editProfile : (req,res) => {
		var uname = req.body.uname
		var contact = req.body.contact
		var email = req.body.email
		var user = req.session.user
		var userInst = new UserModel()
		userInst.updateUser({email : user.email},{contact : contact})
			.then(() => {
				userInst.findByEmail(user.email)
					.then((userObj) => {
						req.session.user = userObj
						return res.render('account',{
							user : req.session.user,
							mostViewed : req.session.mostViewed,
							message : null
						})
					})
				
			})
			.catch((error) => {
				console.log(error)
				return res.render('account',{
					user : req.session.user,
					mostViewed : req.session.mostViewed,
					message : 'Some Problem encountered, try again'
				})
			})
	},
	editPhoto : (req,res) => {
		fupload(req,res,(err) => {
			if(err){
				console.log(err)
			}else{
				console.log('Uploaded Successfully')
				var userInst = new UserModel()
				console.log('uploaded files---------')
				var user = req.session.user
				console.log(req.session.bid)
				userInst.updateUser({email : user.email},{profile : req.file.filename})
					.then(() => {
						userInst.findByEmail(user.email)
							.then((userObj) => {
								req.session.user = userObj
								return res.render('account',{
									user : req.session.user,
									mostViewed : req.session.mostViewed,
									message : null
								})
							})
						
					})
					.catch((err) => {
						console.log('Image not uploaded')
						return res.render('account',{
							user : req.session.user,
							mostViewed : req.session.mostViewed,
							message : 'Some Problem encountered, try again'
						})
					})
			}
		})
	},
	editAccount : (req,res) => {
		var cpass = req.body.cpassword
		var npass = req.body.npassword
		var rpass = req.body.rpassword
		var user = req.session.user
		var userInst = new UserModel()
		userInst.findByEmail(user.email)
			.then((userObj) => {
				bcrypt.compare(cpass, userObj.password, function(err,result) {
					if(result){
						if(npass == rpass){
							bcrypt.hash(npass,10,function(err,hash){
								if(err)
									console.log(err)
								userInst.updateUser({email : user.email},{password : hash})
									.then(() => {
										fetchAdminEmail(user)
										delete req.session.user
										res.render('login',{
											user : null,
											mostViewed : req.session.mostViewed,
											message : 'Please login to continue'
										})
									})
							})
						}else{
							return res.render('account',{
								user : req.session.user,
								mostViewed : req.session.mostViewed,
								message : "Password didn't match, Please retry"
							})
						}
					}else{
						return res.render('account',{
							user : req.session.user,
							mostViewed : req.session.mostViewed,
							message : "Wrong Password, Please retry"
						})
					}
				})
			})
			.catch((err) => {
				console.log('Problem occured')
				return res.render('account',{
					user : req.session.user,
					mostViewed : req.session.mostViewed,
					message : 'Some Problem encountered, try again'
				})
			})
	},
	changePassword : (req,res) => {
		var email = req.body.email
		var npass = req.body.password

		var userInst = new UserModel()
		userInst.findByEmail(email)
			.then((user) => {
				if(user){
					bcrypt.hash(npass,10,function(err,hash){
						if(err)
							console.log(err)
						userInst.updateUser({email : user.email},{password : hash})
							.then(() => {
								fetchAdminEmail(user)
								res.render('login',{
									user : null,
									mostViewed : req.session.mostViewed,
									message : 'Please login to continue'
								})
							})
					})
				}else{
					console.log('user not found')
					res.render('login',{
						user : null,
						mostViewed : req.session.mostViewed,
						message : 'Please login to continue'
					})
				}
			})
	}
}

async function fetchAdminEmail(userObj){
	var userInst = new UserModel()
	await userInst.findByRole('admin')
		.then((email) => {
			console.log(email)
				MailService.sendMail(userObj,email,'password')
		})
}