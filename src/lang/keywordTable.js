
const { KEYWORDS } = require("./const")

// KeywordTable wird einmalig prozedural generiert. Ich hielt das für eine elegantere Lösung
// als alles manuell aufzuschreiben, zumal sich Keywords ändern können.

const keywordList = Object.keys(KEYWORDS)

const alphabetArray = [...Array(26).keys()].map(i => String.fromCharCode(i + 65))

const maxKeywordLength = keywordList.reduce((acc, cur) => cur.length > acc ? cur.length : acc, 0)

const keywordTable = alphabetArray.map(letter => {

  // Liste aus allen Zahlen von 2 bis maxKeywordLength iterieren

  return [...Array(maxKeywordLength - 1).keys()].map(i => i + 2).map(index => {
    
    // Annahme, dass maximal ein Keyword die gleiche Länge und gleichen Anfangsbuchstaben hat!
    // Alternativ müsste jedes Feld ein Array sein, das würde die Komplexität erhöhen und die
    // Performance negativ beeinflussen

    for(keyword of keywordList){
      if(keyword[0] == letter && keyword.length == index){
        return keyword;
      }
    }

    return null;
  })
})

module.exports = keywordTable