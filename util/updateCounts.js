var attempts = 0;
var correctCodes = 0;

module.exports.getAttempts = function() {
	return attempts;
}

module.exports.updateAttempts = function() {
	attempts++;
}

module.exports.getCorrectCodes = function() {
	return correctCodes;
}

module.exports.updateCorrectCodes = function() {
	correctCodes++;
}