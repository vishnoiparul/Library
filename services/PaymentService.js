var payumoney = require('payumoney-node');
var random = require('randomstring')

module.exports = {
    makePayment : (paymentData) => {
        payumoney.setKeys('22f6YdYY', 'QqkKWrwP55', 'vmUva2SalhOSmVU2+kmOmOHBSKlIUNNUWq8qdB2E5Zc=');
        payumoney.isProdMode(true);

        console.log(paymentData)
        return new Promise((resolve,reject) => {
            payumoney.makePayment(paymentData,(err,response) => {
                if(err)
                    return reject(err)
                return resolve(response)
            })
        })
    },
    fetchDetails : (paymentData) => {

        payumoney.setKeys('22f6YdYY', 'QqkKWrwP55', 'vmUva2SalhOSmVU2+kmOmOHBSKlIUNNUWq8qdB2E5Zc=');
        payumoney.isProdMode(true);

        return new Promise((resolve,reject) => {
            payumoney.paymentResponse(paymentData.txnid,(err,response) => {
                if(err)
                    return reject(err)
                return resolve(response)
            })
        })
    }
}