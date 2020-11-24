module.exports = yargs => {
	yargs = yargs
	.help()
	.alias("h", "help")

	return yargs;
}
