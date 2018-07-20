const nodemailer = require('nodemailer');

module.exports = {
    sendMail : (user,admin,flag) => {

        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: "splendid.onlinelibrary@gmail.com",
                pass: "krishnaradha"
            }
        })

        let message
        console.log(user.email + "--------" + user.message)
        console.log(admin)

        if(flag == 'register'){
            message = {
                from: admin.email,
                to: user.email,
                subject: 'Welcome to '+ projectName +' | Activate your account.',
                html    : 'Dear ' + user.name + ', <br/><br/>' +
                'Welcome on board! Confirm your email id to activate your account.<br/><br/>' +
                'Verification Link: <a href="http://localhost:3000/email-verification?token='+user.token+'">Activate my account</a><br/><br/>' +
                'If you didn\'t create a '+ projectName +' account, just delete this email and everything will go back to the way it was.<br/><br/>' +
                'Regards, <br/>Team '+ projectName +' <br/><br/>' +
                '------------------------------------------------'
            }
        }else if(flag == 'contact'){
            message = {
                from: user.email,
                to: admin.email,
                subject: 'Query',
                html    : 'Dear '+ admin.name + ', <br/><br/>' + user.message + '<br>Recipient of msg is <a>' + user.email +'</a>'
                + '<br>Kindly reply to the same mail<br>' + 
                'Thankyou<br>------------------------------------------------'+
                '<br/> REGARDS:<br>' + user.name
            }
        }else if(flag == 'acknowledge'){
            message = {
                from: admin.email,
                to: user.email,
                subject: 'Acknowledgement',
                html    : 'Dear '+ user.name + ', <br/><br/>' +
                'We have received your query. This mail is to acknowledge you that we will contact' +
                'you within 24hours. Thankyou for contacting us.<br>' +
                'Thankyou<br>-------------------------------------------------'
                + '<br/> REGARDS:<br>' + admin.name
            }
        }else if(flag == 'verified'){
            message = {
                from: admin.email,
                to: user.email,
                subject: 'Verification',
                html    : 'Dear '+ user.name + ', <br/><br/>' +
                'You have successfully verified your email account. Enjoy the services.....<br>' +
                'Best wishes for your experience with The Splendid Online Library.<br>' +
                'Thankyou<br>-------------------------------------------------'
                + '<br/> REGARDS:<br>' + admin.name
            }
        }else if(flag == 'upgradeBook'){
            message = {
                from: admin.email,
                to: user.email,
                subject: 'New Book Added',
                html    : 'Dear '+ user.name + ', <br/><br/>' +
                'A new book is added to our collection. Please have a look.<br>' +
                'Best wishes for your experience with The Splendid Online Library.<br>' +
                'Thankyou<br>-------------------------------------------------'
                + '<br/> REGARDS:<br>' + admin.name
            }
        }else if(flag == 'password'){
            message = {
                from: admin.email,
                to: user.email,
                subject: 'Password Change',
                html    : 'Dear '+ user.name + ', <br/><br/>' +
                'You have successfully changed your password.<br>' +
                'Enjoy your experience.<br>' +
                'Thankyou<br>-------------------------------------------------'
                + '<br/> REGARDS:<br>' + admin.name
            }
        }
        // console.log(message)

        // let message = {
        //     from: admin,
        //     to: user.email,
        //     subject: 'Welcome to '+ projectName +' | Activate your account.',
        //     html    : 'Dear ' + user.name + ', <br/><br/>' +
        //     'Welcome on board! Confirm your email id to activate your account.<br/><br/>' +
        //     'Verification Link: <a href="http://localhost:3000/email-verification?token='+user.token+'">Activate my account</a><br/><br/>' +
        //     'If you didn\'t create a '+ projectName +' account, just delete this email and everything will go back to the way it was.<br/><br/>' +
        //     'Regards, <br/>Team '+ projectName +' <br/><br/>' +
        //     '------------------------------------------------------------------------------'
        // }

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }

            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        })

    }
}
