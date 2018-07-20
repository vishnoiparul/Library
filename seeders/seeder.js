const UserModel = require('../db/models/UserModel')

module.exports = {
	fetchAdminEmail : () => {
		var userInst = new UserModel()
		userInst.findByRole('admin',function(err,user){
			if(err)
				return err
			console.log(user)
			return user
		})
	}
}