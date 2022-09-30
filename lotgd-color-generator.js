function colorize() {

    const textInput = $('#textInput').val();
    const steps = $('#colorSteps').val();
    const startColor = $('#startColor').val();
    const endColor = $('#endColor').val();


    if(textInput.length < parseInt(steps)) {
        setOutput('[You cannot have more steps than characters in your text. That would produce lots of superfluous color codes.]');
        return;
    }

    const colorRanges = getColorRange(startColor, endColor, steps);

    setOutput(formatText(colorRanges, textInput));

}

function setOutput(text) {
    const output = $('#textOutput');
    output.text(text);
}

function getColorRange(start, end, steps) {
    // get these simple ones out, no further calculation needed
    if(steps === 0) {
        return [start];
    } else if (steps === 1) {
        return [start, end];
    }

    // get arrays with 8-bit color values
    const startColorValues = splitColor(start);
    const endColorValues = splitColor(end);

    // get the differences between start and end color values
    let rDiff = Math.max(startColorValues[0], endColorValues[0]) - Math.min(startColorValues[0], endColorValues[0]);
    let gDiff = Math.max(startColorValues[1], endColorValues[1]) - Math.min(startColorValues[1], endColorValues[1]);
    let bDiff = Math.max(startColorValues[2], endColorValues[2]) - Math.min(startColorValues[2], endColorValues[2]);

    // by dividing by steps we know how much each value needs to change to get a smooth transition
    const rChange = rDiff / steps;
    const gChange = gDiff / steps;
    const bChange = bDiff / steps;

    // we need to know if we increase or decrease values
    let rPosStep = startColorValues[0] < endColorValues[0];
    let gPosStep = startColorValues[1] < endColorValues[1];
    let bPosStep = startColorValues[2] < endColorValues[2];

    // we add the start value because it will not be calculated
    let colorSteps = [startColorValues];

    // quick clamp function, limiting to 0 - 255
    const clamp = (num) => Math.min(Math.max(num, 0), 255);

    for(let i = 1;i <= steps; i++) {
        let newR = clamp(Math.round((rPosStep ? startColorValues[0]+(rChange*i) : startColorValues[0]-(rChange*i))));
        let newG = clamp(Math.round((gPosStep ? startColorValues[1]+(gChange*i) : startColorValues[1]-(gChange*i))));
        let newB = clamp(Math.round((bPosStep ? startColorValues[2]+(bChange*i) : startColorValues[2]-(bChange*i))));
        console.log(newR,newG,newB);
        colorSteps.push([newR, newG, newB]);
    }

    return colorSteps;
}

function splitColor(color) {
    let r = 0;
    let g = 0;
    let b = 0;

    if(color.length !== 7) {
        console.error('Color input has invalid length:',color.length);
        return [0,0,0];
    }

    if(color.substring(0,1) !== '#') {
        console.error('Color input has invalid format.');
        return [0,0,0];
    }

    r = parseInt(color.substring(1,3), 16);
    if(r < 0 || r > 255) {
        console.error('Red value is invalid');
        return [0,0,0];
    }

    g = parseInt(color.substring(3,5), 16);
    if(g < 0 || g > 255) {
        console.error('Green value is invalid');
        return [0,0,0];
    }

    b = parseInt(color.substring(5,7), 16);
    if(b < 0 || b > 255) {
        console.error('Blue value is invalid');
        return [0,0,0];
    }

    return [r,g,b];

}

function formatToHex(color) {
    let rString = '';
    let gString = '';
    let bString = '';

    if(color.length !== 3) {
        console.error('Color has invalid length:', color.length);
        return "#000000";
    }

    if(color[0] < 0 || color[0] > 255) {
        console.error('Red value is invalid');
        return "#000000";
    }

    if(color[1] < 0 || color[1] > 255) {
        console.error('Green value is invalid');
        return "#000000";
    }

    if(color[2] < 0 || color[2] > 255) {
        console.error('Blue value is invalid');
        return "#000000";
    }

    rString = color[0].toString(16);
    gString = color[1].toString(16);
    bString = color[2].toString(16);

    if(rString.length === 1) {
        rString = '0'+rString;
    }

    if(gString.length === 1) {
        gString = '0'+gString;
    }

    if(bString.length === 1) {
        bString = '0'+bString;
    }


    return '#['+rString+gString+bString+']';
}

function formatText(colorRanges, inputText) {
    let result = '';

    // this is our base value for how many characters to color each time
    const charactersPerColor = Math.floor(inputText.length / colorRanges.length);
    // this is the fraction of characters that might remain if the lengths are not evenly divisible
    const baseRemainder = (inputText.length / colorRanges.length) - charactersPerColor;
    // this is used to check if we need to add another character to the current color
    let dynamicRemainder = baseRemainder;

    let textPos = 0;

    for(let i = 0; i < colorRanges.length; i++) {

        let increment = false;
        // if the dynamic remainder is >=1, we want to color one more character
        if(dynamicRemainder >= 1) {
            increment = true;
            // set new remainder, which is whatever is left over after adding the remainder last time
            dynamicRemainder = dynamicRemainder - Math.floor(dynamicRemainder);
        }

        let endPos = textPos+charactersPerColor+(increment ? 1 : 0);
        result += formatToHex(colorRanges[i])+inputText.substring(textPos, endPos);
        textPos = endPos;

        dynamicRemainder += baseRemainder;

        if(i+1 === colorRanges.length && endPos < inputText.length) {
            // if we don't have enough color ranges for the characters, we probably are super close to another remainder increment
            result += inputText.substring(endPos, inputText.length);
        }
    }

    return result;
}