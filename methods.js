var attempts = 0;
var correctCodes = 0;

module.exports.getAttempts = () => {
	return attempts;
}

module.exports.updateAttempts = () => {
	attempts++;
}

module.exports.getCorrectCodes = () => {
	return correctCodes;
}

module.exports.updateCorrectCodes = () => {
	correctCodes++;
}
