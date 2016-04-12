(function (requiredArguments) {
    
    const parsedArgs = require("minimist")(process.argv);
    const prompt = require("prompt");
    prompt.override = parsedArgs;
    
    requiredArguments.getParameter = function (parameterName, callback) {
    
        prompt.start();
        
        prompt.get({ name: parameterName, required: true }, function (err, result) {

            if (err) {
                callback(err);
            }
            else {
                callback(null, result[parameterName]);
            }            
        });        
            
    };

})(module.exports);