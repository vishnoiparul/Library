var fs = require('fs')
var models = {}

module.exports = {
	//Load all the models and their schemas
	loadModels : function(db) {
		console.log('check')
		var schemaFiles = fs.readdirSync(__dirname + '/schema');
		schemaFiles.forEach((file) => {
			if (['.', '..'].indexOf(file) === 0) {
				return;
			}
			var schemaModule = require('./schema/' + file)(db.Schema);
			models[schemaModule.name] = db.model(schemaModule.name, schemaModule.schema);
			console.log('loaded model:', schemaModule.name);
		})
		return Promise.resolve(1)
	},
	getModel : function(modelName) {
		if (!models[modelName]) {
			console.log(modelName)
			 //throw new Error('model not found with name:', modelName);
		}
		return models[modelName]
	}
};