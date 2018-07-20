module.exports = {
	generateTotal : (amount) => {
		var service = 0
		if(amount >= 300) {
			service = amount*0.1
		}
		amount = amount + service
		bill = {
			amount : amount,
			service : service
		}
		return bill
	}
}