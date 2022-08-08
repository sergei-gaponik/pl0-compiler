# Belegarbeit für Compiler/Interpreter #
Author: Sergei Gaponik

## Hinweise ##
Der Compiler wurde für die Sprache PL0 entwickelt. Folgende Sprachelemente wurden umgesetzt:
- Variablen (global, lokal)
- Konstanten (global)
- Arithmetische Operationen
- Eingabe, Ausgabe
- Prozeduren
- Bedingte Anweisungen (if)
- Schleifen (while)
- Kommentare

## Benutzung ##
Um den Compiler zu benutzen, muss NodeJS installiert sein. Getestet wurde er unter v15.7.0. Bei älteren Node-Versionen können Fehler auftreten. Es sind keine npm-Packages installiert, ein Package-Manager ist nicht erforderlich.

Aus dem Root-Directory kann das Programm aufgerufen werden mit:

`node main <inputPath> [<outputPath>]`

Wenn kein outputPath angegeben ist, wird in die Datei output.cl0 geschrieben. Läuft der Compiler erfolgreich durch, gibt er den absoluten Pfad der Ausgabedatei zurück, sowie die Anzahl an Bytes die geschrieben wurden.
