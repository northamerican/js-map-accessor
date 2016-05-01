if(typeof document !== 'undefined') {
    var $codeInput = document.getElementById('code-input');
    var $codeOutput = document.getElementById('code-output');
    var $codeSubmit = document.getElementById('code-submit');
}

var convertMapOperator = code => {
    var mapOperator = /\[\]/g;
    // Not a perfect way to detect usage of [] operator but good enough for a demo
    var mapOperatorHook = /[^\s=:](\[\])+/g;

    code.replace(mapOperatorHook, function(match) {
        var replaceWith = match.replace(mapOperator, "[\'_mapOperator\']");

        code = code.replace(match, replaceWith)
    });

    return code;
}
var evaledCodeResult = () => {
	var evaled = window.eval(convertMapOperator($codeInput.value));

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
    module.exports = convertMapOperator;
}
