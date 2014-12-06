var mapping = {
    'host': 'localhost',
    'port': '27017',
    'dbName': 'recipe',
};

exports.get = function(string) {
    if (mapping[string])
	return (mapping[string]);
    else
	return ('');
}