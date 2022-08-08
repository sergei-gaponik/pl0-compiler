const NameList = require("./NameList")
const CommandList = require("./CommandList")
const ConstList = require("./ConstList")
const { MORPHEM_CODES, COMMANDS } = require("../lang/const")

class CodeGen {

  static STATUS = {
    OK: true,
    ERROR: false
  }

  constructor(){
    this.constList = new ConstList()
    this.nameList = new NameList()
    this.commandList = new CommandList()
    this.root = {
      nameList: this.nameList,
      commandList: this.commandList
    }
    this.identBuffer = null
  }

  // Block
  initConst(morphem){

    if(morphem.code != MORPHEM_CODES.IDENTIFIER)
      return CodeGen.STATUS.ERROR

    this.identBuffer = morphem.value

    return CodeGen.STATUS.OK
  }

  setConst(morphem){

    if(morphem.code != MORPHEM_CODES.NUMBER || isNaN(morphem.value))
      return CodeGen.STATUS.ERROR

    const response = this.constList.add(parseInt(morphem.value), this.identBuffer)
    this.identBuffer = null

    if(response == ConstList.STATUS.ERROR)
      return CodeGen.STATUS.ERROR

    return CodeGen.STATUS.OK
  }

  initVar(morphem){

    if(morphem.code != MORPHEM_CODES.IDENTIFIER)
      return CodeGen.STATUS.ERROR

    if(this.nameList.addVar(morphem.value) != NameList.STATUS.OK)
      return CodeGen.STATUS.ERROR

    return CodeGen.STATUS.OK
  }

  initProc(morphem){

    const name = morphem.value

    if(morphem.code != MORPHEM_CODES.IDENTIFIER)
      return CodeGen.STATUS.ERROR

    if(this.nameList.addProc(name) != NameList.STATUS.OK)
      return CodeGen.STATUS.ERROR

    this.nameList = this.nameList.find(name).value

    const _new = new CommandList({ pointer: this.commandList, name })

    this.commandList.children.push(_new)
    this.commandList = _new

    return CodeGen.STATUS.OK
  }

  endProc(){

    if(this.commandList.parent == null)
      return CodeGen.STATUS.ERROR

    this.commandList = this.commandList.parent
    this.nameList = this.nameList.parent

    return CodeGen.STATUS.OK
  }

  // Statement
  assignStart(morphem){

    const v = this.nameList.getVarInfo(morphem.value)

    if(!v) return CodeGen.STATUS.ERROR

    const address = v.index * NameList.VAR_LENGTH 

    if(v.scope == NameList.SCOPE.LOCAL)
      this.commandList.add(COMMANDS.PSH_ADR_VAR_LOCL, [ address ])
    else if(v.scope == NameList.SCOPE.MAIN)
      this.commandList.add(COMMANDS.PSH_ADR_VAR_MAIN, [ address ])
    else if(v.scope == NameList.SCOPE.GLOBAL)
      this.commandList.add(COMMANDS.PSH_ADR_VAR_GLOB, [ address, v.procIndex ])
    

    return CodeGen.STATUS.OK

  }

  assignEnd(){

    this.commandList.add(COMMANDS.STORE_VAL, [])

    return CodeGen.STATUS.OK
  }

  callProc(morphem){

    const nameList = this.nameList.parent || this.nameList
    const proc = nameList.findRec(morphem.value)

    if(!proc || proc.type != NameList.TYPE.PROC)
      return CodeGen.STATUS.ERROR

    this.commandList.add(COMMANDS.CALL, [ proc.index ])

    return CodeGen.STATUS.OK

  }

  input(morphem){

    const v = this.nameList.getVarInfo(morphem.value)

    if(!v) return CodeGen.STATUS.ERROR

    const address = v.index * NameList.VAR_LENGTH 

    if(v.scope == NameList.SCOPE.LOCAL)
      this.commandList.add(COMMANDS.PSH_ADR_VAR_LOCL, [ address ])
    else if(v.scope == NameList.SCOPE.MAIN)
      this.commandList.add(COMMANDS.PSH_ADR_VAR_MAIN, [ address ])
    else if(v.scope == NameList.SCOPE.GLOBAL)
      this.commandList.add(COMMANDS.PSH_ADR_VAR_GLOB, [ address, v.procIndex ])

    this.commandList.add(COMMANDS.GET_VAL, [])

    return CodeGen.STATUS.OK

  }

  output(){

    this.commandList.add(COMMANDS.PUT_VAL)

    return CodeGen.STATUS.OK
  }

  ifCond(){

    const _cl = this.commandList

    _cl.entries.push({
      command: COMMANDS.JNOT,
      args: [],
      label: _cl.label,
      address: _cl.getSize()
    })

    _cl.label++

    return CodeGen.STATUS.OK
  }

  ifStmt(){

    const _cl = this.commandList

    _cl.label--
  
    const entry = _cl.entries.find(e => e.label == _cl.label)

    if(!entry)
      return CodeGen.STATUS.ERROR

    entry.args.push(_cl.getSize() - entry.address - 1)

    return CodeGen.STATUS.OK
  }

  whileCond(){

    const _cl = this.commandList

    _cl.whileLabels.push(_cl.getSize())

    return CodeGen.STATUS.OK
  }

  whileStart(){
    
    const _cl = this.commandList
    const index = _cl.whileLabels.length - 1

    _cl.entries.push({
      command: COMMANDS.JNOT,
      args: [],
      whileLabel: index,
      address: _cl.getSize()
    })

    return CodeGen.STATUS.OK
  }

