const SyntaxGraph = require("./SyntaxGraph")
const CodeGen = require("./CodeGen")

class Parser {

  static STATUS = {
    OK: true,
    ERROR: false
  }

  constructor(codeGen) {
    this.codeGen = codeGen
  }

  /** 
   * Erstellt einen gerichteten Graphen auf Grundlage von grammarString
   * @param grammarString
  */
  initGrammar(grammarString) {

    this.syntaxGraphs = {}

    grammarString.split("\n").forEach(line => {
      const [ key, ebnf ] = line.split(/=(.+)/).map(a => a.trim())
      this.syntaxGraphs[key] = new SyntaxGraph(ebnf)
    })
  }

  /** 
   * Parset Morpheme und gibt bei Erfolg { status: Parser.STATUS.OK } zurück
  */
  parse(morphemList) {

    let errorTraceBack = []
    
    // gibt true zurück, wenn exitNode von curNode erreicht werden kann
    const canReachExitNode = (graph, curNode, level = 0) => {

      if(level > 5) return false; // verhindert endlose Rekursion

      const edges = graph.edges.filter(e => e.start == curNode && e.type == SyntaxGraph.EDGE_TYPES.NONE)

      if(!edges.length) return false;

      for(const edge of edges)
        if(edge.end == 1) return true;

      for(const edge of edges)
        if(canReachExitNode(graph, edge.end, level + 1)) return true;

      return false;
    }

    // gibt alle möglichen Edges zurück und überspringt dabei alle von Type 0
    const getPossibleEdges = (graph, curNode, fromNode = null) => {

      let output = []

      const edges = graph.edges.filter(e => e.start == curNode && !(fromNode && e.end == fromNode))

      for(const edge of edges){
        if(edge.type == SyntaxGraph.EDGE_TYPES.NONE)
          output = output.concat(getPossibleEdges(graph, edge.end, curNode))
        else
          output.push(edge)
      }

      return output
    }

    // rekursives Parsen eines Graphen, gibt { status, morphemPos } zurück
    const parseRec = (graph, morphemPos, curNode = 0) => {

      while(true){

        const morphem = morphemList[morphemPos]
        const edges = getPossibleEdges(graph, curNode)

        // Liste von { node, morphemPos } die von aktueller Position erreicht werden können
        let nextPosList = [] 

        for(const edge of edges){

          switch(edge.type){
            case SyntaxGraph.EDGE_TYPES.NUMBER:
            case SyntaxGraph.EDGE_TYPES.IDENTIFIER:
              if(morphem.code == edge.type)
                if(this.codeGen.action(edge.action, morphem) == CodeGen.STATUS.OK) 
                  nextPosList.push({ node: edge.end, morphemPos: morphemPos + 1 })
              break;

            case SyntaxGraph.EDGE_TYPES.SYMBOL:
              if(morphem.code == edge.type && morphem.value == edge.value) 
                if(this.codeGen.action(edge.action, morphem) == CodeGen.STATUS.OK) 
                  nextPosList.push({ node: edge.end, morphemPos: morphemPos + 1 })
              break;

            case SyntaxGraph.EDGE_TYPES.ACTION:
              if(this.codeGen.action(edge.action, morphem) == CodeGen.STATUS.OK) 
                  nextPosList.push({ node: edge.end, morphemPos })
              break;

            case SyntaxGraph.EDGE_TYPES.GRAPH:
              const _graph = this.syntaxGraphs[edge.value]

              const response = parseRec(_graph, morphemPos)

              if(response.status == Parser.STATUS.OK)
                nextPosList.push({ node: edge.end, morphemPos: response.morphemPos })
              else
                errorTraceBack.push(response.position)
              break;

            
          }
        }  

        if(!nextPosList.length){

          // wenn es keine möglichen Edges gibt, wird versucht das Exit Node zu erreichen
          return canReachExitNode(graph, curNode)
            ? { status: Parser.STATUS.OK, morphemPos }
            : { status: Parser.STATUS.ERROR, position: morphem.position }
        }

        if(nextPosList.length == 1){

          curNode = nextPosList[0].node
          morphemPos = nextPosList[0].morphemPos

          if(curNode == 1) 
            return { status: Parser.STATUS.OK, morphemPos }

          continue;
        }

        // wenn mehr als eine Möglichkeit, werden alle Zweige ausprobiert
        for(const next of nextPosList){

          const response = parseRec(graph, next.morphemPos, next.node)

          if(response.status == Parser.STATUS.OK)
            return response;
        }

        return { status: Parser.STATUS.ERROR, position: morphem.position }
      }
    }

    const response = parseRec(this.syntaxGraphs["program"], 0)
    const status = response.status == Parser.STATUS.OK && morphemList.length <= response.morphemPos
      ? Parser.STATUS.OK
      : Parser.STATUS.ERROR

    if(response.position) errorTraceBack.push(response.position)

    return {
      status,
      errorTraceBack
    }
  }
}

module.exports = Parser