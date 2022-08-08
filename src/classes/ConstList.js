class ConstList {

  static STATUS = {
    ERROR: -1
  }

  constructor() {
    this.entries = []
    this.counter = 0
  }

  add(value, name = null) {

    if(name && this.entries.find(e => e.name == name))
      return ConstList.STATUS.ERROR

    const index = this.counter

    this.entries.push({ name, index, value })
    this.counter++

    return index
  }

  find(name) {
    return this.entries.find(e => e.name == name)
  }
}

module.exports = ConstList