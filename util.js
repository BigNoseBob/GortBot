// Oliver Rayner
// June 2022

// Miscelaneous tools and helpful functions

function decodeEntities(encodedString) {
    let translate_re = /&(nbsp|amp|quot|lt|gt);/g;
    let translate = {
        "nbsp":" ",
        "amp" : "&",
        "quot": "\"",
        "lt"  : "<",
        "gt"  : ">"
    };
    return encodedString.replace(translate_re, function(match, entity) {
        return translate[entity];
    }).replace(/&#(\d+);/gi, (match, numStr) => {
        var num = parseInt(numStr, 10);
        return String.fromCharCode(num);
    });
}

function *enumerate(array) {
    for (let i = 0; i < array.length; i++){
        yield [i, array[i]]
    }
}

module.exports = {

    decodeEntities,
    enumerate,
    
}