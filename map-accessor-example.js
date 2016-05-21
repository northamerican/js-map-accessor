if(typeof document !== 'undefined') {
    var $codeInput = document.getElementById('code-input');
    var $codeOutput = document.getElementById('code-output');
    var $codeSubmit = document.getElementById('code-submit');
}

var convertMapAccessor = code => {
    var mapAccessor = /\[\]/g;
    // Not a perfect way to detect usage of [] accessor but good enough for a demo
    var mapAccessorHook = /[^\s=:](\[\])+/g;

    code.replace(mapAccessorHook, function(match) {
        var replaceWith = match.replace(mapAccessor, "[\'_mapAccessor\']");

        code = code.replace(match, replaceWith)
    });

    return code;
}
var evaledCodeResult = () => {
	var evaled = window.eval(convertMapAccessor($codeInput.value));

	console.log(evaled);

	return evaled;
}
var applyCodeAndPrint = () => {
    evaledCodeResult()
	// $codeOutput.value = '> ' + evaledCodeResult() + '\n' + $codeOutput.value;
	// $codeInput.select();
}

if(typeof document !== 'undefined') {
    $codeSubmit.addEventListener('click', applyCodeAndPrint);
    $codeInput.addEventListener('keyup', e => {
        if (e.keyCode == 13 && e.altKey) {
            applyCodeAndPrint();
            return false;
        }
    });
}

if(typeof module !== 'undefined') {
    module.exports = convertMapAccessor;
}
