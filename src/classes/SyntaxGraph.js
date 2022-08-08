const { KEYWORDS } = require("../lang/const")

class SyntaxGraph{

  static EDGE_TYPES = {
    NONE: 0,
    SYMBOL: 1,
    NUMBER: 2,
    IDENTIFIER: 3,
    GRAPH: 4,
    ACTION: 5
  }

  /** 
   *  Erstellt einen Syntaxgraphen bestehend aus einem Array von Kanten
   * @param ebnf
   * @param graphNames
  */
  constructor(ebnf) {

    let totalNodeCount = 2
    let edges = []
    let functionBuffer = null // Funktion die einer Edge zugeordnet wird

    // Gibt Position der schließenden Klammer zurück

    const findClosingBracketPos = (openingBracket, closingBracket, currentPos, str) => {

      let level = 1;

      for(let j = currentPos + 1; j < str.length; j++){
        if(openingBracket && str[j] == openingBracket) level++
        else if(str[j] == closingBracket) level--

        if(level == 0) return j;
      }
      
      throw new Error(`Missing closing bracket - "${str}" pos: ${currentPos}`)
    }

    // da sich viel Code doppelt für (), [] und {} habe ich dafür diese Funktion geschrieben

    const handleBracket = (openingBracket, closingBracket, curNode, endNode, str, i, callback) => {

      const j = findClosingBracketPos(openingBracket, closingBracket, i, str)
      const newStr = str.slice(i + 1, j)
      const isEnd = !(j < str.length - 1)
      const branchEndNode = totalNodeCount

      totalNodeCount++

      ebnfToGraph(newStr, curNode, branchEndNode)

      i = j

      if(callback) callback(curNode, branchEndNode)

      if(isEnd){
        edges.push({
          start: branchEndNode,
          end: endNode,
          type: SyntaxGraph.EDGE_TYPES.NONE
        })
      }
      else{
        curNode = branchEndNode
        totalNodeCount++
      }

      return { curNode, i }
    }

    const ebnfToGraph = (str, startNode, endNode) => {

      str = str.trim()

      let curNode = startNode

      // prüfen ob Verzweigung in oberster Ebene vorliegt

      const bracketTypes = {
        "{": ["{", "}"],
        "[": ["[", "]"],
        "(": ["(", ")"],
        "'": [null, "'"],
        "$": [null, "$"]
      }

      let branches = []
      let branchStart = 0

      for(let i = 0; i < str.length; i++) {

        if(str[i] == "|"){
          branches.push(str.slice(branchStart, i))
          branchStart = i + 1

          continue;
        }

        const b = bracketTypes[str[i]]

        if(b) i = findClosingBracketPos(b[0], b[1], i, str)
      }

      if(branches.length){

        branches.push(str.slice(branchStart, str.length))
        branches.map(branch => ebnfToGraph(branch, startNode, endNode))

        return;
      }

      for(let i = 0; i < str.length; i++) {

        if(str[i].trim() == "") continue; // whitespaces überspringen

        if(str[i] == "'"){
          const j = findClosingBracketPos(null, "'", i, str)
          const newStr = str.slice(i + 1, j)
          const isEnd = !(j < str.length - 1)

          const edge = { 
            start: curNode,
            end: isEnd ? endNode : totalNodeCount,
            type: SyntaxGraph.EDGE_TYPES.SYMBOL,
            value: KEYWORDS[newStr.toUpperCase()] || newStr.charCodeAt(0),
            action: functionBuffer
          }

          functionBuffer = null

          edges.push(edge)

          i = j

          if(!isEnd){
            curNode = totalNodeCount
            totalNodeCount++
          }
        }
        else if(str[i] == "("){
          
          const res = handleBracket("(", ")", curNode, endNode, str, i)

          curNode = res.curNode
          i = res.i
        }
        else if(str[i] == "["){

          const res = handleBracket("[", "]", curNode, endNode, str, i, (_cur, _end) => {
            edges.push({ start: _cur, end: _end, type: SyntaxGraph.EDGE_TYPES.NONE })
          })

          curNode = res.curNode
          i = res.i
        }
        else if(str[i] == "{"){

          const res = handleBracket("{", "}", curNode, endNode, str, i, (_cur, _end) => {
            edges.push({ start: _cur, end: _end, type: SyntaxGraph.EDGE_TYPES.NONE })
            edges.push({ start: _end, end: _cur, type: SyntaxGraph.EDGE_TYPES.NONE })
          })

          curNode = res.curNode
          i = res.i
        }
        else if(str[i] == "$"){
          const j = findClosingBracketPos(null, "$", i, str)
          
          functionBuffer = str.slice(i + 1, j)

          i = j
        }
        else if(str[i] == "%"){
          const isEnd = !(i < str.length - 1)
          const edge = { 
            start: curNode,
            end: isEnd ? endNode : totalNodeCount,
            type: SyntaxGraph.EDGE_TYPES.ACTION,
            action: functionBuffer
          }

          functionBuffer = null

          edges.push(edge)
        }
        else{

          let buffer = str[i]

          while(true){
            i++
            const char = str[i]

            if(!char || !char.match(/[a-zA-Z]/gm)) break;

            buffer += char
          }

          const isEnd = !(i < str.length - 1)

          let edge = {
            start: curNode,
            end: isEnd ? endNode : totalNodeCount,
            action: functionBuffer
          }

          if(buffer == "ident"){
            edge.type = SyntaxGraph.EDGE_TYPES.IDENTIFIER
          }
          else if(buffer == "num"){
            edge.type = SyntaxGraph.EDGE_TYPES.NUMBER
          }
          else{
            edge.type = SyntaxGraph.EDGE_TYPES.GRAPH
            edge.value = buffer
          }

          functionBuffer = null

          edges.push(edge)

          if(!isEnd){
            curNode = totalNodeCount
            totalNodeCount++
          }
        }
      }
    }

    ebnfToGraph(ebnf, 0, 1) // Node 1 ist immer das Ende

    this.edges = edges
    this.nodeCount = totalNodeCount
  }

}

module.exports = SyntaxGraph