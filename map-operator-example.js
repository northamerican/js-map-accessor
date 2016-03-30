var $codeInput = document.getElementById('code-input');
var $codeOutput = document.getElementById('code-output');
var $codeSubmit = document.getElementById('code-submit');
var mapOperatorHook = /([a-zA-Z_$][0-9a-zA-Z_$]*)(\[\])+/g;
var mapOperator = /\[\]/g;
var evaledCodeResult = () => {
	var codeToShimmedCode = () => {
		var code = $codeInput.value;

		code.replace(mapOperatorHook, function(match) {
		    var replaceWith = match.replace(mapOperator, "['']");

		    code = code.replace(match, replaceWith)
		});

		return code;
	}
	var evaled = window.eval(codeToShimmedCode());

	console.log(evaled);

	return evaled;
}
var applyCodeAndPrint = () => {
	$codeOutput.value = '> ' + evaledCodeResult() + '\n' + $codeOutput.value;
	$codeInput.select();
}

$codeSubmit.addEventListener('click', applyCodeAndPrint);
$codeInput.addEventListener('keyup', e => {
    if (e.keyCode == 13 && e.altKey) {
        applyCodeAndPrint();
        return false;
    }
});