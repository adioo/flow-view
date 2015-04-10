function getWordsBetweenCurlies(str) {
    var results = [];
    var re = /{{([^}}]+)}}/g;
    var text;

    while (text = re.exec(str)) {
        results.push(text[1]);
    }

    return results;
}

module.exports = function (str, data, lang) {
    var fieldsToReplace = getWordsBetweenCurlies(str);
    var self = this;
    fieldsToReplace.forEach(function (cField) {
        var cField = fieldsToReplace[i];
        var value = engine.utils.path(cField, [data, self, window]);

        value = value[language] || value;
        str = str.replace(
            new RegExp("{{" + cField + "}}", "g"),
            value
        );
    });

    return str;
};
