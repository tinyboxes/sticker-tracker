import { useState, useEffect, useMemo, useRef } from "react";
import { Search, Plus, Minus, X, Loader2, Sparkles, Download, Upload } from "lucide-react";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Inter:wght@400;500;600&display=swap');`;

// North American exclusive parallel colors (border/foil chase versions).
// Odds per Panini America: Orange (Amazon exclusive), Blue 1:2, Red 1:25, Purple 1:200, Green 1:1400, Black 1/1.
const PARALLELS = [
  { key: "Black", color: "#1a1a1a", rarity: 6, label: "Black (1/1)" },
  { key: "Green", color: "#16A34A", rarity: 5, label: "Green (1:1400)" },
  { key: "Orange", color: "#F08A3C", rarity: 4, label: "Orange (Amazon excl.)" },
  { key: "Purple", color: "#9333EA", rarity: 3, label: "Purple (1:200)" },
  { key: "Red", color: "#DC2626", rarity: 2, label: "Red (1:25)" },
  { key: "Blue", color: "#3B82F6", rarity: 1, label: "Blue (1:2)" },
];
const PARALLEL_BY_KEY = Object.fromEntries(PARALLELS.map((p) => [p.key, p]));

// 2026 World Cup group stage draw (Dec 5, 2025), 12 groups of 4.
const TEAM_TO_GROUP = {
  "Mexico": "A", "South Africa": "A", "South Korea": "A", "Czechia": "A",
  "Canada": "B", "Bosnia and Herzegovina": "B", "Qatar": "B", "Switzerland": "B",
  "Brazil": "C", "Morocco": "C", "Haiti": "C", "Scotland": "C",
  "USA": "D", "Paraguay": "D", "Australia": "D", "Türkiye": "D",
  "Germany": "E", "Curaçao": "E", "Ivory Coast": "E", "Ecuador": "E",
  "Netherlands": "F", "Japan": "F", "Sweden": "F", "Tunisia": "F",
  "Belgium": "G", "Egypt": "G", "Iran": "G", "New Zealand": "G",
  "Spain": "H", "Cape Verde": "H", "Saudi Arabia": "H", "Uruguay": "H",
  "France": "I", "Senegal": "I", "Iraq": "I", "Norway": "I",
  "Argentina": "J", "Algeria": "J", "Austria": "J", "Jordan": "J",
  "Portugal": "K", "Congo DR": "K", "Uzbekistan": "K", "Colombia": "K",
  "England": "L", "Croatia": "L", "Ghana": "L", "Panama": "L",
};
const GROUP_ORDER = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "Tournament"];

