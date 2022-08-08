
const { CHAR_CATEGORIES } = require("./const")

// Zeichenklassenvektor wird einmalig prozedural generiert

const asciiArray = [...Array(128).keys()].map(i => String.fromCharCode(i))

const charCategoryTable = asciiArray.map((char, index) => {

  if(char == "\n") return CHAR_CATEGORIES.NLINE
  if(index <= 32) return CHAR_CATEGORIES.SPECIAL;
  if(char.match(/[a-zA-Z]/)) return CHAR_CATEGORIES.LETTER;
  if(char.match(/[0-9]/)) return CHAR_CATEGORIES.DIGIT;
  if(char == ":") return CHAR_CATEGORIES.COLON;
  if(char == "<") return CHAR_CATEGORIES.LT;
  if(char == ">") return CHAR_CATEGORIES.GT;
  if(char == "=") return CHAR_CATEGORIES.EQ;
  if(char == "(") return CHAR_CATEGORIES.OPEN_BRACKET
  if(char == "*") return CHAR_CATEGORIES.ASTERISK
  if(char == ")") return CHAR_CATEGORIES.CLOSED_BRACKET

  else return CHAR_CATEGORIES.MISC;
})

const getCharCategory = char => charCategoryTable[char.charCodeAt(0)]

module.exports = { 
  charCategoryTable, 
  getCharCategory 
}