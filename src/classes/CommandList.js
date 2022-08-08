class CommandList {

  constructor(parent = null) {
    this.entries = []
    this.parent = parent ? parent.pointer : null
    this.name = parent ? parent.name : null
    this.children = []
    this.label = 0
    this.whileLabels = []
  }

  add(command, args = []) {
    this.entries.push({
      command,
      args,
      address: this.getSize()
    })
  }

  getSize() {
    return this.entries.reduce((acc, { args }) => acc + 1 + args.length * 2, 0)
  }

  getChild(name) {
    return this.children.find(c => c.name == name)
  }
}

module.exports = CommandList