  whileEnd(){

    const _cl = this.commandList
    const index = _cl.whileLabels.length - 1
    const _whileStart = _cl.entries.find(e => e.whileLabel == index)

    if(!_whileStart)
      return CodeGen.STATUS.ERROR

    const condStart = _cl.whileLabels.pop()
    const stmtStart = _whileStart.address
    const stmtEnd = _cl.getSize() + 2

    _whileStart.args.push(stmtEnd - stmtStart)

    _cl.entries.push({
      command: COMMANDS.JMP,
      args: [ condStart - stmtEnd - 3 ],
      address: _cl.getSize()
    })

    return CodeGen.STATUS.OK
  }

  // Condition
  condOdd(){

    this.commandList.add(COMMANDS.ODD, [])

    return CodeGen.STATUS.OK
  }
  condEq(){

    this.commandList.add(COMMANDS.CMP_EQ, [])

    return CodeGen.STATUS.OK
  }
  condNe(){

    this.commandList.add(COMMANDS.CMP_NE, [])

    return CodeGen.STATUS.OK
  }
  condLt(){

    this.commandList.add(COMMANDS.CMP_LT, [])

    return CodeGen.STATUS.OK
  }
  condLe(){

    this.commandList.add(COMMANDS.CMP_LE, [])

    return CodeGen.STATUS.OK
  }
  condGt(){

    this.commandList.add(COMMANDS.CMP_GT, [])

    return CodeGen.STATUS.OK
  }
  condGe(){

    this.commandList.add(COMMANDS.CMP_GE, [])

    return CodeGen.STATUS.OK
  }

  // Expression
  exprNegate(){
    this.commandList.add(COMMANDS.OP_NEG, [])

    return CodeGen.STATUS.OK
  }

  exprAdd(){
    this.commandList.add(COMMANDS.OP_ADD, [])

    return CodeGen.STATUS.OK
  }

  exprSub(){
    this.commandList.add(COMMANDS.OP_SUB, [])

    return CodeGen.STATUS.OK
  }


  // Term
  termMul(){
    this.commandList.add(COMMANDS.OP_MUL, [])

    return CodeGen.STATUS.OK
  }

  termDiv(){
    this.commandList.add(COMMANDS.OP_DIV, [])

    return CodeGen.STATUS.OK
  }


  // Faktor
  factorNum(morphem){

    if(morphem.code != MORPHEM_CODES.NUMBER)
      return CodeGen.STATUS.ERROR

    const address = this.constList.add(parseInt(morphem.value))
    this.commandList.add(COMMANDS.PSH_CONST, [ address ])

    return CodeGen.STATUS.OK
  }

  factorIdent(morphem){

    const c = this.constList.find(morphem.value)

    if(c){
      this.commandList.add(COMMANDS.PSH_CONST, [ c.index ])

      return CodeGen.STATUS.OK
    }

    const v = this.nameList.getVarInfo(morphem.value)

    if(!v) return CodeGen.STATUS.ERROR

    const address = v.index * NameList.VAR_LENGTH 

    if(v.scope == NameList.SCOPE.LOCAL)
      this.commandList.add(COMMANDS.PSH_VAL_VAR_LOCL, [ address ])
    else if(v.scope == NameList.SCOPE.MAIN)
      this.commandList.add(COMMANDS.PSH_VAL_VAR_MAIN, [ address ])
    else if(v.scope == NameList.SCOPE.GLOBAL)
      this.commandList.add(COMMANDS.PSH_VAL_VAR_GLOB, [ address, v.procIndex ])

    return CodeGen.STATUS.OK
  } 


  action(functionName, parameter) {

    if(functionName){

      const action = this[functionName]

      if (typeof action == "function")
        if(action.length)
          return this[functionName](parameter) 
        else 
          return this[functionName]() 
      else 
        return CodeGen.STATUS.ERROR
    }
    
    return CodeGen.STATUS.OK
  }

  getByteCode() {

    const intToByteArray = (int, length) => {

      let _bytes = []

      for(let i = 0; i < length; i++){
        _bytes.push(int & 0xFF)
        int = int >> 8
      }

      return _bytes
    } 

    const commandToByteArray = (command, args) => {

      let _bytes = []

      _bytes.push(...intToByteArray(command, 1))

      for(const arg of args)
        _bytes.push(...intToByteArray(arg, 2))

      return _bytes
    } 

    const getByteCodeForProc = (nameList, commandList) => {

      let bytes = []
      let commandBytes = []

      const subProcs = nameList.entries
        ? nameList.entries.filter(a => a.type == NameList.TYPE.PROC)
        : []

      for(const subProc of subProcs)
        bytes.push(...getByteCodeForProc(subProc.value, commandList.getChild(subProc.name)))

      for(const { command, args } of commandList.entries)
        commandBytes.push(...commandToByteArray(command, args))

      commandBytes.push(...commandToByteArray(COMMANDS.RET, []))

      const procLength = commandBytes.length + 7
      const procIndex = nameList.index
      const varLength = nameList.varCounter * NameList.VAR_LENGTH

      bytes.push(...commandToByteArray(COMMANDS.ENTRY_PROC, [procLength, procIndex, varLength]))
      bytes.push(...commandBytes)

      return bytes
    }

    let bytes = intToByteArray(NameList.procCounter + 1, 4)

    bytes.push(...getByteCodeForProc(this.root.nameList, this.root.commandList))

    for(const entry of this.constList.entries)
        bytes.push(...intToByteArray(entry.value, 4))

    return bytes
  }

}

module.exports = CodeGen