// Official 2026 Panini FIFA World Cup checklist (North America), 48 teams, 979 base stickers.
// Each row: [number, team, player, foil(1/0)]
const CHECKLIST_2026_NA = [["FWC1","FWC","Official Emblem",1],["FWC2","FWC","Official Emblem",1],["FWC3","FWC","Official Mascots",1],["FWC4","FWC","Official Slogan",1],["FWC5","FWC","Official Ball",1],["FWC6","Host Countries & Cities","Canada",1],["FWC7","Host Countries & Cities","Mexico",1],["FWC8","Host Countries & Cities","USA",1],["MEX1","Mexico","Team Logo",1],["MEX2","Mexico","Luis Malagón",0],["MEX3","Mexico","Johan Vasquez",0],["MEX4","Mexico","Jorge Sánchez",0],["MEX5","Mexico","Cesar Montes",0],["MEX6","Mexico","Jesus Gallardo",0],["MEX7","Mexico","Israel Reyes",0],["MEX8","Mexico","Diego Lainez",0],["MEX9","Mexico","Carlos Rodriguez",0],["MEX10","Mexico","Edson Alvarez",0],["MEX11","Mexico","Orbelin Pineda",0],["MEX12","Mexico","Marcel Ruiz",0],["MEX13","Mexico","Team Photo",0],["MEX14","Mexico","Érick Sánchez",0],["MEX15","Mexico","Hirving Lozano",0],["MEX16","Mexico","Santiago Giménez",0],["MEX17","Mexico","Raúl Jiménez",0],["MEX18","Mexico","Alexis Vega",0],["MEX19","Mexico","Roberto Alvarado",0],["MEX20","Mexico","Cesar Huerta",0],["RSA1","South Africa","Team Logo",1],["RSA2","South Africa","Ronwen Williams",0],["RSA3","South Africa","Sipho Chaine",0],["RSA4","South Africa","Aubrey Modiba",0],["RSA5","South Africa","Samukele Kabini",0],["RSA6","South Africa","Mbekezeli Mbokazi",0],["RSA7","South Africa","Khulumani Ndamane",0],["RSA8","South Africa","Siyabonga Ngezana",0],["RSA9","South Africa","Khuliso Mudau",0],["RSA10","South Africa","Nkosinathi Sibisi",0],["RSA11","South Africa","Teboho Mokoena",0],["RSA12","South Africa","Thalente Mbatha",0],["RSA13","South Africa","Team Photo",0],["RSA14","South Africa","Bathasi Aubaas",0],["RSA15","South Africa","Yaya Sithole",0],["RSA16","South Africa","Sipho Mbule",0],["RSA17","South Africa","Lyle Foster",0],["RSA18","South Africa","Iqraam Rayners",0],["RSA19","South Africa","Mohau Nkota",0],["RSA20","South Africa","Oswin Appollis",0],["KOR1","South Korea","Team Logo",1],["KOR2","South Korea","Hyeon-woo Jo",0],["KOR3","South Korea","Seung-Gyu Kim",0],["KOR4","South Korea","Min-jae Kim",0],["KOR5","South Korea","Yu-min Cho",0],["KOR6","South Korea","Young-woo Seol",0],["KOR7","South Korea","Han-beom Lee",0],["KOR8","South Korea","Tae-seok Lee",0],["KOR9","South Korea","Myung-jae Lee",0],["KOR10","South Korea","Jae-sung Lee",0],["KOR11","South Korea","In-beom Hwang",0],["KOR12","South Korea","Kang-in Lee",0],["KOR13","South Korea","Team Photo",0],["KOR14","South Korea","Seung-ho Paik",0],["KOR15","South Korea","Jens Castrop",0],["KOR16","South Korea","Dongg-yeong Lee",0],["KOR17","South Korea","Gue-sung Cho",0],["KOR18","South Korea","Heung-min Son",0],["KOR19","South Korea","Hee-chan Hwang",0],["KOR20","South Korea","Hyeon-Gyu Oh",0],["CZE1","Czechia","Team Logo",1],["CZE2","Czechia","Matej Kovar",0],["CZE3","Czechia","Jindrich Stanek",0],["CZE4","Czechia","Ladislav Krejci",0],["CZE5","Czechia","Vladimir Coufal",0],["CZE6","Czechia","Jaroslav Zeleny",0],["CZE7","Czechia","Tomas Holes",0],["CZE8","Czechia","David Zima",0],["CZE9","Czechia","Michal Sadilek",0],["CZE10","Czechia","Lukas Provod",0],["CZE11","Czechia","Lukas Cerv",0],["CZE12","Czechia","Tomas Soucek",0],["CZE13","Czechia","Team Photo",0],["CZE14","Czechia","Pavel Sulc",0],["CZE15","Czechia","Matej Vydra",0],["CZE16","Czechia","Vasil Kusej",0],["CZE17","Czechia","Tomas Chory",0],["CZE18","Czechia","Vaclav Cerny",0],["CZE19","Czechia","Adam Hlozek",0],["CZE20","Czechia","Patrik Schick",0],["CAN1","Canada","Team Logo",1],["CAN2","Canada","Dayne St.Clair",0],["CAN3","Canada","Alphonso Davies",0],["CAN4","Canada","Alistair Johnston",0],["CAN5","Canada","Samuel Adekugbe",0],["CAN6","Canada","Riche Larvea",0],["CAN7","Canada","Derek Cornelius",0],["CAN8","Canada","Moïse Bombito",0],["CAN9","Canada","Kamal Miller",0],["CAN10","Canada","Stephen Eustáquio",0],["CAN11","Canada","Ismaël Koné",0],["CAN12","Canada","Jonathan Osorio",0],["CAN13","Canada","Team Photo",0],["CAN14","Canada","Jacob Shaffelburg",0],["CAN15","Canada","Mathieu Choinière",0],["CAN16","Canada","Niko Sigur",0],["CAN17","Canada","Tajon Buchanan",0],["CAN18","Canada","Liam Millar",0],["CAN19","Canada","Cyle Larin",0],["CAN20","Canada","Jonathan David",0],["BIH1","Bosnia and Herzegovina","Team Logo",1],["BIH2","Bosnia and Herzegovina","Nikola Vasilj",0],["BIH3","Bosnia and Herzegovina","Amer Dedic",0],["BIH4","Bosnia and Herzegovina","Sead Kolasinac",0],["BIH5","Bosnia and Herzegovina","Tarik Muharemovic",0],["BIH6","Bosnia and Herzegovina","Nihad Mujakic",0],["BIH7","Bosnia and Herzegovina","Nikola Katic",0],["BIH8","Bosnia and Herzegovina","Amir Hadziahmetovic",0],["BIH9","Bosnia and Herzegovina","Benjamin Tahirovic",0],["BIH10","Bosnia and Herzegovina","Armin Gigovic",0],["BIH11","Bosnia and Herzegovina","Ivan Sunjic",0],["BIH12","Bosnia and Herzegovina","Ivan Basic",0],["BIH13","Bosnia and Herzegovina","Team Photo",0],["BIH14","Bosnia and Herzegovina","Dzenis Burnic",0],["BIH15","Bosnia and Herzegovina","Esmir Bajraktarevic",0],["BIH16","Bosnia and Herzegovina","Amar Memic",0],["BIH17","Bosnia and Herzegovina","Ermedin Demirovic",0],["BIH18","Bosnia and Herzegovina","Edin Dzeko",0],["BIH19","Bosnia and Herzegovina","Samed Bazdar",0],["BIH20","Bosnia and Herzegovina","Haris Tabakovic",0],["QAT1","Qatar","Team Logo",1],["QAT2","Qatar","Meshaal Barsham",0],["QAT3","Qatar","Sultan Albrake",0],["QAT4","Qatar","Lucas Mendes",0],["QAT5","Qatar","Homam Ahmed",0],["QAT6","Qatar","Boualem Khoukhi",0],["QAT7","Qatar","Pedro Miguel",0],["QAT8","Qatar","Tarek Salman",0],["QAT9","Qatar","Mohamed Al-Mannai",0],["QAT10","Qatar","Karim Boudiaf",0],["QAT11","Qatar","Assim Madibo",0],["QAT12","Qatar","Ahmed Fatehi",0],["QAT13","Qatar","Team Photo",0],["QAT14","Qatar","Mohammed Waad",0],["QAT15","Qatar","Abdulaziz Hatem",0],["QAT16","Qatar","Hassan Al-Haydos",0],["QAT17","Qatar","Edmilson Junior",0],["QAT18","Qatar","Akram Hassan Afif",0],["QAT19","Qatar","Ahmed Al Ganehi",0],["QAT20","Qatar","Almoez Ali",0],["SUI1","Switzerland","Team Logo",1],["SUI2","Switzerland","Gregor Kobel",0],["SUI3","Switzerland","Yvon Mvogo",0],["SUI4","Switzerland","Manuel Akanji",0],["SUI5","Switzerland","Ricardo Rodriguez",0],["SUI6","Switzerland","Nico Elvedi",0],["SUI7","Switzerland","Aurèle Amenda",0],["SUI8","Switzerland","Silvan Widmer",0],["SUI9","Switzerland","Granit Xhaka",0],["SUI10","Switzerland","Denis Zakaria",0],["SUI11","Switzerland","Remo Freuler",0],["SUI12","Switzerland","Fabian Rieder",0],["SUI13","Switzerland","Team Photo",0],["SUI14","Switzerland","Ardon Jashari",0],["SUI15","Switzerland","Johan Manzambi",0],["SUI16","Switzerland","Michel Aebischer",0],["SUI17","Switzerland","Breel Embolo",0],["SUI18","Switzerland","Ruben Vargas",0],["SUI19","Switzerland","Dan Ndoye",0],["SUI20","Switzerland","Zeki Amdouni",0],["BRA1","Brazil","Team Logo",1],["BRA2","Brazil","Alisson",0],["BRA3","Brazil","Bento",0],["BRA4","Brazil","Marquinhos",0],["BRA5","Brazil","Éder Militão",0],["BRA6","Brazil","Gabriel Magalhães",0],["BRA7","Brazil","Danilo",0],["BRA8","Brazil","Wesley",0],["BRA9","Brazil","Lucas Paquetá",0],["BRA10","Brazil","Casemiro",0],["BRA11","Brazil","Bruno Guimarães",0],["BRA12","Brazil","Luiz Henrique",0],["BRA13","Brazil","Team Photo",0],["BRA14","Brazil","Vinicius Júnior",0],["BRA15","Brazil","Rodrygo",0],["BRA16","Brazil","João Pedro",0],["BRA17","Brazil","Matheus Cunha",0],["BRA18","Brazil","Gabriel Martinelli",0],["BRA19","Brazil","Raphinha",0],["BRA20","Brazil","Estévão",0],["MAR1","Morocco","Team Logo",1],["MAR2","Morocco","Yassine Bounou",0],["MAR3","Morocco","Munir El Kajoui",0],["MAR4","Morocco","Achraf Hakimi",0],["MAR5","Morocco","Noussair Mazraoui",0],["MAR6","Morocco","Nayef Aguerd",0],["MAR7","Morocco","Roman Saiss",0],["MAR8","Morocco","Jawad El Yamio",0],["MAR9","Morocco","Adam Masina",0],["MAR10","Morocco","Sofyan Amrabat",0],["MAR11","Morocco","Azzedine Ounahi",0],["MAR12","Morocco","Eliesse Ben Seghir",0],["MAR13","Morocco","Team Photo",0],["MAR14","Morocco","Bilal El Khannouss",0],["MAR15","Morocco","Ismael Saibari",0],["MAR16","Morocco","Youssef En-Nesyri",0],["MAR17","Morocco","Abde Ezzalzouli",0],["MAR18","Morocco","Soufiane Rahimi",0],["MAR19","Morocco","Brahim Diaz",0],["MAR20","Morocco","Ayoub El Kaabi",0],["HAI1","Haiti","Team Logo",1],["HAI2","Haiti","Johny Placide",0],["HAI3","Haiti","Carlens Arcus",0],["HAI4","Haiti","Martin Expérience",0],["HAI5","Haiti","Jean-Kevin Duverne",0],["HAI6","Haiti","Ricardo Adé",0],["HAI7","Haiti","Duke Lacroix",0],["HAI8","Haiti","Garven Metusala",0],["HAI9","Haiti","Hannes Delcroix",0],["HAI10","Haiti","Leverton Pierre",0],["HAI11","Haiti","Danley Jean Jacques",0],["HAI12","Haiti","Jean-Ricner Bellegarde",0],["HAI13","Haiti","Team Photo",0],["HAI14","Haiti","Christopher Attys",0],["HAI15","Haiti","Derrick Etienne Jr",0],["HAI16","Haiti","Josue Casimir",0],["HAI17","Haiti","Ruben Providence",0],["HAI18","Haiti","Duckens Nazon",0],["HAI19","Haiti","Louicius Deedson",0],["HAI20","Haiti","Frantzdy Pierrot",0],["SCO1","Scotland","Team Logo",1],["SCO2","Scotland","Angus Gunn",0],["SCO3","Scotland","Jack Hendry",0],["SCO4","Scotland","Kieran Tierney",0],["SCO5","Scotland","Aaron Hickey",0],["SCO6","Scotland","Andrew Robertson",0],["SCO7","Scotland","Scott McKenna",0],["SCO8","Scotland","John Souttar",0],["SCO9","Scotland","Anthony Ralston",0],["SCO10","Scotland","Grant Hanley",0],["SCO11","Scotland","Scott McTominay",0],["SCO12","Scotland","Billy Gilmour",0],["SCO13","Scotland","Team Photo",0],["SCO14","Scotland","Lewis Ferguson",0],["SCO15","Scotland","Ryan Christie",0],["SCO16","Scotland","Kenny McLean",0],["SCO17","Scotland","John McGinn",0],["SCO18","Scotland","Lyndon Dykes",0],["SCO19","Scotland","Che Adams",0],["SCO20","Scotland","Ben Gannon-Doak",0],["USA1","USA","Team Logo",1],["USA2","USA","Math Freese",0],["USA3","USA","Chris Richards",0],["USA4","USA","Tim Ream",0],["USA5","USA","Mark McKenzie",0],["USA6","USA","Alex Freeman",0],["USA7","USA","Antonee Robinson",0],["USA8","USA","Tyler Adams",0],["USA9","USA","Tanner Tessmann",0],["USA10","USA","Weston McKenny",0],["USA11","USA","Christian Roldan",0],["USA12","USA","Timothy Weah",0],["USA13","USA","Team Photo",0],["USA14","USA","Diego Luna",0],["USA15","USA","Malik Tillman",0],["USA16","USA","Christian Pulisic",0],["USA17","USA","Brenden Aaronson",0],["USA18","USA","Ricardo Pepi",0],["USA19","USA","Haji Wright",0],["USA20","USA","Folarin Balogun",0],["PAR1","Paraguay","Team Logo",1],["PAR2","Paraguay","Roberto Fernandez",0],["PAR3","Paraguay","Orlando Gill",0],["PAR4","Paraguay","Gustavo Gomez",0],["PAR5","Paraguay","Fabián Balbuena",0],["PAR6","Paraguay","Juan José Cáceres",0],["PAR7","Paraguay","Omar Alderete",0],["PAR8","Paraguay","Junior Alonso",0],["PAR9","Paraguay","Mathías Villasanti",0],["PAR10","Paraguay","Diego Gomez",0],["PAR11","Paraguay","Damián Bobadilla",0],["PAR12","Paraguay","Andres Cubas",0],["PAR13","Paraguay","Team Photo",0],["PAR14","Paraguay","Matias Galarza Fonda",0],["PAR15","Paraguay","Julio Enciso",0],["PAR16","Paraguay","Alejandro Romero Gamarra",0],["PAR17","Paraguay","Miguel Almirón",0],["PAR18","Paraguay","Ramon Sosa",0],["PAR19","Paraguay","Angel Romero",0],["PAR20","Paraguay","Antonio Sanabria",0],["AUS1","Australia","Team Logo",1],["AUS2","Australia","Mathew Ryan",0],["AUS3","Australia","Joe Gauci",0],["AUS4","Australia","Harry Souttar",0],["AUS5","Australia","Alessandro Circati",0],["AUS6","Australia","Jordan Bos",0],["AUS7","Australia","Aziz Behich",0],["AUS8","Australia","Cameron Burgess",0],["AUS9","Australia","Lewis Miller",0],["AUS10","Australia","Milos Degenek",0],["AUS11","Australia","Jackson Irvine",0],["AUS12","Australia","Riley McGree",0],["AUS13","Australia","Team Photo",0],["AUS14","Australia","Aiden O'Neill",0],["AUS15","Australia","Connor Metcalfe",0],["AUS16","Australia","Patrick Yazbek",0],["AUS17","Australia","Craig Goodwin",0],["AUS18","Australia","Kusini Vengi",0],["AUS19","Australia","Nestory Irankunda",0],["AUS20","Australia","Mohamed Touré",0],["TUR1","Türkiye","Team Logo",1],["TUR2","Türkiye","Ugurcan Cakir",0],["TUR3","Türkiye","Mert Muldur",0],["TUR4","Türkiye","Zeki Celik",0],["TUR5","Türkiye","Abdulkerim Bardakci",0],["TUR6","Türkiye","Caglar Soyuncu",0],["TUR7","Türkiye","Merih Demiral",0],["TUR8","Türkiye","Ferdi Kadioglu",0],["TUR9","Türkiye","Kaan Ayhan",0],["TUR10","Türkiye","Ismail Yuksek",0],["TUR11","Türkiye","Hakan Calhanoglu",0],["TUR12","Türkiye","Orkun Kokcu",0],["TUR13","Türkiye","Team Photo",0],["TUR14","Türkiye","Arda Guler",0],["TUR15","Türkiye","Irfan Can Kahveci",0],["TUR16","Türkiye","Yunus Akgun",0],["TUR17","Türkiye","Can Uzun",0],["TUR18","Türkiye","Baris Alper Yilmaz",0],["TUR19","Türkiye","Kerem Akturkoglu",0],["TUR20","Türkiye","Kenan Yildiz",0],["GER1","Germany","Team Logo",1],["GER2","Germany","Marc-André ter Stegen",0],["GER3","Germany","Jonathan Tah",0],["GER4","Germany","David Raum",0],["GER5","Germany","Nico Schlotterbeck",0],["GER6","Germany","Antonio Rüdiger",0],["GER7","Germany","Waldemar Anton",0],["GER8","Germany","Ridle Baku",0],["GER9","Germany","Maximilian Mittelstadt",0],["GER10","Germany","Joshua Kimmich",0],["GER11","Germany","Florian Wirtz",0],["GER12","Germany","Felix Nmecha",0],["GER13","Germany","Team Photo",0],["GER14","Germany","Leon Goretzka",0],["GER15","Germany","Jamal Musiala",0],["GER16","Germany","Serge Gnabry",0],["GER17","Germany","Kai Havertz",0],["GER18","Germany","Leroy Sane",0],["GER19","Germany","Karim Adeyemi",0],["GER20","Germany","Nick Woltemade",0],["CUW1","Curaçao","Team Logo",1],["CUW2","Curaçao","Eloy Room",0],["CUW3","Curaçao","Armando Obispo",0],["CUW4","Curaçao","Sherel Floranus",0],["CUW5","Curaçao","Jurien Gaari",0],["CUW6","Curaçao","Joshua Brenet",0],["CUW7","Curaçao","Roshon Van Eijma",0],["CUW8","Curaçao","Shurandy Sambo",0],["CUW9","Curaçao","Livano Comenencia",0],["CUW10","Curaçao","Godfried Roemeratoe",0],["CUW11","Curaçao","Juninho Bacuna",0],["CUW12","Curaçao","Leandro Bacuna",0],["CUW13","Curaçao","Team Photo",0],["CUW14","Curaçao","Tahith Chong",0],["CUW15","Curaçao","Kenji Gorre",0],["CUW16","Curaçao","Jearl Margaritha",0],["CUW17","Curaçao","Jurgen Locadia",0],["CUW18","Curaçao","Jeremy Antonisse",0],["CUW19","Curaçao","Gervane Kastaneer",0],["CUW20","Curaçao","Sontje Hansen",0],["CIV1","Ivory Coast","Team Logo",1],["CIV2","Ivory Coast","Yahia Fofana",0],["CIV3","Ivory Coast","Ghislain Konan",0],["CIV4","Ivory Coast","Wilfried Singo",0],["CIV5","Ivory Coast","Odilon Kossounou",0],["CIV6","Ivory Coast","Evan Ndicka",0],["CIV7","Ivory Coast","Willy Boly",0],["CIV8","Ivory Coast","Emmanuel Agbadou",0],["CIV9","Ivory Coast","Ousmane Diomande",0],["CIV10","Ivory Coast","Franck Kessie",0],["CIV11","Ivory Coast","Seko Fofana",0],["CIV12","Ivory Coast","Ibrahim Sangare",0],["CIV13","Ivory Coast","Team Photo",0],["CIV14","Ivory Coast","Jean-Philippe Gbamin",0],["CIV15","Ivory Coast","Amad Diallo",0],["CIV16","Ivory Coast","Sébastien Haller",0],["CIV17","Ivory Coast","Simon Adingra",0],["CIV18","Ivory Coast","Yan Diomande",0],["CIV19","Ivory Coast","Evann Guessand",0],["CIV20","Ivory Coast","Oumar Diakite",0],["ECU1","Ecuador","Team Logo",1],["ECU2","Ecuador","Hernán Galíndez",0],["ECU3","Ecuador","Gonzalo Valle",0],["ECU4","Ecuador","Piero Hincapié",0],["ECU5","Ecuador","Pervis Estupiñán",0],["ECU6","Ecuador","Willian Pacho",0],["ECU7","Ecuador","Ángelo Preciado",0],["ECU8","Ecuador","Joel Ordóñez",0],["ECU9","Ecuador","Moises Caicedo",0],["ECU10","Ecuador","Alan Franco",0],["ECU11","Ecuador","Kendry Paez",0],["ECU12","Ecuador","Pedro Vite",0],["ECU13","Ecuador","Team Photo",0],["ECU14","Ecuador","John Veboah",0],["ECU15","Ecuador","Leonardo Campana",0],["ECU16","Ecuador","Gonzalo Plata",0],["ECU17","Ecuador","Nilson Angulo",0],["ECU18","Ecuador","Alan Minda",0],["ECU19","Ecuador","Kevin Rodriguez",0],["ECU20","Ecuador","Enner Valencia",0],["NED1","Netherlands","Team Logo",1],["NED2","Netherlands","Bart Verbruggen",0],["NED3","Netherlands","Virgil van Dijk",0],["NED4","Netherlands","Micky van de Ven",0],["NED5","Netherlands","Jurrien Timber",0],["NED6","Netherlands","Denzel Dumfries",0],["NED7","Netherlands","Nathan Aké",0],["NED8","Netherlands","Jeremie Frimpong",0],["NED9","Netherlands","Jan Paul van Hecke",0],["NED10","Netherlands","Tijjani Reijnders",0],["NED11","Netherlands","Ryan Gravenberch",0],["NED12","Netherlands","Teun Koopmeiners",0],["NED13","Netherlands","Team Photo",0],["NED14","Netherlands","Frenkie de Jong",0],["NED15","Netherlands","Xavi Simons",0],["NED16","Netherlands","Justin Kluivert",0],["NED17","Netherlands","Memphis Depay",0],["NED18","Netherlands","Donyell Malen",0],["NED19","Netherlands","Wout Weghorst",0],["NED20","Netherlands","Cody Gakpo",0],["JPN1","Japan","Team Logo",1],["JPN2","Japan","Zion Suzuki",0],["JPN3","Japan","Henry Heroki Mochizuki",0],["JPN4","Japan","Ayumu Seko",0],["JPN5","Japan","Junnosuke Suzuki",0],["JPN6","Japan","Shogo Taniguchi",0],["JPN7","Japan","Tsuyoshi Watanabe",0],["JPN8","Japan","Kaishu Sano",0],["JPN9","Japan","Yuki Soma",0],["JPN10","Japan","Ao Tanaka",0],["JPN11","Japan","Daichi Kamada",0],["JPN12","Japan","Takefusa Kubo",0],["JPN13","Japan","Team Photo",0],["JPN14","Japan","Ritsu Doan",0],["JPN15","Japan","Keito Nakamura",0],["JPN16","Japan","Takumi Minamino",0],["JPN17","Japan","Shuto Machino",0],["JPN18","Japan","Junya Ito",0],["JPN19","Japan","Koki Ogawa",0],["JPN20","Japan","Ayase Ueda",0],["SWE1","Sweden","Team Logo",1],["SWE2","Sweden","Victor Johansson",0],["SWE3","Sweden","Isak Hien",0],["SWE4","Sweden","Gabriel Gudmundsson",0],["SWE5","Sweden","Emil Holm",0],["SWE6","Sweden","Victor Nilsson Lindelöf",0],["SWE7","Sweden","Gustaf Lagerbielke",0],["SWE8","Sweden","Lucas Bergvall",0],["SWE9","Sweden","Hugo Larsson",0],["SWE10","Sweden","Jesper Karlström",0],["SWE11","Sweden","Yasin Ayari",0],["SWE12","Sweden","Mattias Svanberg",0],["SWE13","Sweden","Team Photo",0],["SWE14","Sweden","Daniel Svensson",0],["SWE15","Sweden","Ken Sema",0],["SWE16","Sweden","Roony Bardghji",0],["SWE17","Sweden","Dejan Kulusevski",0],["SWE18","Sweden","Anthony Elanga",0],["SWE19","Sweden","Alexander Isak",0],["SWE20","Sweden","Viktor Gyökeres",0],["TUN1","Tunisia","Team Logo",1],["TUN2","Tunisia","Bechir Ben Said",0],["TUN3","Tunisia","Aymen Dahmen",0],["TUN4","Tunisia","Yan Valery",0],["TUN5","Tunisia","Montassar Talbi",0],["TUN6","Tunisia","Yassine Meriah",0],["TUN7","Tunisia","Ali Abdi",0],["TUN8","Tunisia","Dylan Bronn",0],["TUN9","Tunisia","Ellyes Skhiri",0],["TUN10","Tunisia","Aissa Laidouni",0],["TUN11","Tunisia","Ferjani Sassi",0],["TUN12","Tunisia","Mohamed Ali Ben Romdhane",0],["TUN13","Tunisia","Team Photo",0],["TUN14","Tunisia","Hannibal Mejbri",0],["TUN15","Tunisia","Elias Achouri",0],["TUN16","Tunisia","Elias Saad",0],["TUN17","Tunisia","Hazem Mastouri",0],["TUN18","Tunisia","Ismael Gharbi",0],["TUN19","Tunisia","Sayfallah Ltaief",0],["TUN20","Tunisia","Naim Sliti",0],["BEL1","Belgium","Team Logo",1],["BEL2","Belgium","Thibaut Courtois",0],["BEL3","Belgium","Arthur Theate",0],["BEL4","Belgium","Timothy Castagne",0],["BEL5","Belgium","Zeno Debast",0],["BEL6","Belgium","Brandon Mechele",0],["BEL7","Belgium","Maxim De Cuyper",0],["BEL8","Belgium","Thomas Meunier",0],["BEL9","Belgium","Youri Tielemans",0],["BEL10","Belgium","Amadou Onana",0],["BEL11","Belgium","Nicolas Raskin",0],["BEL12","Belgium","Alexis Saelemaekers",0],["BEL13","Belgium","Team Photo",0],["BEL14","Belgium","Hans Vanaken",0],["BEL15","Belgium","Kevin De Bruyne",0],["BEL16","Belgium","Jérémy Doku",0],["BEL17","Belgium","Charles De Ketelaere",0],["BEL18","Belgium","Leandro Trossard",0],["BEL19","Belgium","Loïs Openda",0],["BEL20","Belgium","Romelu Lukaku",0],["EGY1","Egypt","Team Logo",1],["EGY2","Egypt","Mohamed El Shenawy",0],["EGY3","Egypt","Mohamed Hany",0],["EGY4","Egypt","Mohamed Hamdy",0],["EGY5","Egypt","Yasser Ibrahim",0],["EGY6","Egypt","Khaled Sobhi",0],["EGY7","Egypt","Ramy Rabia",0],["EGY8","Egypt","Hossam Abdelmaguid",0],["EGY9","Egypt","Ahmed Fatouh",0],["EGY10","Egypt","Marwan Attia",0],["EGY11","Egypt","Zizo",0],["EGY12","Egypt","Hamdy Fathy",0],["EGY13","Egypt","Team Photo",0],["EGY14","Egypt","Mohamed Lasheen",0],["EGY15","Egypt","Emam Ashour",0],["EGY16","Egypt","Osama Faisal",0],["EGY17","Egypt","Mohamed Salah",0],["EGY18","Egypt","Mostafa Mohamed",0],["EGY19","Egypt","Trezeguet",0],["EGY20","Egypt","Omar Marmoush",0],["IRN1","Iran","Team Logo",1],["IRN2","Iran","Alireza Beiranvand",0],["IRN3","Iran","Morteza Pouraliganji",0],["IRN4","Iran","Ehsan Hajsafi",0],["IRN5","Iran","Milad Mohammadi",0],["IRN6","Iran","Shojae Khalilzadeh",0],["IRN7","Iran","Ramin Rezaeian",0],["IRN8","Iran","Hossein Kanaani",0],["IRN9","Iran","Sadegh Moharrami",0],["IRN10","Iran","Saleh Hardani",0],["IRN11","Iran","Saeed Ezatolahi",0],["IRN12","Iran","Saman Ghoddos",0],["IRN13","Iran","Team Photo",0],["IRN14","Iran","Omid Noorafkan",0],["IRN15","Iran","Roozbeh Cheshmi",0],["IRN16","Iran","Mohammad Mohebi",0],["IRN17","Iran","Sardar Azmoun",0],["IRN18","Iran","Mehdi Taremi",0],["IRN19","Iran","Alireza Jahanbakhsh",0],["IRN20","Iran","Ali Gholizadeh",0],["NZL1","New Zealand","Team Logo",1],["NZL2","New Zealand","Max Crocombe Payne",0],["NZL3","New Zealand","Alex Paulsen",0],["NZL4","New Zealand","Michael Boxall",0],["NZL5","New Zealand","Liberato Cacace",0],["NZL6","New Zealand","Tim Payne",0],["NZL7","New Zealand","Tyler Bindon",0],["NZL8","New Zealand","Francis de Vries",0],["NZL9","New Zealand","Finn Surman",0],["NZL10","New Zealand","Joe Bell",0],["NZL11","New Zealand","Sarpreet Singh",0],["NZL12","New Zealand","Ryan Thomas",0],["NZL13","New Zealand","Team Photo",0],["NZL14","New Zealand","Matthew Garbett",0],["NZL15","New Zealand","Marko Stamenić",0],["NZL16","New Zealand","Ben Old",0],["NZL17","New Zealand","Chris Wood",0],["NZL18","New Zealand","Elijah Just",0],["NZL19","New Zealand","Callum McCowatt",0],["NZL20","New Zealand","Kosta Barbarouses",0],["ESP1","Spain","Team Logo",1],["ESP2","Spain","Unai Simon",0],["ESP3","Spain","Robin Le Normand",0],["ESP4","Spain","Aymeric Laporte",0],["ESP5","Spain","Dean Huijsen",0],["ESP6","Spain","Pedro Porro",0],["ESP7","Spain","Dani Carvajal",0],["ESP8","Spain","Marc Cucurella",0],["ESP9","Spain","Martín Zubimendi",0],["ESP10","Spain","Rodri",0],["ESP11","Spain","Pedri",0],["ESP12","Spain","Fabian Ruiz",0],["ESP13","Spain","Team Photo",0],["ESP14","Spain","Mikel Merino",0],["ESP15","Spain","Lamine Yamal",0],["ESP16","Spain","Dani Olmo",0],["ESP17","Spain","Nico Williams",0],["ESP18","Spain","Ferran Torres",0],["ESP19","Spain","Álvaro Morata",0],["ESP20","Spain","Mikel Oyarzabal",0],["CPV1","Cape Verde","Team Logo",1],["CPV2","Cape Verde","Vozinha",0],["CPV3","Cape Verde","Logan Costa",0],["CPV4","Cape Verde","Pico",0],["CPV5","Cape Verde","Diney",0],["CPV6","Cape Verde","Steven Moreira",0],["CPV7","Cape Verde","Wagner Pina",0],["CPV8","Cape Verde","Joao Paulo",0],["CPV9","Cape Verde","Yannick Semedo",0],["CPV10","Cape Verde","Kevin Pina",0],["CPV11","Cape Verde","Patrick Andrade",0],["CPV12","Cape Verde","Jamiro Monteiro",0],["CPV13","Cape Verde","Team Photo",0],["CPV14","Cape Verde","Deroy Duarte",0],["CPV15","Cape Verde","Garry Rodrigues",0],["CPV16","Cape Verde","Jovane Cabral",0],["CPV17","Cape Verde","Ryan Mendes",0],["CPV18","Cape Verde","Dailon Livramento",0],["CPV19","Cape Verde","Willy Semedo",0],["CPV20","Cape Verde","Bebe",0],["KSA1","Saudi Arabia","Team Logo",1],["KSA2","Saudi Arabia","Nawaf Alaqidi",0],["KSA3","Saudi Arabia","Abdulrahman Al-Sanbi",0],["KSA4","Saudi Arabia","Saud Abdulhamid",0],["KSA5","Saudi Arabia","Nawaf Bouwashl",0],["KSA6","Saudi Arabia","Jihad Thakri",0],["KSA7","Saudi Arabia","Moteb Al-Harbi",0],["KSA8","Saudi Arabia","Hassan Altambakti",0],["KSA9","Saudi Arabia","Musab Aljuwayr",0],["KSA10","Saudi Arabia","Ziyad Aljohani",0],["KSA11","Saudi Arabia","Abdullah Alkhaibari",0],["KAS12","Saudi Arabia","Nasser Aldawsari",0],["KSA13","Saudi Arabia","Team Photo",0],["KSA14","Saudi Arabia","Saleh Abu Alshamat",0],["KSA15","Saudi Arabia","Marwan Alsahafi",0],["KSA16","Saudi Arabia","Salem Aldawsari",0],["KSA17","Saudi Arabia","Abdulrahman Al-Aboud",0],["KSA18","Saudi Arabia","Feras Akbrikan",0],["KSA19","Saudi Arabia","Saleh Alshehri",0],["KSA20","Saudi Arabia","Abdullah Al-Hamdan",0],["URU1","Uruguay","Team Logo",1],["URU2","Uruguay","Sergio Rochet",0],["URU3","Uruguay","Santiago Mele",0],["URU4","Uruguay","Ronald Araujo",0],["URU5","Uruguay","José María Giménez",0],["URU6","Uruguay","Sebastian Caceres",0],["URU7","Uruguay","Mathias Olivera",0],["URU8","Uruguay","Guillermo Varela",0],["URU9","Uruguay","Nahitan Nandez",0],["URU10","Uruguay","Federico Valverde",0],["URU11","Uruguay","Giorgian De Arrascaeta",0],["URU12","Uruguay","Rodrigo Bentancur",0],["URU13","Uruguay","Team Photo",0],["URU14","Uruguay","Manuel Ugarte",0],["URU15","Uruguay","Nicolás de la Cruz",0],["URU16","Uruguay","Maxi Araujo",0],["URU17","Uruguay","Darwin Núñez",0],["URU18","Uruguay","Federico Viñas",0],["URU19","Uruguay","Rodrigo Aguirre",0],["URU20","Uruguay","Facundo Pellistri",0],["FRA1","France","Team Logo",1],["FRA2","France","Mike Maignan",0],["FRA3","France","Theo Hernandez",0],["FRA4","France","William Saliba",0],["FRA5","France","Jules Kounde",0],["FRA6","France","Ibrahima Konate",0],["FRA7","France","Dayot Upamecano",0],["FRA8","France","Lucas Digne",0],["FRA9","France","Aurélien Tchouaméni",0],["FRA10","France","Eduardo Camavinga",0],["FRA11","France","Manu Kone",0],["FRA12","France","Adrien Rabiot",0],["FRA13","France","Team Photo",0],["FRA14","France","Michael Olise",0],["FRA15","France","Ousmane Dembele",0],["FRA16","France","Bradley Barcola",0],["FRA17","France","Désiré Doué",0],["FRA18","France","Kingsley Coman",0],["FRA19","France","Hugo Ekitike",0],["FRA20","France","Kylian Mbappe",0],["SEN1","Senegal","Team Logo",1],["SEN2","Senegal","Edouard Mendy",0],["SEN3","Senegal","Yehvann Diouf",0],["SEN4","Senegal","Moussa Niakhaté",0],["SEN5","Senegal","Abdoulaye Seck",0],["SEN6","Senegal","Ismail Jakobs",0],["SEN7","Senegal","El Hadji Malick Diouf",0],["SEN8","Senegal","Kalidou Koulibaly",0],["SEN9","Senegal","Idrissa Gana Gueye",0],["SEN10","Senegal","Pape Matar Sarr",0],["SEN11","Senegal","Pape Gueye",0],["SEN12","Senegal","Habib Diarra",0],["SEN13","Senegal","Team Photo",0],["SEN14","Senegal","Lamine Camara",0],["SEN15","Senegal","Sadio Mane",0],["SEN16","Senegal","Ismaïla Sarr",0],["SEN17","Senegal","Boulaye Dia",0],["SEN18","Senegal","Iliman Ndiaye",0],["SEN19","Senegal","Nicolas Jackson",0],["SEN20","Senegal","Krepin Diatta",0],["IRQ1","Iraq","Team Logo",1],["IRQ2","Iraq","Jalal Hassan",0],["IRQ3","Iraq","Rebin Sulaka",0],["IRQ4","Iraq","Hussein Ali",0],["IRQ5","Iraq","Akam Hashem",0],["IRQ6","Iraq","Merchas Doski",0],["IRQ7","Iraq","Zaid Tahseen",0],["IRQ8","Iraq","Manaf Younis",0],["IRQ9","Iraq","Zidane Iqbal",0],["IRQ10","Iraq","Amir Al-Ammari",0],["IRQ11","Iraq","Ibrahim Bavesh",0],["IRQ12","Iraq","Ali Jasim",0],["IRQ13","Iraq","Team Photo",0],["IRQ14","Iraq","Youssef Amyn",0],["IRQ15","Iraq","Aimar Sher",0],["IRQ16","Iraq","Marko Farji",0],["IRQ17","Iraq","Osama Rashid",0],["IRQ18","Iraq","Ali Al-Hamadi",0],["IRQ19","Iraq","Aymen Hussein",0],["IRQ20","Iraq","Mohanad Ali",0],["NOR1","Norway","Team Logo",1],["NOR2","Norway","Orjan Nyland",0],["NOR3","Norway","Julian Ryerson",0],["NOR4","Norway","Leo Ostigård",0],["NOR5","Norway","Kristoffer Vassbakk Ajer",0],["NOR6","Norway","Marcus Holmgren Pedersen",0],["NOR7","Norway","David Møller Wolfe",0],["NOR8","Norway","Torbjørn Heggem",0],["NOR9","Norway","Morten Thorsby",0],["NOR10","Norway","Martin Ødegaard",0],["NOR11","Norway","Sander Berge",0],["NOR12","Norway","Andreas Schjelderup",0],["NOR13","Norway","Team Photo",0],["NOR14","Norway","Patrick Berg",0],["NOR15","Norway","Erling Haaland",0],["NOR16","Norway","Alexander Sørloth",0],["NOR17","Norway","Aron Dønnum",0],["NOR18","Norway","Jorgen Strand Larsen",0],["NOR19","Norway","Antonio Nusa",0],["NOR20","Norway","Oscar Bobb",0],["ARG1","Argentina","Team Logo",1],["ARG2","Argentina","Emiliano Martinez",0],["ARG3","Argentina","Nahuel Molina",0],["ARG4","Argentina","Cristian Romero",0],["ARG5","Argentina","Nicolas Otamendi",0],["ARG6","Argentina","Nicolas Tagliafico",0],["ARG7","Argentina","Leonardo Balerdi",0],["ARG8","Argentina","Enzo Fernandez",0],["ARG9","Argentina","Alexis Mac Allister",0],["ARG10","Argentina","Rodrigo De Paul",0],["ARG11","Argentina","Exequiel Palacios",0],["ARG12","Argentina","Leandro Paredes",0],["ARG13","Argentina","Team Photo",0],["ARG14","Argentina","Nico Paz",0],["ARG15","Argentina","Franco Mastantuono",0],["ARG16","Argentina","Nico Gonzalez",0],["ARG17","Argentina","Lionel Messi",0],["ARG18","Argentina","Lautaro Martinez",0],["ARG19","Argentina","Julian Alvarez",0],["ARG20","Argentina","Giuliano Simeone",0],["ALG1","Algeria","Team Logo",1],["ALG2","Algeria","Alexis Guendouz",0],["ALG3","Algeria","Ramy Bensebaini",0],["ALG4","Algeria","Youcef Atal",0],["ALG5","Algeria","Rayan Aït-Nouri",0],["ALG6","Algeria","Mohamed Amine Tougai",0],["ALG7","Algeria","Aïssa Mandi",0],["ALG8","Algeria","Ismael Bennacer",0],["ALG9","Algeria","Houssem Aquar",0],["ALG10","Algeria","Hicham Boudaoui",0],["ALG11","Algeria","Ramiz Zerrouki",0],["ALG12","Algeria","Nabil Bentalab",0],["ALG13","Algeria","Team Photo",0],["ALG14","Algeria","Farés Chaibi",0],["ALG15","Algeria","Riyad Mahrez",0],["ALG16","Algeria","Said Benrahma",0],["ALG17","Algeria","Anis Hadj Moussa",0],["ALG18","Algeria","Amine Gouiri",0],["ALG19","Algeria","Baghdad Bounedjah",0],["ALG20","Algeria","Mohammed Amoura",0],["AUT1","Austria","Team Logo",1],["AUT2","Austria","Alexander Schlager",0],["AUT3","Austria","Patrick Pentz",0],["AUT4","Austria","David Alaba",0],["AUT5","Austria","Kevin Danso",0],["AUT6","Austria","Philipp Lienhart",0],["AUT7","Austria","Stefan Posch",0],["AUT8","Austria","Phillipp Mwene",0],["AUT9","Austria","Alexander Prass",0],["AUT10","Austria","Xaver Schlager",0],["AUT11","Austria","Marcel Sabitzer",0],["AUT12","Austria","Konrad Laimer",0],["AUT13","Austria","Team Photo",0],["AUT14","Austria","Florian Grillitsch",0],["AUT15","Austria","Nicolas Seiwald",0],["AUT16","Austria","Romano Schmid",0],["AUT17","Austria","Patrick Wimmer",0],["AUT18","Austria","Christoph Baumgartner",0],["AUT19","Austria","Michael Gregoritsch",0],["AUT20","Austria","Marko Arnautović",0],["JOR1","Jordan","Team Logo",1],["JOR2","Jordan","Yazeed Abulaila",0],["JOR3","Jordan","Ihsan Haddad",0],["JOR4","Jordan","Mohammad Abu Hashish",0],["JOR5","Jordan","Yazan Al-Arab",0],["JOR6","Jordan","Abdallah Nasib",0],["JOR7","Jordan","Saleem Obaid",0],["JOR8","Jordan","Mohammad Abualnadi",0],["JOR9","Jordan","Ibrahim Saadeh",0],["JOR10","Jordan","Nizar Al-Rashdan",0],["JOR11","Jordan","Noor Al-Rawabdeh",0],["JOR12","Jordan","Mohannad Abu Taha",0],["JOR13","Jordan","Team Photo",0],["JOR14","Jordan","Amer Jamous",0],["JOR15","Jordan","Musa Al-Taamari",0],["JOR16","Jordan","Yazan Al-Naimat",0],["JOR17","Jordan","Mahmoud Al-Mardi",0],["JOR18","Jordan","Ali Olwan",0],["JOR19","Jordan","Mohammad Abu Zrayq",0],["JOR20","Jordan","Ibrahim Sabra",0],["POR1","Portugal","Team Logo",1],["POR2","Portugal","Diogo Costa",0],["POR3","Portugal","Jose Sa",0],["POR4","Portugal","Ruben Dias",0],["POR5","Portugal","João Cancelo",0],["POR6","Portugal","Diogo Dalot",0],["POR7","Portugal","Nuno Mendes",0],["POR8","Portugal","Gonçalo Inácio",0],["POR9","Portugal","Bernardo Silva",0],["POR10","Portugal","Bruno Fernandes",0],["POR11","Portugal","Ruben Neves",0],["POR12","Portugal","Vitinha",0],["POR13","Portugal","Team Photo",0],["POR14","Portugal","João Neves",0],["POR15","Portugal","Cristiano Ronaldo",0],["POR16","Portugal","Francisco Trincao",0],["POR17","Portugal","João Felix",0],["POR18","Portugal","Gonçalo Ramos",0],["POR19","Portugal","Pedro Neto",0],["POR20","Portugal","Rafael Leão",0],["COD1","Congo DR","Team Logo",1],["COD2","Congo DR","Lionel Mpasi",0],["COD3","Congo DR","Aaron Wan-Bissaka",0],["COD4","Congo DR","Axel Tuanzebe",0],["COD5","Congo DR","Arthur Masuaku",0],["COD6","Congo DR","Chancel Mbemba",0],["COD7","Congo DR","Joris Kayembe",0],["COD8","Congo DR","Charles Pickel",0],["COD9","Congo DR","Ngal'ayel Mukau",0],["COD10","Congo DR","Edo Kayembe",0],["COD11","Congo DR","Samuel Moutoussamy",0],["COD12","Congo DR","Noah Sadiki",0],["COD13","Congo DR","Team Photo",0],["COD14","Congo DR","Théo Bongonda",0],["COD15","Congo DR","Meschak Elia",0],["COD16","Congo DR","Yoane Wissa",0],["COD17","Congo DR","Brian Cipenga",0],["COD18","Congo DR","Fiston Mayele",0],["COD19","Congo DR","Cédric Bakambu",0],["COD20","Congo DR","Nathanaël Mbuku",0],["UZB1","Uzbekistan","Team Logo",1],["UZB2","Uzbekistan","Utkir Yusupov",0],["UZB3","Uzbekistan","Farrukh Savfiev",0],["UZB4","Uzbekistan","Sherzod Nasrullaev",0],["UZB5","Uzbekistan","Umar Eshmurodov",0],["UZB6","Uzbekistan","Husniddin Aliqulov",0],["UZB7","Uzbekistan","Rustamjon Ashurmatov",0],["UZB8","Uzbekistan","Khojiakbar Alijonov",0],["UZB9","Uzbekistan","Abdukodir Khusanov",0],["UZB10","Uzbekistan","Odiljon Hamrobekov",0],["UZB11","Uzbekistan","Otabek Shukurov",0],["UZB12","Uzbekistan","Jamshid Iskanderov",0],["UZB13","Uzbekistan","Team Photo",0],["UZB14","Uzbekistan","Azizbek Turgunboev",0],["UZB15","Uzbekistan","Khojimat Erkinov",0],["UZB16","Uzbekistan","Eldor Shomurodov",0],["UZB17","Uzbekistan","Oston Urunov",0],["UZB18","Uzbekistan","Jaloliddin Masharipov",0],["UZB19","Uzbekistan","Igor Sergeev",0],["UZB20","Uzbekistan","Abbosbek Fayzullaev",0],["COL1","Colombia","Team Logo",1],["COL2","Colombia","Camilo Vargas",0],["COL3","Colombia","David Ospina",0],["COL4","Colombia","Dávinson Sánchez",0],["COL5","Colombia","Yerry Mina",0],["COL6","Colombia","Daniel Munoz",0],["COL7","Colombia","Johan Mojica",0],["COL8","Colombia","Jhon Lucumí",0],["COL9","Colombia","Santiago Arias",0],["COL10","Colombia","Jefferson Lerma",0],["COL11","Colombia","Kevin Castaño",0],["COL12","Colombia","Richard Rios",0],["COL13","Colombia","Team Photo",0],["COL14","Colombia","James Rodriguez",0],["COL15","Colombia","Juan Fernando Quintero",0],["COL16","Colombia","Jorge Carrascal",0],["COL17","Colombia","Jon Arias",0],["COL18","Colombia","Jhon Cordova",0],["COL19","Colombia","Luis Suarez",0],["COL20","Colombia","Luis Diaz",0],["ENG1","England","Team Logo",1],["ENG2","England","Jordan Pickford",0],["ENG3","England","John Stones",0],["ENG4","England","Marc Guéhi",0],["ENG5","England","Ezri Konsa",0],["ENG6","England","Trent Alexander-Arnold",0],["ENG7","England","Reece James",0],["ENG8","England","Dan Burn",0],["ENG9","England","Jordan Henderson",0],["ENG10","England","Declan Rice",0],["ENG11","England","Jude Bellingham",0],["ENG12","England","Cole Palmer",0],["ENG13","England","Team Photo",0],["ENG14","England","Morgan Rogers",0],["ENG15","England","Anthony Gordon",0],["ENG16","England","Phil Foden",0],["ENG17","England","Bukayo Saka",0],["ENG18","England","Harry Kane",0],["ENG19","England","Marcus Rashford",0],["ENG20","England","Ollie Watkins",0],["CRO1","Croatia","Team Logo",1],["CRO2","Croatia","Dominik Livaković",0],["CRO3","Croatia","Duje Caleta-Car",0],["CRO4","Croatia","Josko Gvardiol",0],["CRO5","Croatia","Josip Stanišić",0],["CRO6","Croatia","Luka Vušković",0],["CRO7","Croatia","Josip Sutalo",0],["CRO8","Croatia","Kristijan Jakic",0],["CRO9","Croatia","Luka Modrić",0],["CRO10","Croatia","Mateo Kovacic",0],["CRO11","Croatia","Martin Baturina",0],["CRO12","Croatia","Lovro Majer",0],["CRO13","Croatia","Team Photo",0],["CRO14","Croatia","Mario Pasalic",0],["CRO15","Croatia","Petar Sucic",0],["CRO16","Croatia","Ivan Perišić",0],["CRO17","Croatia","Marco Pasalic",0],["CRO18","Croatia","Ante Budimir",0],["CRO19","Croatia","Andrej Kramarić",0],["CRO20","Croatia","Franjo Ivanovic",0],["GHA1","Ghana","Team Logo",1],["GHA2","Ghana","Lawrence Ati Zigi",0],["GHA3","Ghana","Tariq Lamptey",0],["GHA4","Ghana","Mohammed Salisu",0],["GHA5","Ghana","Alidu Seidu",0],["GHA6","Ghana","Alexander Djiku",0],["GHA7","Ghana","Gideon Mensah",0],["GHA8","Ghana","Caleb Yirenkyi",0],["GHA9","Ghana","Abdul Issahaku Fatawu",0],["GHA10","Ghana","Thomas Partey",0],["GHA11","Ghana","Salis Abdul Samed",0],["GHA12","Ghana","Kamaldeen Sulemana",0],["GHA13","Ghana","Team Photo",0],["GHA14","Ghana","Mohammed Kudus",0],["GHA15","Ghana","Inaki Williams",0],["GHA16","Ghana","Jordan Ayew",0],["GHA17","Ghana","Andrew Ayew",0],["GHA18","Ghana","Joseph Paintsil",0],["GHA19","Ghana","Osman Bukari",0],["GHA20","Ghana","Antoine Semenyo",0],["PAN1","Panama","Team Logo",1],["PAN2","Panama","Orlando Mosquera",0],["PAN3","Panama","Luis Mejia",0],["PAN4","Panama","Fidel Escobar",0],["PAN5","Panama","Andres Andrade",0],["PAN6","Panama","Michael Amir Murillo",0],["PAN7","Panama","Eric Davis",0],["PAN8","Panama","Jose Cordoba",0],["PAN9","Panama","Cesar Blackman",0],["PAN10","Panama","Cristian Martinez",0],["PAN11","Panama","Aníbal Godoy",0],["PAN12","Panama","Adalberto Carrasquilla",0],["PAN13","Panama","Team Photo",0],["PAN14","Panama","Édgar Bárcenas",0],["PAN15","Panama","Carlos Harvey",0],["PAN16","Panama","Ismael Díaz",0],["PAN17","Panama","Jose Fajardo",0],["PAN18","Panama","Cecilio Waterman",0],["PAN19","Panama","Jose Luiz Rodriguez",0],["PAN20","Panama","Alberto Quintero",0],["FWC9","FIFA Museum","Italy 1934",1],["FWC10","FIFA Museum","Uruguay 1950",1],["FWC11","FIFA Museum","West Germany 1954",1],["FWC12","FIFA Museum","Brazil 1962",1],["FWC13","FIFA Museum","West Germany 1974",1],["FWC14","FIFA Museum","Argentina 1986",1],["FWC15","FIFA Museum","Brazil 1994",1],["FWC16","FIFA Museum","Brazil 2002",1],["FWC17","FIFA Museum","Italy 2006",1],["FWC18","FIFA Museum","Germany 2014",1],["FWC19","FIFA Museum","Argentina 2022",1]];
const OFFICIAL_NUMBERS = new Set(CHECKLIST_2026_NA.map((row) => row[0]));

