class NameList {

  static STATUS = {
    OK: true,
    ERROR: false
  }

  static TYPE = {
    VAR: 0,
    PROC: 1
  }

  static SCOPE = {
    GLOBAL: 0,
    MAIN: 1,
    LOCAL: 2
  }

  static VAR_LENGTH = 4
  static procCounter = 0

  constructor(parent = null) {
    this.entries = []
    this.parent = parent ? parent.pointer : null
    this.name = parent ? parent.name : null
    this.index = parent ? parent.index : null
    this.varCounter = 0
  }

  addVar(name) {

    if(this.entries.find(e => e.name == name))
      return NameList.STATUS.ERROR

    this.entries.push({
      name,
      type: NameList.TYPE.VAR,
      index: this.varCounter,
      procIndex: this.index
    })

    this.varCounter++

    return NameList.STATUS.OK
  }

  addProc(name) {

    if(this.entries.find(e => e.name == name))
      return NameList.STATUS.ERROR

    NameList.procCounter++

    const nameList = new NameList({ 
      pointer: this, 
      name, 
      index: NameList.procCounter
    })

    this.entries.push({
      name,
      type: NameList.TYPE.PROC,
      value: nameList,
      index: NameList.procCounter,
      procIndex: this.index 
    })

    return NameList.STATUS.OK
  }

  find(name) {
    return this.entries.find(e => e.name == name)
  }

  findRec(name) {
    
    if(!this.entries)
      return null

    const entry = this.find(name)

    if(entry)
      return entry

    const subProcs = this.entries.filter(e => e.type == NameList.TYPE.PROC)

    for(const subProc of subProcs){
      const response = subProc.value.findRec(name)
      
      if(response) 
        return response
    }

    return null
  }

  findRecReversed(name) {

    const entry = this.find(name)

    if(entry)
      return entry

    if(this.parent)
      return this.parent.findRecReversed(name)

    return null
  }

  getVarInfo(name) {

    const _v = this.findRecReversed(name)
    
    if(_v){

      const scope = !_v.procIndex
        ? NameList.SCOPE.MAIN
        : _v.procIndex == this.index
          ? NameList.SCOPE.LOCAL
          : NameList.SCOPE.GLOBAL

      return { 
        ..._v, 
        scope
      }
    }
    else{
      return null
    }
  }
}

module.exports = NameList