var convict = require('convict')

// Define a schema
var config = convict({
  env: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV"
  },
  ip: {
    doc: "The IP address to bind.",
    format: "ipaddress",
    default: "127.0.0.1",
    env: "IP_ADDRESS",
  },
  port: {
    doc: "The port to bind.",
    format: "port",
    default: 3000,
    env: "PORT",
    arg : "port"
  },
  db: {
    host: {
      doc: "Database host name/IP",
      format: '*',
      default: 'mongodb://localhost/libraryDb'
    },
    name: {
      doc: "libraryDb",
      format: String,
      default: 'users'
    }
  }
})

// Perform validation
config.validate({allowed: 'strict'})

module.exports = config