const langCode = {
    "Python": '0',
    "JavaScript": '4',
    "C": '7',
    "C++": '77',
    "Java": '8'
}
const codeTextElm = document.getElementById("textarea");
const compileBtn = document.getElementById("compile");


let selectLangId = document.getElementById("lang-id");
let codeId = selectLangId.value;

selectLangId.addEventListener("change", function(){
    codeId = selectLangId.value;
    console.log(codeId);
    getDefaultCode(codeId);
});


let sidebar = document.getElementById("sidebar");
sidebar.disabled = "true";

codeTextElm.addEventListener("scroll", function(){
    sidebar.scrollTop = codeTextElm.scrollTop;
    sidebar.scrollLeft = codeTextElm.scrollTop;
});

var lineCounter = 0;
function renderSidebar() {
	let lineCount = codeTextElm.value.split('\n').length;
	let outarr = new Array();
	if (lineCounter != lineCount) {
		for (let i = 0; i < lineCount; i++) {
			outarr[i] = i + 1;
		}
		sidebar.value = outarr.join('\n');
	}
	lineCounter = lineCount;
}
codeTextElm.addEventListener('input', function(){
	renderSidebar();
});

codeTextElm.addEventListener("keydown", function(event){
    if(event.key === "Tab"){
        event.preventDefault();
        var start = this.selectionStart;
        var end = this.selectionEnd;
        this.value = this.value.substring(0, start) + "    " + this.value.substring(end);
        this.selectionStart = this.selectionEnd = start + 4;
    }
    
})
compileBtn.addEventListener("click", function(event){
    clearCompilerConsole();
    const request = new XMLHttpRequest();
    request.open("POST", "https://codequotient.com/api/executeCode");
    request.setRequestHeader("Content-Type","application/json");

    var data = {
        "code": codeTextElm.value,
        "langId": langCode[codeId]
    }
    request.send(JSON.stringify(data));
    request.addEventListener("load", function(){
        getResult(JSON.parse(request.responseText));
    });
});

function getResult(output){
    let resRequest = new XMLHttpRequest();
    resRequest.open("GET", `https://codequotient.com/api/codeResult/${output.codeId}`);
    resRequest.setRequestHeader("Content-Type","application/json");
    const id = setTimeout(function(){
        resRequest.send();
    }, 4000);
    resRequest.addEventListener("load", function(){
        clearTimeout(id);
        let result = resRequest.responseText;
        showOutput(JSON.parse(result));
    });
}

function showOutput(result){
    let consoleElement = document.getElementById("console");
    let pElement = document.createElement("p");
    console.log("out == =", result);
    if(Object.keys(result.data).length === 0){
        pElement.innerText = "OUTPUT:\nError... no code provided.";
    }
    else{
        let data = JSON.parse(result.data);
        let output = data.output;
        let error = data.errors;
        
        // console.log("data = ", data);
        
        // console.log("output = ", output.slice(1));
        // console.log("error = ", error);

        if(output){
            pElement.innerText = output.slice(1);
        }
        else{
            pElement.innerText = error;
        }
    }
    consoleElement.appendChild(pElement);
}
function clearCompilerConsole(){
    let consoleElement = document.getElementById("console");
    consoleElement.innerText = "";
}
function getDefaultCode(index){
    let defaultCodes = {
        "Python": `print("Hello World")`,
        "JavaScript": `console.log("Hello World")`,
        "C": `#include<stdio.h>\n\nint main(){\n    printf("Hello World");\n\n    return 0;\n}`,
        "C++": `#include<iostream>\nusing namespace std;\n\nint main(){\n    cout<<"Hello World";\n\n    return 0;\n}`,
        "Java":`// Do not change the Main class\n\nclass Main{\n\n    public static void main(String args[]){\n\n        System.out.println("Hello, World");\n    }\n}` 
    }
    codeTextElm.value = defaultCodes[index];
    renderSidebar();
}