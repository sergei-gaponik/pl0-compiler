const fs = require("fs")
const path = require("path")
const Compiler = require("./src/classes/Compiler")

const main = async () => {

  try{
    const [ 
      inputPath = null, 
      outputPath = path.join(__dirname, "output.cl0") 
    ] = process.argv.slice(2)
  
    const inputString = await fs.promises.readFile(inputPath, "utf-8")
    const compiler = new Compiler(inputString)
  
    const byteCode = await compiler.compile()
    const outputData = new Uint8Array(Buffer.from(byteCode));
  
    await fs.promises.writeFile(outputPath, Buffer.from(outputData))

    console.log(`\nOutput Path: ${outputPath}\n${outputData.length} Bytes`)
  }
  catch(e){
    console.error(`\n${e.message}`)
  }
}

main()