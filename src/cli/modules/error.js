module.exports = (s) => {

    const colors = require('colors');
    const boxen = require('boxen');

	console.error(boxen(s, {padding: 1, margin: 1, borderStyle: 'double'}));
}