function naturalCompare(a, b) {
  const numA = parseInt((a.match(/(\d+)$/) || [0, 0])[1], 10);
  const numB = parseInt((b.match(/(\d+)$/) || [0, 0])[1], 10);
  if (numA !== numB) return numA - numB;
  return a.localeCompare(b);
}

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function StickerTracker() {
  const [stickers, setStickers] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all"); // all | missing | dupes | trade
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ number: "", team: "", player: "" });
  const [collapsed, setCollapsed] = useState({});
  const [parallelFor, setParallelFor] = useState(null); // sticker number, or null
  const [confirmLoad, setConfirmLoad] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // sticker number pending delete confirmation
  const [undo, setUndo] = useState(null); // { label, restore }
  const [showBackup, setShowBackup] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const saveTimeout = useRef(null);
  const undoTimer = useRef(null);

  function triggerUndo(label, restore) {
    clearTimeout(undoTimer.current);
    setUndo({ label, restore });
    undoTimer.current = setTimeout(() => setUndo(null), 5000);
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wc2026-stickers");
      if (raw) setStickers(JSON.parse(raw));
    } catch (e) {
      // no existing collection yet
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem("wc2026-stickers", JSON.stringify(stickers));
      } catch (e) {
        console.error("save failed", e);
      }
    }, 400);
  }, [stickers, loaded]);

  const list = useMemo(() => Object.values(stickers), [stickers]);

  const tradeList = useMemo(() => {
    const parallelItems = [];
    const dupeItems = [];
    for (const s of list) {
      const parallels = s.parallels || {};
      for (const key of Object.keys(parallels)) {
        const count = parallels[key];
        if (count > 0) {
          const meta = PARALLEL_BY_KEY[key];
          parallelItems.push({ ...s, kind: "parallel", colorKey: key, colorLabel: meta ? meta.label : key, colorHex: meta ? meta.color : "#999", rarity: meta ? meta.rarity : 0, count });
        }
      }
      if (s.owned > 1) {
        dupeItems.push({ ...s, kind: "base", count: s.owned - 1, rarity: 0 });
      }
    }
    parallelItems.sort((a, b) => a.rarity - b.rarity || naturalCompare(a.number, b.number));
    dupeItems.sort((a, b) => naturalCompare(a.number, b.number));
    return [...dupeItems, ...parallelItems];
  }, [list]);

  function copyTradeList() {
    const lines = tradeList.map((item) =>
      item.kind === "parallel"
        ? `#${item.number} ${item.player} (${item.team}) — ${item.colorLabel}${item.count > 1 ? ` x${item.count}` : ""}`
        : `#${item.number} ${item.player} (${item.team}) — base x${item.count}`
    );
    const text = lines.length ? lines.join("\n") : "No dupes or parallels to trade yet.";
    navigator.clipboard.writeText(text).then(
      () => { setCopyStatus("Trade list copied!"); setTimeout(() => setCopyStatus(""), 3000); },
      () => { setCopyStatus("Couldn't copy — try again."); setTimeout(() => setCopyStatus(""), 3000); }
    );
  }

  const totals = useMemo(() => {
    const total = list.length;
    const owned = list.filter((s) => s.owned > 0).length;
    const dupes = list.reduce((sum, s) => sum + Math.max(0, s.owned - 1), 0);
    const parallels = list.reduce((sum, s) => sum + Object.values(s.parallels || {}).reduce((a, b) => a + (b || 0), 0), 0);
    return { total, owned, dupes, parallels, pct: total ? Math.round((owned / total) * 100) : 0 };
  }, [list]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((s) => {
      if (tab === "missing" && s.owned > 0) return false;
      if (tab === "dupes" && s.owned <= 1) return false;
      if (!q) return true;
      return (
        s.number.toLowerCase().includes(q) ||
        s.team.toLowerCase().includes(q) ||
        s.player.toLowerCase().includes(q)
      );
    });
  }, [list, query, tab]);

  const grouped = useMemo(() => {
    const teamGroups = {};
    const teamToSuper = {};
    for (const s of filtered) {
      const superKey = TEAM_TO_GROUP[s.team] || "Tournament";
      const teamKey = superKey === "Tournament" ? "Tournament" : (s.team || "Unsorted");
      if (!teamGroups[teamKey]) teamGroups[teamKey] = [];
      teamGroups[teamKey].push(s);
      teamToSuper[teamKey] = superKey;
    }
    for (const k of Object.keys(teamGroups)) {
      teamGroups[k].sort((a, b) => naturalCompare(a.number, b.number));
    }

    const superGroups = {};
    for (const [team, items] of Object.entries(teamGroups)) {
      const g = teamToSuper[team];
      if (!superGroups[g]) superGroups[g] = [];
      superGroups[g].push([team, items]);
    }
    for (const g of Object.keys(superGroups)) {
      superGroups[g].sort((a, b) => a[0].localeCompare(b[0]));
    }

    return GROUP_ORDER.filter((g) => superGroups[g]).map((g) => [g, superGroups[g]]);
  }, [filtered]);

  function toggleOwned(number) {
    // Tapping only ever marks a sticker as owned; it never zeroes out
    // an existing count. Use the minus button to remove copies.
    setStickers((prev) => {
      const cur = prev[number];
      if (cur.owned > 0) return prev;
      return { ...prev, [number]: { ...cur, owned: 1 } };
    });
  }

  function bumpParallel(number, colorKey, delta) {
    setStickers((prev) => {
      const cur = prev[number];
      const parallels = { ...(cur.parallels || {}) };
      const next = Math.max(0, (parallels[colorKey] || 0) + delta);
      if (next === 0) {
        delete parallels[colorKey];
      } else {
        parallels[colorKey] = next;
      }
      return { ...prev, [number]: { ...cur, parallels } };
    });
  }

  function loadOfficialChecklist() {
    setStickers((prev) => {
      const next = { ...prev };
      for (const [number, team, player, foil] of CHECKLIST_2026_NA) {
        if (next[number]) {
          next[number] = { ...next[number], team, player, foil: !!foil };
        } else {
          next[number] = { number, team, player, foil: !!foil, owned: 0, parallels: {} };
        }
      }
      return next;
    });
    setConfirmLoad(false);
  }

  function bumpDupe(number, delta) {
    const cur = stickers[number];
    const nextOwned = Math.max(0, cur.owned + delta);
    setStickers((prev) => ({ ...prev, [number]: { ...prev[number], owned: nextOwned } }));
    // Going from 1 copy to 0 fully un-marks the sticker as owned — offer a quick undo.
    if (cur.owned === 1 && nextOwned === 0) {
      const snapshot = cur;
      triggerUndo(`Unmarked #${number}`, () => {
        setStickers((prev) => ({ ...prev, [number]: snapshot }));
      });
    }
  }

  function addSticker(e) {
    e.preventDefault();
    const number = form.number.trim();
    if (!number) return;
    setStickers((prev) => ({
      ...prev,
      [number]: {
        number,
        team: form.team.trim() || "Unsorted",
        player: form.player.trim(),
        owned: 0,
        parallels: {},
      },
    }));
    setForm({ number: "", team: "", player: "" });
    setShowAdd(false);
  }

  function resetSticker(number) {
    const snapshot = stickers[number];
    setStickers((prev) => ({ ...prev, [number]: { ...prev[number], owned: 0, parallels: {} } }));
    triggerUndo(`Reset #${number}`, () => {
      setStickers((prev) => ({ ...prev, [number]: snapshot }));
    });
  }

  function removeSticker(number) {
    const snapshot = stickers[number];
    setStickers((prev) => {
      const next = { ...prev };
      delete next[number];
      return next;
    });
    setConfirmDelete(null);
    triggerUndo(`Deleted #${number}`, () => {
      setStickers((prev) => ({ ...prev, [number]: snapshot }));
    });
  }

  function exportBackup() {
    return JSON.stringify(stickers);
  }

  async function copyBackup() {
    const text = exportBackup();
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied!");
    } catch (e) {
      setCopyStatus("Couldn't copy — select and copy the text below manually.");
    }
    setTimeout(() => setCopyStatus(""), 3000);
  }

  function importBackup() {
    try {
      const parsed = JSON.parse(importText.trim());
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("bad shape");
      }
      // Strip any stale zero/negative parallel entries left over from older versions.
      const cleaned = {};
      for (const [number, s] of Object.entries(parsed)) {
        const parallels = { ...(s.parallels || {}) };
        for (const key of Object.keys(parallels)) {
          if (!parallels[key] || parallels[key] <= 0) delete parallels[key];
        }
        cleaned[number] = { ...s, parallels };
      }
      setStickers(cleaned);
      setImportError("");
      setImportText("");
      setShowBackup(false);
    } catch (e) {
      setImportError("That doesn't look like a valid backup — check you copied the whole thing.");
    }
  }

  if (!loaded) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F2F22" }}>
        <Loader2 className="animate-spin" color="#E7C65C" size={28} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0F2F22", fontFamily: "'Inter', sans-serif", color: "#F4EFE1", paddingBottom: 90 }}>
      <style>{FONT_IMPORT}{`
        .pitch-stripe { background-image: repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 40px, transparent 40px, transparent 80px); }
        .slot { border: 2px dashed rgba(244,239,225,0.28); border-radius: 10px; }
        .glued { background: #FAF7ED; color: #1a1a1a; border-radius: 8px; box-shadow: 0 3px 8px rgba(0,0,0,0.35); transform: rotate(-1deg); }
        .glued:nth-child(even) { transform: rotate(1deg); }
        input::placeholder { color: rgba(244,239,225,0.45); }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      {/* Header */}
      <div className="pitch-stripe" style={{ padding: "20px 16px 14px", position: "sticky", top: 0, background: "#0F2F22", zIndex: 10, borderBottom: "1px solid rgba(244,239,225,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 0.5 }}>
            WORLD CUP <span style={{ color: "#E7C65C" }}>2026</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setShowBackup(true)}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(244,239,225,0.08)", border: "1px solid rgba(244,239,225,0.2)", color: "#F4EFE1", borderRadius: 7, padding: "6px 8px", cursor: "pointer" }}
            >
              <Download size={13} />
            </button>
            <button
              onClick={() => setConfirmLoad(true)}
              style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(231,198,94,0.15)", border: "1px solid rgba(231,198,94,0.4)", color: "#E7C65C", borderRadius: 7, padding: "6px 9px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
            >
              <Sparkles size={12} /> Load checklist
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 8, background: "rgba(244,239,225,0.15)", borderRadius: 999, overflow: "hidden" }}>
            <div style={{ width: `${totals.pct}%`, height: "100%", background: "#E7C65C", transition: "width 0.3s" }} />
          </div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, whiteSpace: "nowrap" }}>
            {totals.owned}/{totals.total} · {totals.pct}%
          </div>
        </div>
        {totals.parallels > 0 && (
          <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 10, marginTop: -6 }}>✦ {totals.parallels} parallel{totals.parallels !== 1 ? "s" : ""} logged</div>
        )}

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 10, top: 10, opacity: 0.5 }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search number, team, player"
              style={{ width: "100%", padding: "9px 10px 9px 32px", borderRadius: 8, border: "1px solid rgba(244,239,225,0.2)", background: "rgba(244,239,225,0.06)", color: "#F4EFE1", fontSize: 14, boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          {[["all", "All"], ["missing", "Need"], ["dupes", `Dupes (${totals.dupes})`], ["trade", `Trade (${tradeList.length})`]].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                flex: 1,
                padding: "8px 3px",
                borderRadius: 8,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                background: tab === key ? "#E7C65C" : "rgba(244,239,225,0.08)",
                color: tab === key ? "#1a1a1a" : "#F4EFE1",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ padding: "14px 16px" }}>
        {list.length === 0 && (
          <div style={{ textAlign: "center", opacity: 0.6, marginTop: 60, fontSize: 14, lineHeight: 1.6 }}>
            No stickers yet.<br />
            Tap "Load checklist" above for the full 2026 set,<br />or + to add one manually.
          </div>
        )}

        {tab === "trade" && list.length > 0 && (
          <div>
            <button
              onClick={copyTradeList}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 0", borderRadius: 8, border: "none", background: "#E7C65C", color: "#1a1a1a", fontWeight: 600, cursor: "pointer", marginBottom: copyStatus ? 6 : 14 }}
            >
              <Download size={13} /> Copy trade list
            </button>
            {copyStatus && <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 14, textAlign: "center" }}>{copyStatus}</div>}

            {tradeList.length === 0 && (
              <div style={{ textAlign: "center", opacity: 0.6, marginTop: 40, fontSize: 14, lineHeight: 1.6 }}>
                Nothing to trade yet.<br />Dupes and parallels will show up here.
              </div>
            )}

            {tradeList.map((item, i) => (
              <div
                key={`${item.number}-${item.kind}-${item.colorKey || "base"}-${i}`}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px",
                  borderRadius: 8, border: item.kind === "parallel" ? `2px solid ${item.colorHex}` : "1px solid rgba(244,239,225,0.15)",
                  background: "rgba(244,239,225,0.05)", marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                  {item.kind === "parallel" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.colorHex, flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      #{item.number} {item.player}
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.6 }}>{item.team}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: item.kind === "parallel" ? item.colorHex : "#F4EFE1" }}>
                    {item.kind === "parallel" ? item.colorLabel.split(" (")[0] : "Base"}
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>x{item.count}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab !== "trade" && grouped.map(([groupLabel, teams]) => {
          const allItems = teams.flatMap(([, items]) => items);
          const groupOwned = allItems.filter((s) => s.owned > 0).length;
          const groupKey = `grp-${groupLabel}`;
          const groupCollapsed = collapsed[groupKey];
          return (
            <div key={groupLabel} style={{ marginBottom: 18 }}>
              <button
                onClick={() => setCollapsed((c) => ({ ...c, [groupKey]: !c[groupKey] }))}
                style={{ display: "flex", justifyContent: "space-between", width: "100%", background: "rgba(231,198,94,0.1)", border: "1px solid rgba(231,198,94,0.3)", borderRadius: 8, padding: "8px 10px", color: "#E7C65C", cursor: "pointer", marginBottom: 8 }}
              >
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, letterSpacing: 0.5 }}>
                  {groupLabel === "Tournament" ? "TOURNAMENT" : `GROUP ${groupLabel}`}
                </span>
                <span style={{ fontSize: 12, opacity: 0.85 }}>{groupOwned}/{allItems.length} {groupCollapsed ? "▸" : "▾"}</span>
              </button>

              {!groupCollapsed && teams.map(([team, items]) => {
                const teamOwned = items.filter((s) => s.owned > 0).length;
                const teamKey = `team-${team}`;
                const isCollapsed = collapsed[teamKey];
                const skipTeamHeader = team === "Tournament" && teams.length === 1;
                return (
                  <div key={team} style={{ marginBottom: 14, paddingLeft: 4 }}>
                    {!skipTeamHeader && (
                      <button
                        onClick={() => setCollapsed((c) => ({ ...c, [teamKey]: !c[teamKey] }))}
                        style={{ display: "flex", justifyContent: "space-between", width: "100%", background: "none", border: "none", padding: "6px 2px", color: "#F4EFE1", cursor: "pointer" }}
                      >
                        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 15, letterSpacing: 0.5, textTransform: "uppercase" }}>{team}</span>
                        <span style={{ fontSize: 13, opacity: 0.6 }}>{teamOwned}/{items.length} {isCollapsed ? "▸" : "▾"}</span>
                      </button>
                    )}

                    {(!isCollapsed || skipTeamHeader) && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 8 }}>
                        {items.map((s) => (
                    <div
                      key={s.number}
                      className={s.owned > 0 ? "glued" : "slot"}
                      style={{ position: "relative", padding: "10px 6px 8px", minHeight: 74, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}
                    >
                      <button
                        onClick={() => OFFICIAL_NUMBERS.has(s.number) ? resetSticker(s.number) : setConfirmDelete(s.number)}
                        style={{ position: "absolute", top: 2, right: 2, background: "none", border: "none", opacity: 0.35, cursor: "pointer", padding: 2 }}
                      >
                        <X size={11} color={s.owned > 0 ? "#1a1a1a" : "#F4EFE1"} />
                      </button>
                      <button
                        onClick={() => setParallelFor(s.number)}
                        style={{ position: "absolute", top: 2, left: 2, background: "none", border: "none", opacity: 0.4, cursor: "pointer", padding: 2 }}
                      >
                        <Sparkles size={11} color={s.owned > 0 ? "#1a1a1a" : "#F4EFE1"} />
                      </button>
                      <div onClick={() => toggleOwned(s.number)} style={{ cursor: "pointer", width: "100%" }}>
                        <div style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: 16 }}>#{s.number}</div>
                        {s.player && <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2, lineHeight: 1.2 }}>{s.player}</div>}
                      </div>
                      {s.owned > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                          <button onClick={() => bumpDupe(s.number, -1)} style={{ background: "rgba(0,0,0,0.08)", border: "none", borderRadius: 5, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Minus size={11} />
                          </button>
                          <span style={{ fontSize: 11, fontWeight: 600, minWidth: 12, textAlign: "center" }}>{s.owned}</span>
                          <button onClick={() => bumpDupe(s.number, 1)} style={{ background: "rgba(0,0,0,0.08)", border: "none", borderRadius: 5, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                            <Plus size={11} />
                          </button>
                        </div>
                      )}
                      {s.parallels && Object.values(s.parallels).some((v) => v > 0) && (
                        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap", justifyContent: "center" }}>
                          {PARALLELS.filter((p) => s.parallels[p.key] > 0).map((p) => (
                            <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                              <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, border: "1px solid rgba(0,0,0,0.2)" }} />
                              {s.parallels[p.key] > 1 && (
                                <span style={{ fontSize: 8, fontWeight: 700, opacity: 0.75 }}>×{s.parallels[p.key]}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setShowAdd(true)}
        style={{ position: "fixed", bottom: 22, right: 20, width: 52, height: 52, borderRadius: "50%", background: "#E7C65C", border: "none", boxShadow: "0 4px 14px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
      >
        <Plus size={24} color="#1a1a1a" />
      </button>

      {/* Add modal */}
      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", zIndex: 20 }} onClick={() => setShowAdd(false)}>
          <form
            onSubmit={addSticker}
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#183D2C", width: "100%", padding: "20px 18px 28px", borderRadius: "16px 16px 0 0", display: "flex", flexDirection: "column", gap: 10 }}
          >
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, marginBottom: 4 }}>Add sticker</div>
            <input autoFocus placeholder="Number (e.g. 128)" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} style={inputStyle} />
            <input placeholder="Team" value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} style={inputStyle} />
            <input placeholder="Player / badge / etc" value={form.player} onChange={(e) => setForm({ ...form, player: e.target.value })} style={inputStyle} />
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button type="button" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "11px 0", borderRadius: 8, border: "1px solid rgba(244,239,225,0.25)", background: "none", color: "#F4EFE1" }}>Cancel</button>
              <button type="submit" style={{ flex: 2, padding: "11px 0", borderRadius: 8, border: "none", background: "#E7C65C", color: "#1a1a1a", fontWeight: 600 }}>Add</button>
            </div>
          </form>
        </div>
      )}
      {/* Parallel picker modal */}
      {parallelFor && stickers[parallelFor] && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", zIndex: 20 }} onClick={() => setParallelFor(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#183D2C", width: "100%", padding: "20px 18px 28px", borderRadius: "16px 16px 0 0" }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, marginBottom: 2 }}>
              #{parallelFor} parallels
            </div>
            <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 14 }}>
              {stickers[parallelFor].player} · {stickers[parallelFor].team}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PARALLELS.map((p) => {
                const count = (stickers[parallelFor].parallels && stickers[parallelFor].parallels[p.key]) || 0;
                return (
                  <div
                    key={p.key}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px",
                      borderRadius: 8, border: count > 0 ? `2px solid ${p.color}` : "1px solid rgba(244,239,225,0.2)",
                      background: count > 0 ? "rgba(244,239,225,0.06)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#F4EFE1" }}>{p.key}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        onClick={() => bumpParallel(parallelFor, p.key, -1)}
                        style={{ background: "rgba(244,239,225,0.1)", border: "none", borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <Minus size={13} color="#F4EFE1" />
                      </button>
                      <span style={{ fontSize: 14, fontWeight: 700, minWidth: 16, textAlign: "center", color: "#F4EFE1" }}>{count}</span>
                      <button
                        onClick={() => bumpParallel(parallelFor, p.key, 1)}
                        style={{ background: "rgba(244,239,225,0.1)", border: "none", borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      >
                        <Plus size={13} color="#F4EFE1" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setParallelFor(null)} style={{ width: "100%", marginTop: 14, padding: "11px 0", borderRadius: 8, border: "1px solid rgba(244,239,225,0.25)", background: "none", color: "#F4EFE1" }}>Done</button>
          </div>
        </div>
      )}

      {/* Load checklist confirm modal */}
      {confirmLoad && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, padding: 24 }} onClick={() => setConfirmLoad(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#183D2C", borderRadius: 14, padding: 22, maxWidth: 320 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, marginBottom: 8 }}>Load official 2026 checklist?</div>
            <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5, marginBottom: 18 }}>
              Adds all 48 teams and 979 North American base stickers. Anything you've already marked owned stays as-is.
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmLoad(false)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid rgba(244,239,225,0.25)", background: "none", color: "#F4EFE1" }}>Cancel</button>
              <button onClick={loadOfficialChecklist} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "#E7C65C", color: "#1a1a1a", fontWeight: 600 }}>Load it</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete confirm modal */}
      {confirmDelete && stickers[confirmDelete] && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, padding: 24 }} onClick={() => setConfirmDelete(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#183D2C", borderRadius: 14, padding: 22, maxWidth: 320 }}>
            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17, marginBottom: 8 }}>
              Delete #{confirmDelete}?
            </div>
            <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5, marginBottom: 18 }}>
              {stickers[confirmDelete].player} · {stickers[confirmDelete].team}. This is a custom entry, so deleting removes it from your list entirely (not just the official checklist stickers, which reset instead of delete).
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "1px solid rgba(244,239,225,0.25)", background: "none", color: "#F4EFE1" }}>Cancel</button>
              <button onClick={() => removeSticker(confirmDelete)} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: "none", background: "#DC2626", color: "#F4EFE1", fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Undo snackbar */}
      {undo && (
        <div style={{ position: "fixed", bottom: 22, left: 20, right: 86, background: "#1a1a1a", color: "#F4EFE1", borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 4px 14px rgba(0,0,0,0.4)", zIndex: 25 }}>
          <span style={{ fontSize: 13 }}>{undo.label}</span>
          <button
            onClick={() => {
              undo.restore();
              clearTimeout(undoTimer.current);
              setUndo(null);
            }}
            style={{ background: "none", border: "none", color: "#E7C65C", fontWeight: 700, fontSize: 13, cursor: "pointer", flexShrink: 0, marginLeft: 10 }}
          >
            UNDO
          </button>
        </div>
      )}
      {/* Backup / Restore modal */}
      {showBackup && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", zIndex: 20 }} onClick={() => setShowBackup(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#183D2C", width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "20px 18px 28px", borderRadius: "16px 16px 0 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 17 }}>Backup & restore</div>
              <button onClick={() => setShowBackup(false)} style={{ background: "none", border: "none", color: "#F4EFE1", opacity: 0.6, cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
              <Download size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
              Export — copy this text somewhere safe (Notes app, a message to yourself) so you can restore it later.
            </div>
            <button
              onClick={copyBackup}
              style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: "#E7C65C", color: "#1a1a1a", fontWeight: 600, cursor: "pointer", marginBottom: 6 }}
            >
              Copy backup to clipboard
            </button>
            {copyStatus && <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 10 }}>{copyStatus}</div>}
            <textarea
              readOnly
              value={exportBackup()}
              onFocus={(e) => e.target.select()}
              style={{ width: "100%", height: 70, fontSize: 10, fontFamily: "monospace", padding: 8, borderRadius: 8, border: "1px solid rgba(244,239,225,0.2)", background: "rgba(244,239,225,0.05)", color: "#F4EFE1", boxSizing: "border-box", marginBottom: 18, resize: "none" }}
            />

            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
              <Upload size={11} style={{ display: "inline", marginRight: 4, verticalAlign: -1 }} />
              Restore — paste a previously copied backup below. This replaces your current collection.
            </div>
            <textarea
              value={importText}
              onChange={(e) => { setImportText(e.target.value); setImportError(""); }}
              placeholder="Paste backup text here"
              style={{ width: "100%", height: 70, fontSize: 10, fontFamily: "monospace", padding: 8, borderRadius: 8, border: "1px solid rgba(244,239,225,0.2)", background: "rgba(244,239,225,0.05)", color: "#F4EFE1", boxSizing: "border-box", marginBottom: 8 }}
            />
            {importError && <div style={{ fontSize: 12, color: "#F87171", marginBottom: 8 }}>{importError}</div>}
            <button
              onClick={importBackup}
              disabled={!importText.trim()}
              style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "1px solid rgba(244,239,225,0.25)", background: "none", color: "#F4EFE1", cursor: importText.trim() ? "pointer" : "default", opacity: importText.trim() ? 1 : 0.5 }}
            >
              Restore from backup
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

const inputStyle = {
  padding: "11px 12px",
  borderRadius: 8,
  border: "1px solid rgba(244,239,225,0.2)",
  background: "rgba(244,239,225,0.06)",
  color: "#F4EFE1",
  fontSize: 14,
};
