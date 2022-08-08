const Lexer = require("./Lexer")
const Parser = require("./Parser")
const CodeGen = require("./CodeGen")
const fs = require("fs")
const path = require("path")

class Compiler {

  constructor(inputString) {
    this.inputString = inputString     
  }

  async compile() {

    const hexdump = bytes => {

      let hexdump = ""

      for(let i = 0; i < bytes.length; i++) {

        if(bytes[i] < 16)
          hexdump += "0"

        hexdump += bytes[i].toString(16)

        if((i + 1) % 2 == 0) hexdump += " "
        if((i + 1) % 16 == 0) hexdump += "\n"
      }

      console.log(hexdump)
    }

    const lexer = new Lexer(this.inputString)

    let morphemList = []

    while(true){
      try{
        const { 
          status,
          morphem = null, 
          error = null 
        } = lexer.getNextMorphem()

        if(status == Lexer.STATUS.EOF)
          break;

        if(status == Lexer.STATUS.OK)
          morphemList.push(morphem)
        else
          throw new Error(error)
      }
      catch(e){
        throw new Error(`Lexer: ${e}`)
      }
    }

    const grammarString = await fs.promises.readFile(path.join(__dirname, "..", "lang", "grammar"), "utf-8")
    const codeGen = new CodeGen()
    const parser = new Parser(codeGen)

    parser.initGrammar(grammarString)

    const response = parser.parse(morphemList)

    if(response.status == Parser.STATUS.OK){
      console.log("Parser: success")

      const byteCode = codeGen.getByteCode()

      hexdump(byteCode)

      return byteCode
    }
    else{
      const position = response.errorTraceBack[0]

      throw new Error(`Parser: error at line: ${position.line}, x: ${position.x}`)
    }

  }
}


module.exports = Compiler