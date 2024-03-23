const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const ones = {
    0: '', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
    6: 'six', 7: 'seven', 8: 'eight', 9: 'nine'
};

const teens = {
    10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen',
    15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen'
};

const tens = {
    20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty',
    60: 'sixty', 70: 'seventy', 80: 'eighty', 90: 'ninety'
};

function convertNumberToWords(number) {
    if (number === 0) return 'zero';

    let words = '';

    if (number >= 1000000) {
        words += convertNumberToWords(Math.floor(number / 1000000)) + ' million ';
        number %= 1000000;
    }

    if (number >= 1000) {
        words += convertNumberToWords(Math.floor(number / 1000)) + ' thousand ';
        number %= 1000;
    }

    if (number >= 100) {
        words += convertNumberToWords(Math.floor(number / 100)) + ' hundred ';
        number %= 100;
    }

    if (number >= 20) {
        words += tens[Math.floor(number / 10) * 10] + ' ';
        number %= 10;
    } else if (number >= 10) {
        words += teens[number] + ' ';
        number = 0;
    }

    if (number > 0) {
        words += ones[number];
    }

    return words.trim();
}

function wordsToNumber(words) {
    const wordArray = words.toLowerCase().replace(' and', '').replace(/-/g, ' ').split(' ');
    const wordToNumber = {
        zero: 0, one: 1, two: 2, three: 3, four: 4,
        five: 5, six: 6, seven: 7, eight: 8, nine: 9,
        ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
        fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
        twenty: 20, thirty: 30, forty: 40, fifty: 50,
        sixty: 60, seventy: 70, eighty: 80, ninety: 90,
        hundred: 100, thousand: 1000, million: 1000000,
        point: '.'
    };

    let number = 0;
    let currentNumber = 0;
    let hasDecimal = false;
    let decimalPlace = 1;

    for (let i = 0; i < wordArray.length; i++) {
        const word = wordArray[i];
        if (word in wordToNumber) {
            if (word === 'hundred' || word === 'thousand' || word === 'million') {
                currentNumber *= wordToNumber[word];
                number += currentNumber;
                currentNumber = 0;
            } else if (word === 'point') {
                hasDecimal = true;
            } else {
                if (hasDecimal) {
                    if (word === 'and') continue;
                    currentNumber += wordToNumber[word];
                    decimalPlace *= 0.1;
                } else {
                    currentNumber += wordToNumber[word];
                }
            }
        } else {
            return { error: 'Invalid word: ' + word };
        }
    }

    number += currentNumber * decimalPlace;
    return { number: number };
}


app.post('/to/number', (req, res) => {
    const words = req.body.words;
    if (!words) {
        return res.status(422).json({ error: 'Missing parameter: words' });
    }

    const result = wordsToNumber(words);
    if (result.error) {
        return res.status(422).json({ error: result.error });
    }

    return res.json({ number: result.number });
});

app.post('/to/words', (req, res) => {
    const number = req.body.number;
    if (number === undefined) {
        return res.status(422).json({ error: 'Missing parameter: number' });
    }

    if (number < 0 || number > 9999999) {
        return res.status(422).json({ error: 'Number out of range (0-9999999)' });
    }

    const words = convertNumberToWords(number);
    return res.json({ words: words });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
