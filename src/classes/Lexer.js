const { getCharCategory } = require("../lang/charCategories")
const automatTable = require("../lang/automatTable")
const keywordTable = require("../lang/keywordTable")
const { KEYWORDS, MORPHEM_CODES } = require("../lang/const")

class Lexer {

  static STATUS = {
    EOF: 0,
    OK: 1,
    ERROR: 2
  }

  constructor(inputString) {

    this.inputString = inputString.trim()
    this.char = this.inputString.charAt(0)
    this.position = 0
    this.line = 1
    this.linePosX = 0

    this.reset()
  }

  automatActions = {

    "wrf": () => {
      this.write()
      this.read()
      this.finish()
    },
    "wr": () => {
      this.write()
      this.read()
    },
    "f": () => {
      this.finish()
    },
    "rf": () => {
      this.read()
      this.finish()
    },
    "r": () => {
      this.read()
    },
    "dr": () => {
      this.buffer = ""
      this.read()
    },
    "rn": () => {
      this.read()
      this.newLine()
    }
  }

  getNextMorphem() {

    try{

      if(this.inputString.length <= this.position) 
        return { 
          status: Lexer.STATUS.EOF
        }

      while(!this.finished){

        if(this.inputString.length <= this.position)
          throw new Error("Unexpected end of file")

        const charCategory = getCharCategory(this.char)

        const [ next, action ] = automatTable[this.state][charCategory]

        this.automatActions[action]()
          
        if(next !== null) this.state = next
      }

      this.reset() 

      return {
        status: Lexer.STATUS.OK,
        morphem: this.morphem
      }
    }
    catch(e){
      return {
        status: Lexer.STATUS.ERROR,
        error: {
          msg: e.message,
          position: this.getPosition()
        }
      }
    }
  }

  getPosition() {
    return {
      line: this.line,
      x: this.linePosX - this.buffer.length
    }
  }

  newLine() {
    this.line++
    this.linePosX = 0 // für Debugging
  }

  read() {
    this.position++
    this.linePosX++
    this.char = this.inputString.charAt(this.position)
  }

  write() {
    this.buffer += this.char
  }

  finish() {

    const isKeyword = str => {

      const cell = keywordTable[str.charCodeAt(0) - 65][str.length - 2]

      return !!cell && cell == str
    }

    let code = MORPHEM_CODES.NONE
    let value = this.buffer.trim().toUpperCase()

    if(this.state == 1){
      code = MORPHEM_CODES.NUMBER
      value = parseInt(value)
    }
    else if(this.state == 2){  
      code = isKeyword(value) ? MORPHEM_CODES.SYMBOl : MORPHEM_CODES.IDENTIFIER
    }
    else{
      code = MORPHEM_CODES.SYMBOl
    }

    if(code == MORPHEM_CODES.SYMBOl)
      value = value.length > 1 ? KEYWORDS[value] : value.charCodeAt(0)

    if(code == MORPHEM_CODES.NONE) 
      throw new Error("Unknown Morphem")

    this.morphem = { 
      code, 
      value,
      position: this.getPosition()
    }

    this.finished = true
  }

  reset() {
    this.buffer = ""
    this.char = this.inputString.charAt(this.position)
    this.state = 0
    this.finished = false
  }

}


module.exports = Lexer