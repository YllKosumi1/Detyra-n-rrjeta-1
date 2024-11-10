# Detyra-n-rrjeta-1

 # Përshkrimi i Kodit: Server dhe Klient UDP
Ky projekt përbëhet nga një server UDP dhe një klient, që komunikojnë përmes rrjetit duke dërguar komanda dhe duke marrë përgjigje.

# Funksionet e Serverit:
# Menaxhimi i Klientëve:
Pranon deri në 4 klientë në të njëjtën kohë.
Klienti i parë ka akses të plotë dhe mund të përdorë të gjitha komandat.
Klientët e tjerë kanë vetëm të drejtën për të lexuar skedarë.

# Komandat e Përkrahura:
READ <file>: Lexon përmbajtjen e një skedari.
APPEND <file> <text>: (Vetëm për klientin e parë) Shton tekst në fund të skedarit.
EXECUTE <command>: (Vetëm për klientin e parë) Ekzekuton një komandë të sistemit.
CREATE <file>: (Vetëm për klientin e parë) Krijon një skedar të ri.
ERASE <client>: (Vetëm për klientin e parë) Fshin një klient nga lista e lidhjeve.
LIST: (Vetëm për klientin e parë) Shfaq listën e klientëve të lidhur.
EXIT: Klienti largohet nga serveri.
Logimi dhe Inaktiviteti:

Çdo komandë regjistrohet në një fajll log ("server.log").
Klientët që janë inaktiv për më shumë se 60 sekonda largohen automatikisht.

# Lidhja me Serverin:
Klienti lidhet me serverin dhe dërgon komanda për ekzekutim.
Nëse është klienti i parë, fiton të drejta për modifikim, përndryshe mund vetëm të lexojë skedarë.

# Komunikimi:
Klienti dërgon komanda dhe pret përgjigje nga serveri, të cilat shfaqen në ekran.

# Shembull i Përdorimit:
Klienti mund të dërgojë komandën READ V.txt për të lexuar përmbajtjen e një skedari.
Nëse është klienti i parë, mund të përdorë APPEND V.txt Tekst shtesë për të shtuar tekst në skedar.
Ky kod është një implementim bazik i një serveri dhe klienti që përdor protokollin UDP, i cili është i thjeshtë dhe nuk garanton dorëzimin e mesazheve, por është më i shpejtë se TCP.
