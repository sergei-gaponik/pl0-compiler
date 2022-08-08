
// Automaten Tabelle in "für Menschen lesbarer" Form

const automatTable = {
  next: [
    // MISC DIGIT LETTER COLON  EQ   LT   GT   SPEC  \n      (     *      )
    [ null,    1,    2,    3, null,    5,    7, null, null,    9, null, null ], // 0 symbol
    [ null, null, null, null, null, null, null, null, null, null, null, null ], // 1 number
    [ null, null, null, null, null, null, null, null, null, null, null, null ], // 2 keyword, variable
    [ null, null, null, null,    4, null, null, null, null, null, null, null ], // 3 : 
    [ null, null, null, null, null, null, null, null, null, null, null, null ], // 4 :=
    [ null, null, null, null,    6, null, null, null, null, null, null, null ], // 5 <
    [ null, null, null, null, null, null, null, null, null, null, null, null ], // 6 <=
    [ null, null, null, null,    8, null, null, null, null, null, null, null ], // 7 >
    [ null, null, null, null, null, null, null, null, null, null, null, null ], // 8 >= 
    [ null, null, null, null, null, null, null, null, null, null,   10, null ], // 9 (
    [ null, null, null, null, null, null, null, null, null, null,   11, null ], // 10 (* comment
    [   10,   10,   10,   10,   10,   10,   10,   10,   10,   10,   10,    0 ], // 11 
  ],


  // r = read 
  // w = write
  // f = finish
  // d = delete buffer

  action: [
    // MISC  DIGIT LETTER COLON  EQ   LT   GT   SPEC  \n      (     *      )
    [ "wrf", "wr", "wr", "wr", "wrf", "wr","wr", "r", "rn", "wr","wrf","wrf" ], // 0 symbol
    [   "f", "wr",  "f",  "f",   "f",  "f", "f", "f", "f" ,  "f",  "f",  "f" ], // 1 number
    [   "f", "wr", "wr",  "f",   "f",  "f", "f", "f", "f" ,  "f",  "f",  "f" ], // 2 keyword, variable
    [   "f",  "f",  "f",  "f",  "wr",  "f", "f", "f", "f" ,  "f",  "f",  "f" ], // 3 :
    [   "f",  "f",  "f",  "f",   "f",  "f", "f", "f", "f" ,  "f",  "f",  "f" ], // 4 :=
    [   "f",  "f",  "f",  "f",  "wr",  "f", "f", "f", "f" ,  "f",  "f",  "f" ], // 5 <
    [   "f",  "f",  "f",  "f",   "f",  "f", "f", "f", "f" ,  "f",  "f",  "f" ], // 6 <=
    [   "f",  "f",  "f",  "f",  "wr",  "f", "f", "f", "f" ,  "f",  "f",  "f" ], // 7 >
    [   "f",  "f",  "f",  "f",   "f",  "f", "f", "f", "f" ,  "f",  "f",  "f" ], // 8 >= 
    [   "f",  "f",  "f",  "f",   "f",  "f", "f", "f", "f" ,  "f",  "r",  "f" ], // 9 (
    [   "r",  "r",  "r",  "r",   "r",  "r", "r", "r", "r" ,  "r",  "r",  "r" ], // 10 * 
    [   "r",  "r",  "r",  "r",   "r",  "r", "r", "r", "r" ,  "r",  "r", "dr" ], // 11 ) 
  ]
}

// Automat wird für Lexer optimiert

const optimizedAutomatTable = automatTable.next.map((row, i) => {

  return row.map((cell, j) => [ cell, automatTable.action[i][j] ])

})


module.exports = optimizedAutomatTable