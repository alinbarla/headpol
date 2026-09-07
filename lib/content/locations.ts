import type { ClusterDoc } from "@/lib/content/types";
import { relatedForMunicipality } from "@/lib/content/municipalities";

export const LOCATION_PAGES: ClusterDoc[] = [
  {
    slug: "stralkastarpolering-stockholm",
    kind: "location",
    title: "Strålkastarpolering Stockholm – vi kommer till din adress",
    description: "Mobil strålkastarpolering i Stockholms län. Fast pris 899 kr/par, ingen zonavgift. Vi tar innerstad, villaområden och arbetsplatser. UV-skydd och 12 månaders garanti.",
    h1: "Strålkastarpolering i Stockholms län",
    lead: "Vi är en mobil tjänst, inte en verkstad du lämnar bilen till. Stockholms län betyder innergårdar, villauppfarter, företagsparkeringar och olika restider, inte ett och samma upplägg överallt.",
    locationName: "Stockholm",
    sections: [
      {
        heading: "Täckning i länet",
        paragraphs: [
          "Vi tar adresser i Stockholms stad och kommunerna runt om, ungefär 40 km från centrum. Söderut kör vi bland annat till Huddinge, Botkyrka, Tumba, Södertälje, Salem och Haninge. Österut till Nacka, Tyresö och Värmdö. Norrut till Solna, Sundbyberg, Täby, Sollentuna, Järfälla och vidare mot Upplands Väsby och Sigtuna.",
          "Postnummer 10xxx–19xxx går att boka i kalendern. Norrtälje (76xxx) tar vi inte. Ligger du precis utanför, ring så bedömer vi restiden från fall till fall.",
        ],
      },
      {
        heading: "Så tar vi oss fram",
        paragraphs: [
          "I innerstan styr gatuparkering, garageinfarter och att vi kommer åt båda sidorna av nosen. I villaområden är det uppfarten som avgör. På arbetsplatser bokar vi gärna efter 16 när bilarna ändå står still.",
          "Öppettiderna är lör–sön 08–20 och mån–fre 16–20. Ett jobb tar 45–60 minuter när bilen är framme och torr nog att slipa.",
        ],
      },
      {
        heading: "Samma pris i hela området",
        paragraphs: [
          "899 kr/par för personbil, oavsett om adressen är Södermalm, Södertälje eller Värmdö. Ingen zonavgift och ingen milersättning inom det vi tar. UV-keramiskt skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Utomhusjobb",
        paragraphs: [
          "Vi polerar utomhus. Under tak på en öppen carport går bra. Ett stängt garage där vi inte får plats med slipning och vatten är sämre. Bilen behöver stå still tills skyddet har satt sig. Du kan vänta bredvid.",
        ],
      },
      {
        heading: "Strålkastarrenovering på din adress",
        paragraphs: [
          "I Stockholms län gör vi hela renoveringen där bilen står: maskering, våtslipning, polering och UV-skydd. Innergård, villauppfart eller arbetsplats funkar så länge nosen är fri och vi kan stå kvar ungefär en timme.",
          "Samma 899 kr/par som i resten av området. Ingen zonavgift.",
        ],
        href: "/stralkastarrenovering",
        linkLabel: "Så går en strålkastarrenovering till",
      },
    ],
    faqs: [
      {
        question: "Tar ni hela Stockholms län?",
        answer: "Större delen, ja — inte Norrtälje. Kalendern släpper igenom postnummer 10xxx–19xxx. Osäker? Skriv adressen i bokningen eller ring 076-344 11 68.",
      },
      {
        question: "Fungerar det med gatuparkering i stan?",
        answer: "Ja om vi kommer åt båda strålkastarna och kan stå kvar ungefär en timme. P-skiva eller garageplats ni anvisar under tiden funkar.",
      },
    ],
    related: relatedForMunicipality(
      "Stockholm",
      [
        { slug: "stralkastarpolering", label: "Polera strålkastare" },
        { slug: "stralkastarrenovering", label: "Strålkastarrenovering" },
      ]
    ),
  },
  {
    slug: "stralkastarpolering-solna",
    kind: "location",
    title: "Strålkastarpolering Solna – innerstad, Arenastaden och jobb-P",
    description: "Mobil strålkastarpolering i Solna. Gatuparkering, bostadsrättsgård och arbetsplatser i Arenastaden. Fast pris 899 kr/par, vi kommer till dig.",
    h1: "Strålkastarpolering i Solna",
    lead: "Solna är tätt: gatuparkering, garageinfarter och många som vill att vi tar bilen på jobbet i Arenastaden. Här är platsen det svåra — inte avståndet från city.",
    locationName: "Solna",
    sections: [
      {
        heading: "Hagalund, Råsunda och Bergshamra",
        paragraphs: [
          "Bostadsrätter med gård funkar om ni får en utomhusplats en timme. Gatuparkering längs Råsundavägen kräver att vi kan stå kvar utan att ni får böter mitt i slipningen — använd p-skiva eller er egen ruta. Bergshamra och Tivoli har mer naturmark; undvik att ställa bilen där vi inte får rinna av vatten mot en brunn.",
        ],
      },
      {
        heading: "Arenastaden och kontor",
        paragraphs: [
          "Många bokar efter 16 vid kontoret. Mall of Scandinavia och Friends-området har korttids- och garage-P som sällan är bra arbetsytor. En tjänstebilsplats utomhus på gården, eller hemma i Huvudsta, är bättre. Flera bilar samma kväll: se företagssidan.",
        ],
      },
      {
        heading: "Restid från city",
        paragraphs: [
          "Solna är nära. Vardag 16–17 kan E4/E20 mot Norrtull och Solna pendla. Söndag är nästan alltid enklare. Vi siktar på början av er bokade timme.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par, ingen innerstadsrabatt och inget påslag. Samma som Tumba. UV-skydd och 12 månaders garanti ingår.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kan ni ta bilen på jobbet i Arenastaden?",
        answer: "Ja om det finns en utomhusplats ni får använda en timme. Garageplan utan avrinning säger vi nej till.",
      },
      {
        question: "Ingår Sundbyberg?",
        answer: "Ja — Sundbyberg har egen sida och samma pris. Boka med gatuadress.",
      },
    ],
    related: relatedForMunicipality(
      "Solna",
      [
        { slug: "stralkastarpolering-sundbyberg", label: "Sundbyberg" },
        { slug: "foretagskunder", label: "Företag" },
        { slug: "priser", label: "Priser" },
      ]
    ),
  },
  {
    slug: "stralkastarpolering-sundbyberg",
    kind: "location",
    title: "Strålkastarpolering Sundbyberg – centrum, Ursvik och jobb-P",
    description: "Mobil strålkastarpolering i Sundbyberg. Centrum, Rissne, Ursvik och Storskogen. Fast pris 899 kr/par. Vi kommer till gård, uppfart eller arbetsplats utomhus.",
    h1: "Strålkastarpolering i Sundbyberg",
    lead: "Sundbyberg är tätt och nära Solna: bostadsrättsgårdar, nybygge i Ursvik och många som vill att vi tar bilen vid kontoret. Platsen styr mer än kilometrarna.",
    locationName: "Sundbyberg",
    sections: [
      {
        heading: "Centrum, Rissne och Storskogen",
        paragraphs: [
          "I Sundbybergs centrum är gatuparkering och korttids-P dåliga arbetsytor. Boka hellre föreningens utomhusplats eller en adress i Storskogen eller Duvbo där bilen får stå en timme.",
          "Rissne och Hallonbergen: lamellhus med gård — reservera två rutor så vi kommer åt båda glasen. Garageplan utan avrinning funkar inte för våtslipning.",
        ],
      },
      {
        heading: "Ursvik och Brotorp",
        paragraphs: [
          "Nyare kvarter har ofta garage under huset. Behöver ni bilen ut på gården eller en gästplats utomhus innan vi kommer. Bom och portkod: skriv i bokningen.",
        ],
      },
      {
        heading: "Restid och rusning",
        paragraphs: [
          "Enköpingsvägen och Solna gränsar tätt. Vardag 16–17 kan ta tid; söndag är lugnare. Vi siktar på början av er slot.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par, samma som Solna och Stockholm. Ingen zonavgift. UV-skydd och 12 månaders garanti ingår.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Ursvik?",
        answer: "Ja. Det är Sundbyberg och samma fastpris. Se till att bilen står utomhus.",
      },
      {
        question: "Kan ni stå vid Sundbyberg station?",
        answer: "Nej som arbetsyta — för kort tid och för mycket trafik. Bättre hemma eller på jobbet med egen P.",
      },
    ],
    related: relatedForMunicipality(
      "Sundbyberg",
    ),
  },
  {
    slug: "stralkastarpolering-nacka",
    kind: "location",
    title: "Strålkastarpolering Nacka – Sickla, Älta och Saltsjöbaden",
    description: "Mobil strålkastarpolering i Nacka. Sickla, Forum, Älta, Fisksätra, Saltsjöbaden. Broar och bommar påverkar ankomst. Fast pris 899 kr/par.",
    h1: "Strålkastarpolering i Nacka",
    lead: "Nacka är broar, sjölägen och en blandning av nybygge och villa. Hit tar vi oss — men ankomsten styrs av Värmdöleden, Sickla och om föreningen har bom, inte av ett extra påslag på priset.",
    locationName: "Nacka",
    sections: [
      {
        heading: "Från Sickla till Saltsjöbaden",
        paragraphs: [
          "Sickla och Nacka Forum: mer garage och korttids-P. Boka hellre er egen föreningsplats utomhus eller en villaadress. Älta och Fisksätra är ofta radhus och lamellhus med gård — reservera två rutor så vi kommer åt båda glasen.",
          "Saltsjöbaden och Boo är villa och längre slinga från stan. Söndag är lättare än vardagskväll över Skurubron. Orminge tar vi samma villkor.",
        ],
      },
      {
        heading: "Broar och bommar",
        paragraphs: [
          "Skurubron och Värmdöleden styr klockslaget mer än avståndet i kilometer. Har ni garageport eller bom, mejla kod eller möt upp i början av tiden. Vi kan inte stå i en infart och blockera sopbilen en timme.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen Nacka-avgift. Samma skydd och garanti som i resten av länet.",
        ],
      },
      {
        heading: "Lutning och sjönära uppfarter",
        paragraphs: [
          "Branta uppfarter mot vattnet: ställ bilen så nosen är nåbar utan att hjulen står i en ränna vi inte kan arbeta i. Vintertid behöver isen vara skrapad där vi står. Vi tar inte jobbet på en båtplatsbrygga.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Saltsjöbaden?",
        answer: "Ja. Längre restid, samma pris. Söndag är oftast smidigast.",
      },
      {
        question: "Sickla köpkvarter som mötesplats?",
        answer: "Dålig arbetsyta. Bättre med hemadress eller arbetsplats med egen P utomhus.",
      },
    ],
    related: relatedForMunicipality(
      "Nacka",
    ),
  },
  {
    slug: "stralkastarpolering-taby",
    kind: "location",
    title: "Strålkastarpolering Täby – Täby centrum, Näsbypark och villa",
    description: "Mobil strålkastarpolering i Täby. Villauppfarter i Näsbypark, Ella gård och runt Täby centrum. Fast pris 899 kr/par, ingen zonavgift.",
    h1: "Strålkastarpolering i Täby",
    lead: "Täby är norra länet med mycket villa och radhus. Vi kommer till uppfarten — Galoppfältet, Näsbypark, Viggbyholm — samma pris som i city.",
    locationName: "Täby",
    sections: [
      {
        heading: "Näsbypark, Ella och Erikslund",
        paragraphs: [
          "Vanligast är asfalterad eller grusad uppfart. Näsbypark, Ella gård, Erikslund och Gribbylund funkar samma sak: bilen ute, nosen fri, plats att stå cirka en timme.",
          "Täby centrum och gallerians parkering är sämre arbetsytor (korttid, genomfart). Boka hemadress eller arbetsplats med egen utomhus-P.",
        ],
      },
      {
        heading: "E18 och Roslagsvägen",
        paragraphs: [
          "Infart via E18 eller Roslagsvägen. Rusning norrut efter 16 kan äta tid — söndag är mer förutsägbart. Ange portkod till förening om ni har bom.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen extra avgift för Täby. Skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Väder på villatomt",
        paragraphs: [
          "Öppna lägen mot skogskanter kan vara blåsiga. Slipning går; ösregn och isig uppfart gör vi inte. Skotta runt nosen vintertid.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Viggbyholm och Hägernäs?",
        answer: "Ja, det är Täby kommun. Samma pris. Boka med gatuadress.",
      },
      {
        question: "Går det på Täby galopps parkering?",
        answer: "Bara om ni har en stillastående ruta ni får använda en timme. Enklare hemma.",
      },
    ],
    related: relatedForMunicipality(
      "Täby",
    ),
  },
  {
    slug: "stralkastarpolering-lidingo",
    kind: "location",
    title: "Strålkastarpolering Lidingö – brofäste, villa och sjöläge",
    description: "Mobil strålkastarpolering på Lidingö. Villauppfarter från Baggeby till Gåshaga. Fast pris 899 kr/par. Bron styr ankomsttiden, inte priset.",
    h1: "Strålkastarpolering på Lidingö",
    lead: "Lidingö är bro, villa och sjönära uppfarter. Vi tar hela ön på samma fastpris — men Lidingöbron och rusning påverkar när vi är framme.",
    locationName: "Lidingö",
    sections: [
      {
        heading: "Från Baggeby till Gåshaga",
        paragraphs: [
          "Bodal, Larsberg och Baggeby har mer flerbostadshus — boka en utomhusplats på gården. Näset, Skärsätra och Gåshaga är villa; uppfarten är standard.",
          "Centrum runt Lidingö centrum/Torsvik: undvik korttids-P vid affärer. Hemadress är nästan alltid bättre.",
        ],
      },
      {
        heading: "Lidingöbron",
        paragraphs: [
          "Bron är flaskhals vardag eftermiddag. Söndag dagtid är oftast smidigast. Har ni brant uppfart mot vattnet: ställ bilen så nosen är nåbar utan att hjulen står i en ränna.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen ö-avgift. Samma UV-skydd och garanti som i övriga länet.",
        ],
      },
      {
        heading: "Sjönära tomter",
        paragraphs: [
          "Blåst och saltstänk är vanliga. Vi polerar i blåst; ösregn och is gör vi inte. Vi tar inte jobbet på brygga eller båtplats.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni hela Lidingö?",
        answer: "Ja, från brofästet till Gåshaga. Samma pris. Boka med gatuadress.",
      },
      {
        question: "Kan ni stå vid Lidingö centrum?",
        answer: "Dålig arbetsyta. Bättre med villauppfart eller förenings-P utomhus.",
      },
    ],
    related: relatedForMunicipality(
      "Lidingö",
    ),
  },
  {
    slug: "stralkastarpolering-huddinge",
    kind: "location",
    title: "Strålkastarpolering Huddinge – uppfart och Flemingsberg",
    description: "Mobil strålkastarpolering i Huddinge. Vi kommer till villauppfart, radhus och arbetsplatser längs Huddingevägen. Fast pris 899 kr/par, ingen zonavgift.",
    h1: "Strålkastarpolering i Huddinge",
    lead: "Huddinge är mest villa, radhus och arbetsplatser längs Huddingevägen — inte innerstadens gatuparkering. Vi tar jobbet på din uppfart så länge båda sidorna av nosen är fria.",
    locationName: "Huddinge",
    sections: [
      {
        heading: "Var vi ställer upp",
        paragraphs: [
          "I Huddinge kommun är den vanliga platsen en asfalterad eller grusad uppfart vid villa eller radhus. Flemingsberg, Stuvsta, Snättringe, Segeltorp, Skogås och Trångsund funkar samma sak: bilen ute, plats att stå en timme, vatten får rinna av.",
          "På arbetsplatser kring Huddinge sjukhus och Flemingsberg bokar vi gärna vardag efter 16. Innergård vid hyres- eller bostadsrätt går om ni kan reservera två rutor så vi kommer åt båda glasen.",
        ],
      },
      {
        heading: "Restid söderifrån",
        paragraphs: [
          "Från Stockholm kör vi Huddingevägen eller E4 mot Fittja och av mot kommunen. Söndag dagtid är oftast kortare restid än vardagskväll i rusning. Ni ser den bokade timmen i kalendern — vi siktar på att vara framme i början av slotten.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par, samma som i stan. Ingen extra avgift för Huddinge. MC från 499 kr. Skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Väder och underlag",
        paragraphs: [
          "Våtslipning vill ha plusgrader och inte ösregn på den sida vi arbetar. Lätt duggregn går. Djup snö på uppfarten behöver vara skottad runt nosen. Grusuppfart går bra — vi maskerar lacken och spolar av.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Skogås och Trångsund?",
        answer: "Ja. Det är Huddinge kommun och samma fastpris. Skriv gatuadressen i bokningen.",
      },
      {
        question: "Kan ni stå på en radhusparkering?",
        answer: "Ja om ni får stå kvar cirka en timme och vi kommer åt båda strålkastarna. Meddela portkod eller bommnyckel i meddelandet om det behövs.",
      },
    ],
    related: relatedForMunicipality(
      "Huddinge",
    ),
  },
  {
    slug: "stralkastarpolering-tumba",
    kind: "location",
    title: "Strålkastarpolering Tumba – Botkyrka och villaområden",
    description: "Mobil strålkastarpolering i Tumba och Botkyrka. Villa och radhus längs Hågelbyvägen och Tumba centrum. Fast pris 899 kr/par, vi kommer till dig.",
    h1: "Strålkastarpolering i Tumba",
    lead: "Tumba är Botkyrka: villaområden, radhus och en del arbetsplatser runt centrum — inte Södermalms gator. Vi tar jobbet hemma hos dig om bilen står ute och nosen är fri.",
    locationName: "Tumba",
    sections: [
      {
        heading: "Tumba, Tullinge och resten av Botkyrka",
        paragraphs: [
          "Vanligast är uppfart i Tumba, Tullinge, Storvreten och Rönninge-gränsen mot Salem. Flerfamiljshus vid Tumba centrum går om ni kan peka ut en ruta utomhus där vi står kvar en timme utan att bli blockerade av angöring till ICA eller pendeltåget.",
          "Vi tar också Fittja, Alby och Hallunda när bilen står på en vanlig p-plats eller gård — inte i ett trångt garageplan utan ventilation och vattenavrinning. Mer om hela kommunen finns på Botkyrka-sidan.",
        ],
      },
      {
        heading: "Hitta hit",
        paragraphs: [
          "Från E4/E20 är det avfart mot Tumba/Hågelby eller via Huddinge. Söndag förmiddag är ofta den lugnaste vägen. Ange port, parkeringsnummer eller ‘uppfarten mot gatan’ i adressen så vi inte letar bakom huset.",
        ],
      },
      {
        heading: "Pris och tid",
        paragraphs: [
          "Samma 899 kr/par som i Stockholm. Ingen zonavgift för Botkyrka. Räkna med 45–60 minuter på plats. Öppet lör–sön 08–20, vardagar 16–20.",
        ],
      },
      {
        heading: "Utomhus i söderort",
        paragraphs: [
          "Många uppfarter lutar mot gatan. Vi behöver stå så att vatten från slipningen rinner av, inte in mot garageporten. Flytta soptunnor och barnvagnar från nosen innan vi kommer.",
        ],
      },
    ],
    faqs: [
      {
        question: "Ingår Tullinge?",
        answer: "Ja. Tullinge är samma kommun och samma pris. Boka med gatuadress.",
      },
      {
        question: "Pendeltågsparkering vid Tumba station?",
        answer: "Dålig plats att stå en timme. Bättre med hemmauppfart eller en ruta på gården som ni får använda.",
      },
    ],
    related: relatedForMunicipality(
      "Tumba",
      [
        { slug: "stralkastarpolering-botkyrka", label: "Botkyrka" },
        { slug: "stralkastarpolering", label: "Polera strålkastare" },
      ]
    ),
  },
  {
    slug: "stralkastarpolering-botkyrka",
    kind: "location",
    title: "Strålkastarpolering Botkyrka – Tumba, Tullinge och Fittja",
    description: "Mobil strålkastarpolering i Botkyrka kommun. Tumba, Tullinge, Alby, Fittja och Hallunda. Fast pris 899 kr/par, ingen zonavgift. Vi kommer till din uppfart.",
    h1: "Strålkastarpolering i Botkyrka",
    lead: "Botkyrka sträcker sig från villaområden i Tullinge till mer tätbebyggt i Fittja och Alby. Vi tar hela kommunen på samma villkor: utomhus, fast pris, ingen milersättning.",
    locationName: "Botkyrka",
    sections: [
      {
        heading: "Kommunen från Tullinge till Fittja",
        paragraphs: [
          "Tullinge och Tumba är mest villa och radhus — uppfarten är standardarbetsytan. Storvreten och Grödinge har längre slingor men samma 899 kr. Rönninge-gränsen mot Salem tar vi när postnumret går igenom.",
          "Fittja, Alby och Hallunda funkar när bilen står ute på gård eller p-plats ni får använda en timme. Trånga garageplan utan avrinning säger vi nej till. Mer detalj om Tumba-centrum finns på Tumba-sidan.",
        ],
      },
      {
        heading: "E4/E20 och Hågelby",
        paragraphs: [
          "Vanlig infart är E4/E20 mot Fittja eller avfart Tumba/Hågelby. Vardag 16–18 kan Södertäljevägen ta tid — söndag är mer förutsägbart. Bom och portkod: skriv i bokningen så vi inte bränner halvtimmen vid grinden.",
        ],
      },
      {
        heading: "Pris i hela Botkyrka",
        paragraphs: [
          "899 kr/par oavsett om adressen är Tullinge eller Hallunda. Ingen zonavgift. UV-keramiskt skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Underlag och väder",
        paragraphs: [
          "Grusuppfarter och lutande tomter är vanliga. Vi maskerar lacken och behöver kunna rinna av vatten bort från garageporten. Skotta nosen vintertid.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Tumba och Botkyrka samma sak?",
        answer: "Tumba är en tätort i Botkyrka. Vi har sidor för båda så du hittar oss oavsett hur du söker — samma pris och samma tjänst.",
      },
      {
        question: "Tar ni Grödinge?",
        answer: "Ja om postnumret släpps igenom i bokningen. Skriv gatuadress eller ring om du är osäker.",
      },
    ],
    related: relatedForMunicipality(
      "Botkyrka",
      [
        { slug: "stralkastarpolering-tumba", label: "Tumba" },
        { slug: "stralkastarpolering", label: "Polera strålkastare" },
        { slug: "priser", label: "Priser" },
      ]
    ),
  },
  {
    slug: "stralkastarpolering-sodertalje",
    kind: "location",
    title: "Strålkastarpolering Södertälje – E4/E20 och industri",
    description: "Mobil strålkastarpolering i Södertälje. Villa, radhus och fordonsflottor vid E4/E20. Fast pris 899 kr/par, ingen extra avgift för avståndet.",
    h1: "Strålkastarpolering i Södertälje",
    lead: "Södertälje ligger längre söderut och har mer industri och vagnpark än innerstan. Restiden är längre — priset är detsamma. Vi tar villor, radhus och bilar på företagsgårdar.",
    locationName: "Södertälje",
    sections: [
      {
        heading: "Stad, Pershagen och Järna-hållet",
        paragraphs: [
          "I tätorten är det uppfart eller p-plats vid bostaden som gäller. Pershagen, Östertälje, Geneta och Hovsjö funkar som vanliga bostadsadresser. Mot Järna och Hölö tar vi jobb när adressen fortfarande ligger inom länet och kalendern släpper postnumret.",
          "Scania-området och andra industriadresser passar när flera bilar kan stå ute samma eftermiddag. Då är företagssidan mer relevant än en enskild privatbokning.",
        ],
      },
      {
        heading: "E4 och E20",
        paragraphs: [
          "Vi kommer via E4/E20. Vardag 16–18 kan infarten mot Södertälje Syd och Saltskog ta tid — sön dagtid är mer förutsägbart. Boka en slot med marginal om ni står i ett område med bom som ska öppnas.",
        ],
      },
      {
        heading: "Fast pris trots längre väg",
        paragraphs: [
          "899 kr/par även här. Vi tar inte extra för Södertälje. Tar jobbet längre tid på grund av väder eller att bilen inte är framme, säger vi till — vi påbörjar inte slipning på en blöt nos i ösregn.",
        ],
      },
      {
        heading: "Industrigård kontra villa",
        paragraphs: [
          "På en gårdsplan med lastväxling behöver ni en stillastående ruta, inte en lastzon. Hemma räcker en skottad uppfart. Vatten från slipningen ska kunna rinna av utan att hamna i en verkstadströskel ni vill hålla torr.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Järna?",
        answer: "Ofta ja om postnumret går igenom i bokningen. Osäker — mejla adressen eller ring innan ni betalar.",
      },
      {
        question: "Kan ni göra flera tjänstebilar samma kväll?",
        answer: "Ja. Se företagssidan och mejla antal. Styckpriset blir lägre när restiden bara sker en gång.",
      },
    ],
    related: relatedForMunicipality(
      "Södertälje",
      [
        { slug: "foretagskunder", label: "Företag" },
        { slug: "priser", label: "Priser" },
      ]
    ),
  },
  {
    slug: "stralkastarpolering-haninge",
    kind: "location",
    title: "Strålkastarpolering Haninge – Handen, Vega och Vendelsö",
    description: "Mobil strålkastarpolering i Haninge. Handen, Vega, Vendelsö, Västerhaninge. Fast pris 899 kr/par. Vi kommer till uppfart eller p-plats utomhus.",
    h1: "Strålkastarpolering i Haninge",
    lead: "Haninge är sydost: villor i Vendelsö, nyare områden i Vega, centrum kring Handen och längre mot Västerhaninge. Vi kör dit på samma villkor som resten av länet — utomhus, fast pris, ingen zonavgift.",
    locationName: "Haninge",
    sections: [
      {
        heading: "Kommunen i praktiken",
        paragraphs: [
          "Vendelsö och Brandbergen är mest villa och radhus — uppfarten är standard. Vega och Port 73 har mer parkeringsdäck; då behöver ni en utomhusplats, inte ett slutet garageplan. Handen centrum är sämre som arbetsyta (genomfart, korttids-P) än en bostadsadress en kilometer bort.",
          "Västerhaninge och Tungelsta tar längre tid i bil från stan, särskilt vardag. Söndag är oftast enklare. Jordbro industri passar flottor mer än enstaka privatbilar.",
        ],
      },
      {
        heading: "Nynäsvägen och 73:an",
        paragraphs: [
          "Vanlig infart är väg 73. Rusning söderut efter 16 kan äta restid. Har ni bommnyckel till en förening, skriv det i bokningen så vi inte står vid grinden halva slotten.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par, samma som Solna. Avståndet till Haninge läggs inte på fakturan. Garanti och UV-skydd ingår.",
        ],
      },
      {
        heading: "Kust och väder",
        paragraphs: [
          "Öppnare lägen mot Dalarö-hållet kan vara blåsigare. Slipning går i blåst; ösregn och ishalka på uppfarten gör vi inte. Skotta nosen och ha en hink vatten tillgänglig om ni saknar utomhuskran — vi har eget vatten med oss i begränsad mängd.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Västerhaninge?",
        answer: "Ja, det är Haninge kommun. Samma pris. Boka med gatuadress.",
      },
      {
        question: "Går det på Port 73:s parkering?",
        answer: "Bara om ni har en ruta ni får använda en timme utomhus. Enklare hemma.",
      },
    ],
    related: relatedForMunicipality(
      "Haninge",
    ),
  },
  {
    slug: "stralkastarpolering-jarfalla",
    kind: "location",
    title: "Strålkastarpolering Järfälla – Barkarby, Jakobsberg och Viksjö",
    description: "Mobil strålkastarpolering i Järfälla. Barkarby, Jakobsberg, Viksjö och Kallhäll. Fast pris 899 kr/par. Vi kommer till uppfart eller gårds-P.",
    h1: "Strålkastarpolering i Järfälla",
    lead: "Järfälla blandar nybygge i Barkarby med villa i Viksjö och tätort kring Jakobsberg. Vi tar kommunen utomhus till samma 899 kr/par.",
    locationName: "Järfälla",
    sections: [
      {
        heading: "Barkarby, Jakobsberg och Viksjö",
        paragraphs: [
          "Barkarby handelsområde och nyare kvarter har mycket garage — bilen behöver stå ute. Jakobsberg centrum är sämre som arbetsyta än en bostadsadress i närområdet.",
          "Viksjö, Aspnäs och Kallhäll är ofta villa och radhus. Uppfarten är den vanliga platsen. Reservera plats om föreningen har snål gård.",
        ],
      },
      {
        heading: "E18 och Enköpingsvägen",
        paragraphs: [
          "Infart via E18. Vardagsrusning mot Barkarby kan ta tid. Söndag är lugnare. Portkod och bom: skriv i bokningen.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par i hela Järfälla. Ingen zonavgift. Garanti och UV-skydd ingår.",
        ],
      },
      {
        heading: "Flera bilar på företagsgård",
        paragraphs: [
          "Barkarby och industri nära har flottor som passar företagssidan — mejla antal så planerar vi en runda.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Kallhäll?",
        answer: "Ja. Samma kommun och samma pris.",
      },
      {
        question: "Funkar Barkarby handels-P?",
        answer: "Sällan — korttid och trafik. Bättre hemma eller på en tjänsteplats utomhus.",
      },
    ],
    related: relatedForMunicipality(
      "Järfälla",
      [
        { slug: "foretagskunder", label: "Företag" },
        { slug: "priser", label: "Priser" },
      ]
    ),
  },
  {
    slug: "stralkastarpolering-sollentuna",
    kind: "location",
    title: "Strålkastarpolering Sollentuna – Tureberg, Edsberg och Helenelund",
    description: "Mobil strålkastarpolering i Sollentuna. Tureberg, Edsberg, Helenelund och Sjöberg. Fast pris 899 kr/par, vi kommer till dig.",
    h1: "Strålkastarpolering i Sollentuna",
    lead: "Sollentuna ligger längs E4 norrut: villa i Sjöberg, mer tätort i Tureberg och Edsberg. Vi tar jobbet på uppfart eller gårdsplats utomhus.",
    locationName: "Sollentuna",
    sections: [
      {
        heading: "Tureberg, Edsberg och Helenelund",
        paragraphs: [
          "Tureberg centrum har korttids-P som sällan funkar en timme. Boka hemadress. Edsberg och Helenelund blandar radhus och lamellhus — reservera utomhusplats.",
          "Sjöberg, Häggvik och Viby är ofta villa. Uppfarten är standard. Grus går bra om nosen är fri.",
        ],
      },
      {
        heading: "E4 och Norrortsleden",
        paragraphs: [
          "E4 och anslutningar mot Häggvik styr restiden. Vardag efter 16 kan köa; söndag är enklare.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Samma som Täby och Stockholm. Ingen milersättning inom området.",
        ],
      },
      {
        heading: "Väder",
        paragraphs: [
          "Skuggiga uppfarter torkar långsammare efter regn. Vi väntar hellre till nästa slot än att slipa på blöt plast i ösregn.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Häggvik?",
        answer: "Ja, Sollentuna kommun. Samma pris.",
      },
      {
        question: "Kan ni ta bilen vid kontoret i Tureberg?",
        answer: "Ja om det finns en utomhusplats ni får använda en timme.",
      },
    ],
    related: relatedForMunicipality(
      "Sollentuna",
    ),
  },
  {
    slug: "stralkastarpolering-danderyd",
    kind: "location",
    title: "Strålkastarpolering Danderyd – Djursholm, Stocksund och Enebyberg",
    description: "Mobil strålkastarpolering i Danderyd. Djursholm, Stocksund, Enebyberg och Mörby. Fast pris 899 kr/par. Vi kommer till villauppfarten.",
    h1: "Strålkastarpolering i Danderyd",
    lead: "Danderyd är villa och sjönära tomter mer än centrumparkering. Vi tar Djursholm, Stocksund och Enebyberg på samma fastpris som övriga länet.",
    locationName: "Danderyd",
    sections: [
      {
        heading: "Djursholm, Stocksund och Enebyberg",
        paragraphs: [
          "Uppfarter är ofta långa och ibland branta. Ställ bilen så båda strålkastarna nås utan att vi blockerar grannens utfart. Mörby centrum är sämre arbetsyta än hemadress.",
          "Föreningsgårdar vid radhus: reservera två rutor. Bom och grindkod skrivs i bokningen.",
        ],
      },
      {
        heading: "E18 och Roslagsvägen",
        paragraphs: [
          "Nära city men rusning mot Danderyds sjukhus och Mörby kan påverka. Söndag är oftast smidigast.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen Djursholm-avgift. UV-skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Sjönära och skuggiga tomter",
        paragraphs: [
          "Mossiga och skuggiga uppfarter: skotta och se till att underlaget inte är blankis. Vi arbetar inte på brygga.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Djursholm?",
        answer: "Ja. Det är Danderyd kommun. Samma pris.",
      },
      {
        question: "Går det vid Mörby centrum?",
        answer: "Hellre hemma. Korttids-P räcker sällan en timme.",
      },
    ],
    related: relatedForMunicipality(
      "Danderyd",
    ),
  },
  {
    slug: "stralkastarpolering-ekero",
    kind: "location",
    title: "Strålkastarpolering Ekerö – bro, villa och Mälaröarna",
    description: "Mobil strålkastarpolering på Ekerö. Ekerö centrum, Stenhamra och villaområden. Fast pris 899 kr/par. Bron styr tiden, inte priset.",
    h1: "Strålkastarpolering på Ekerö",
    lead: "Ekerö är Mälaröarna: brofäste, villa och längre slingor. Vi tar adresser i kommunen till samma 899 kr — boka gärna när bron är lugn.",
    locationName: "Ekerö",
    sections: [
      {
        heading: "Ekerö, Stenhamra och villaområden",
        paragraphs: [
          "Vanligast är villauppfart. Ekerö centrum har begränsad långtids-P — hemadress är bättre. Stenhamra och Träkvista funkar samma villkor.",
          "Färjelägen och bryggor är inte arbetsytor. Bilen ska stå på fast mark med avrinning.",
        ],
      },
      {
        heading: "Nockebybron och rusning",
        paragraphs: [
          "Bron mot Stockholm är flaskhals vardag. Söndag eller mitt på dagen är mer förutsägbart. Ange tydlig vägbeskrivning om uppfarten är svår att se från vägen.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen ö-avgift. Samma skydd och garanti.",
        ],
      },
      {
        heading: "Väder på öppna lägen",
        paragraphs: [
          "Blåsiga tomter mot Mälaren går att polera i blåst, inte i ösregn. Skotta nosen vintertid.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Stenhamra?",
        answer: "Ja, Ekerö kommun. Samma pris.",
      },
      {
        question: "Kan ni möta vid färjeläget?",
        answer: "Nej som slipplats. Boka hemadress.",
      },
    ],
    related: relatedForMunicipality(
      "Ekerö",
    ),
  },
  {
    slug: "stralkastarpolering-nykvarn",
    kind: "location",
    title: "Strålkastarpolering Nykvarn – villa och E20-läget",
    description: "Mobil strålkastarpolering i Nykvarn. Villaområden nära E20 mellan Södertälje och länsgränsen. Fast pris 899 kr/par.",
    h1: "Strålkastarpolering i Nykvarn",
    lead: "Nykvarn är en mindre kommun med mycket villa. Restiden från city är längre — priset är detsamma. Vi tar uppfarten när postnumret går igenom.",
    locationName: "Nykvarn",
    sections: [
      {
        heading: "Tätort och villa",
        paragraphs: [
          "Nykvarns tätort och omkringliggande villaområden: uppfart är standard. Se till att bilen står ute och att nosen är fri från soptunnor och cyklar.",
        ],
      },
      {
        heading: "E20-läget",
        paragraphs: [
          "Vi kommer oftast via E20/Södertälje. Vardagsrusning kan påverka; söndag är lugnare. Skriv tydlig adress — en del vägar liknar varandra.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen extra avgift för Nykvarn. Garanti och UV-skydd ingår.",
        ],
      },
      {
        heading: "Underlag",
        paragraphs: [
          "Grus och lutande tomter går bra. Vatten ska kunna rinna av bort från garageporten.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Nykvarn inom området?",
        answer: "Ja om postnumret 10xxx–19xxx går igenom i bokningen. Osäker — ring innan.",
      },
      {
        question: "Kan ni ta flera bilar samma dag?",
        answer: "Ja, mejla antal via företagssidan om det är flotta.",
      },
    ],
    related: relatedForMunicipality(
      "Nykvarn",
      [
        { slug: "foretagskunder", label: "Företag" },
        { slug: "priser", label: "Priser" },
      ]
    ),
  },
  {
    slug: "stralkastarpolering-nynashamn",
    kind: "location",
    title: "Strålkastarpolering Nynäshamn – kust, villa och väg 73",
    description: "Mobil strålkastarpolering i Nynäshamn. Tätort, Ösmo och villa mot kusten. Fast pris 899 kr/par via väg 73.",
    h1: "Strålkastarpolering i Nynäshamn",
    lead: "Nynäshamn ligger längst söderut i länet. Längre väg — samma pris. Vi tar villauppfarter och utomhusplatser när kalendern släpper postnumret.",
    locationName: "Nynäshamn",
    sections: [
      {
        heading: "Nynäshamn, Ösmo och kusten",
        paragraphs: [
          "I tätorten funkar uppfart eller bostads-P utomhus. Ösmo och mindre orter tar vi på samma villkor. Hamnens korttids-P är dålig arbetsyta.",
        ],
      },
      {
        heading: "Väg 73",
        paragraphs: [
          "Infart via 73:an. Räkna med mer restid än till Haninge, särskilt vardag. Söndag är oftast enklare.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen milersättning inom det bokningsbara området. UV-skydd och garanti ingår.",
        ],
      },
      {
        heading: "Kustväder",
        paragraphs: [
          "Blåst och saltstänk är vanliga. Slipning i blåst går; ösregn och isig uppfart gör vi inte.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Ösmo?",
        answer: "Ja om postnumret går igenom. Samma pris.",
      },
      {
        question: "Kan ni stå vid färjeterminalen?",
        answer: "Nej. Boka hemadress.",
      },
    ],
    related: relatedForMunicipality(
      "Nynäshamn",
    ),
  },
  {
    slug: "stralkastarpolering-salem",
    kind: "location",
    title: "Strålkastarpolering Salem – Rönninge och villa mot Södertälje",
    description: "Mobil strålkastarpolering i Salem. Rönninge och villaområden mellan Huddinge och Södertälje. Fast pris 899 kr/par.",
    h1: "Strålkastarpolering i Salem",
    lead: "Salem är en liten kommun med mycket villa, tätt knuten till Rönninge och gränsen mot Botkyrka. Vi kommer till uppfarten till samma fastpris.",
    locationName: "Salem",
    sections: [
      {
        heading: "Rönninge och villaområden",
        paragraphs: [
          "Rönninge är navet: villa och radhus med uppfart. Gränsen mot Tumba/Botkyrka är flytande i vardagsspråk — boka med gatuadress så hittar vi rätt.",
        ],
      },
      {
        heading: "Läge mellan Huddinge och Södertälje",
        paragraphs: [
          "Vi kommer via Huddinge eller E4/E20 beroende på slot. Söndag är oftast kortare restid än vardagskväll.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen Salem-avgift. Skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Underlag",
        paragraphs: [
          "Grusuppfarter är vanliga. Maskering skyddar lacken; se till att vatten kan rinna av.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Rönninge Salem eller Botkyrka?",
        answer: "Rönninge hör till Salem. Vi har sidor för båda grannarna — samma pris oavsett.",
      },
      {
        question: "Tar ni hela Salem?",
        answer: "Ja inom bokningsbara postnummer. Skriv adressen i kalendern.",
      },
    ],
    related: relatedForMunicipality(
      "Salem",
    ),
  },
  {
    slug: "stralkastarpolering-sigtuna",
    kind: "location",
    title: "Strålkastarpolering Sigtuna – Märsta, Rosersberg och flygplatsnära",
    description: "Mobil strålkastarpolering i Sigtuna kommun. Märsta, Sigtuna stad och Rosersberg. Fast pris 899 kr/par, ingen zonavgift.",
    h1: "Strålkastarpolering i Sigtuna",
    lead: "Sigtuna kommun är Märsta, Sigtuna stad och Rosersberg mer än bara gamla stan. Vi tar villa och gårds-P utomhus — samma 899 kr som i city.",
    locationName: "Sigtuna",
    sections: [
      {
        heading: "Märsta, Sigtuna och Rosersberg",
        paragraphs: [
          "Märsta har mest volym: villa, radhus och flerbostadshus med gård. Sigtuna stad: undvik trånga medeltida gränder som arbetsyta — boka uppfart eller förenings-P.",
          "Rosersberg och områden mot Arlanda: företagsgårdar passar flottor. Privatbil funkar på bostadsadress.",
        ],
      },
      {
        heading: "E4 norrut",
        paragraphs: [
          "Infart via E4. Trafik mot Arlanda kan påverka vardag. Söndag är lugnare. Ange bomkod.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par i hela kommunen. Ingen milersättning inom området.",
        ],
      },
      {
        heading: "Företagsbilar",
        paragraphs: [
          "Flera tjänstebilar samma eftermiddag: se företagssidan.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Märsta?",
        answer: "Ja, Märsta är Sigtuna kommun. Samma pris.",
      },
      {
        question: "Kan ni stå vid Arlanda P?",
        answer: "Nej. Boka bostad eller företagsgård ni råder över.",
      },
    ],
    related: relatedForMunicipality(
      "Sigtuna",
      [
        { slug: "foretagskunder", label: "Företag" },
        { slug: "priser", label: "Priser" },
      ]
    ),
  },
  {
    slug: "stralkastarpolering-tyreso",
    kind: "location",
    title: "Strålkastarpolering Tyresö – Bollmora, Trollbäcken och kust",
    description: "Mobil strålkastarpolering i Tyresö. Bollmora, Trollbäcken och villa mot Ällmora. Fast pris 899 kr/par.",
    h1: "Strålkastarpolering i Tyresö",
    lead: "Tyresö ligger mellan Nacka och Haninge: villa, radhus och en del kustnära lägen. Vi kommer till uppfarten till samma fastpris.",
    locationName: "Tyresö",
    sections: [
      {
        heading: "Bollmora, Trollbäcken och Strand",
        paragraphs: [
          "Bollmora centrum är sämre arbetsyta än hemadress. Trollbäcken och Tyresö strand är ofta villa — uppfarten är standard.",
          "Föreningsgårdar: reservera två rutor. Bom skrivs i bokningen.",
        ],
      },
      {
        heading: "Tyresövägen",
        paragraphs: [
          "Infart via Tyresövägen från Stockholm/Nacka. Rusning efter 16 kan ta tid; söndag är enklare.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen zonavgift. UV-skydd och garanti ingår.",
        ],
      },
      {
        heading: "Kustnära uppfarter",
        paragraphs: [
          "Lutning mot vattnet: ställ bilen stabilt med fri nos. Inte på brygga.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Trollbäcken?",
        answer: "Ja. Tyresö kommun, samma pris.",
      },
      {
        question: "Går det vid Tyresö centrum?",
        answer: "Hellre hemma — korttids-P räcker sällan.",
      },
    ],
    related: relatedForMunicipality(
      "Tyresö",
    ),
  },
  {
    slug: "stralkastarpolering-upplands-vasby",
    kind: "location",
    title: "Strålkastarpolering Upplands Väsby – Väsby centrum och villa",
    description: "Mobil strålkastarpolering i Upplands Väsby. Centrum, Bollstanäs och villaområden längs E4. Fast pris 899 kr/par.",
    h1: "Strålkastarpolering i Upplands Väsby",
    lead: "Upplands Väsby ligger längs E4 norr om Sollentuna. Vi tar villa, radhus och gårdsplatser utomhus till samma 899 kr/par.",
    locationName: "Upplands Väsby",
    sections: [
      {
        heading: "Väsby, Bollstanäs och Runby",
        paragraphs: [
          "Centrumparkering är sämre än hemadress. Bollstanäs, Runby och Smedby har mer villa/radhus — uppfarten funkar.",
          "Flerbostadshus: utomhusplats på gården, inte slutet garageplan.",
        ],
      },
      {
        heading: "E4",
        paragraphs: [
          "Snabb infart via E4 när trafiken flyter. Vardag eftermiddag kan köa vid avfarterna. Söndag är lugnare.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Samma som Sollentuna och Sigtuna. Garanti ingår.",
        ],
      },
      {
        heading: "Väder",
        paragraphs: [
          "Öppna parkeringsytor kan vara blåsiga. Slipning i blåst går; ösregn gör vi inte.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni hela Upplands Väsby?",
        answer: "Ja inom bokningsbara postnummer. Boka med gatuadress.",
      },
      {
        question: "Kan ni ta bilen vid kontoret?",
        answer: "Ja om utomhusplats finns en timme.",
      },
    ],
    related: relatedForMunicipality(
      "Upplands Väsby",
    ),
  },
  {
    slug: "stralkastarpolering-upplands-bro",
    kind: "location",
    title: "Strålkastarpolering Upplands-Bro – Kungsängen och Bro",
    description: "Mobil strålkastarpolering i Upplands-Bro. Kungsängen, Bro och villaområden. Fast pris 899 kr/par.",
    h1: "Strålkastarpolering i Upplands-Bro",
    lead: "Upplands-Bro är Kungsängen och Bro väster/norr om Järfälla. Lite längre väg — samma pris. Vi tar uppfarter när postnumret går igenom.",
    locationName: "Upplands-Bro",
    sections: [
      {
        heading: "Kungsängen och Bro",
        paragraphs: [
          "Villa och radhus dominerar. Uppfarten är standard. Centrum-P vid stationerna är sämre arbetsytor.",
        ],
      },
      {
        heading: "E18-läget",
        paragraphs: [
          "Infart via E18. Räkna med mer restid än till Järfälla, särskilt rusning. Söndag är mer förutsägbart.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen extra avgift. UV-skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Underlag",
        paragraphs: [
          "Grus och lutning går. Se till att vatten kan rinna av och att nosen är skottad vintertid.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Bro tätort?",
        answer: "Ja, Upplands-Bro kommun. Samma pris.",
      },
      {
        question: "Är vi inom området?",
        answer: "Om postnumret 10xxx–19xxx går igenom i bokningen. Annars ring.",
      },
    ],
    related: relatedForMunicipality(
      "Upplands-Bro",
    ),
  },
  {
    slug: "stralkastarpolering-vallentuna",
    kind: "location",
    title: "Strålkastarpolering Vallentuna – tätort och villa norrut",
    description: "Mobil strålkastarpolering i Vallentuna. Tätort, Oroust och villaområden. Fast pris 899 kr/par.",
    h1: "Strålkastarpolering i Vallentuna",
    lead: "Vallentuna ligger norr om Täby med mycket villa. Vi kommer till uppfarten — samma fastpris som i övriga Stockholms län.",
    locationName: "Vallentuna",
    sections: [
      {
        heading: "Vallentuna tätort och villa",
        paragraphs: [
          "Tätorten har blandat boende — boka utomhusplats. Omkringliggande villaområden är enklare: uppfart, fri nos, en timmes stillastående.",
        ],
      },
      {
        heading: "Läge mot Täby och Österåker",
        paragraphs: [
          "Vi kommer ofta via Täby/Österåker-håll. Söndag är lugnare än vardagskväll.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen zonavgift. Garanti och UV-skydd ingår.",
        ],
      },
      {
        heading: "Väder",
        paragraphs: [
          "Öppnare landsortslägen kan vara blåsiga. Ösregn och isig uppfart skjuter vi upp.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni hela Vallentuna?",
        answer: "Ja inom bokningsbara postnummer.",
      },
      {
        question: "Kan ni stå vid centrum?",
        answer: "Hellre hemma.",
      },
    ],
    related: relatedForMunicipality(
      "Vallentuna",
    ),
  },
  {
    slug: "stralkastarpolering-vaxholm",
    kind: "location",
    title: "Strålkastarpolering Vaxholm – ö-stad och villa mot kajen",
    description: "Mobil strålkastarpolering i Vaxholm. Tätort och villa. Fast pris 899 kr/par. Vi arbetar på fast mark, inte på brygga.",
    h1: "Strålkastarpolering i Vaxholm",
    lead: "Vaxholm är kompakt ö-stad med villa runt omkring. Vi tar adresser i kommunen till samma 899 kr — bilen ska stå på fast mark med avrinning.",
    locationName: "Vaxholm",
    sections: [
      {
        heading: "Tätort och villa",
        paragraphs: [
          "Trånga gator i gamla Vaxholm: boka hellre uppfart utanför de mest trafikerade stråken. Villaområden runt staden är enklare arbetsytor.",
        ],
      },
      {
        heading: "Väg och rusning",
        paragraphs: [
          "Infart via väg mot Österåker/Vaxholm. Sommartrafik och helger kan påverka — lämna marginal i bokningen.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen ö-avgift. Samma skydd och garanti.",
        ],
      },
      {
        heading: "Kaj och brygga",
        paragraphs: [
          "Vi polerar inte på brygga eller båtplats. Fast uppfart eller p-plats utomhus krävs.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni hela Vaxholm?",
        answer: "Ja inom bokningsbara postnummer och på fast mark.",
      },
      {
        question: "Kan ni möta vid färjeläget?",
        answer: "Nej som slipplats.",
      },
    ],
    related: relatedForMunicipality(
      "Vaxholm",
    ),
  },
  {
    slug: "stralkastarpolering-varmdo",
    kind: "location",
    title: "Strålkastarpolering Värmdö – Gustavsberg, Hemmesta och skärgårdskant",
    description: "Mobil strålkastarpolering i Värmdö. Gustavsberg, Hemmesta och villa mot skärgården. Fast pris 899 kr/par via Värmdöleden.",
    h1: "Strålkastarpolering i Värmdö",
    lead: "Värmdö är längre ut längs Värmdöleden: Gustavsberg, Hemmesta och villa mot vattnet. Längre väg — samma pris. Bommar och broar styr ankomsten.",
    locationName: "Värmdö",
    sections: [
      {
        heading: "Gustavsberg, Hemmesta och villa",
        paragraphs: [
          "Gustavsberg centrum är sämre arbetsyta än hemadress. Hemmesta, Stavsnäs-hållet och villaområden: uppfart är standard. Färjelägen är inte slipplatser.",
        ],
      },
      {
        heading: "Värmdöleden",
        paragraphs: [
          "Värmdöleden och Skurubron påverkar tiden mer än kilometrarna. Söndag är oftast smidigast. Portkod till förening skrivs i bokningen.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen skärgårdsavgift inom bokningsbart område. UV-skydd och garanti ingår.",
        ],
      },
      {
        heading: "Sjönära tomter",
        paragraphs: [
          "Branta uppfarter: stabil uppställning med fri nos. Inte på brygga. Skotta is vintertid.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Hemmesta?",
        answer: "Ja, Värmdö kommun. Samma pris.",
      },
      {
        question: "Kan ni åka ut till ö med färja?",
        answer: "Vi tar biladresser på fast vägförbindelse inom bokningsbara postnummer — inte rena färjeöar utan bilväg.",
      },
    ],
    related: relatedForMunicipality(
      "Värmdö",
    ),
  },
  {
    slug: "stralkastarpolering-osteraker",
    kind: "location",
    title: "Strålkastarpolering Österåker – Åkersberga och villa norrut",
    description: "Mobil strålkastarpolering i Österåker. Åkersberga och villaområden. Fast pris 899 kr/par, ingen zonavgift.",
    h1: "Strålkastarpolering i Österåker",
    lead: "Österåker med Åkersberga ligger norr/ost om Täby. Vi tar villauppfarter och gårdsplatser utomhus till samma 899 kr/par.",
    locationName: "Österåker",
    sections: [
      {
        heading: "Åkersberga och villa",
        paragraphs: [
          "Åkersberga centrum: undvik korttids-P. Villa i runt tätorten är standardarbetsytan. Reservera plats på radhusgård.",
        ],
      },
      {
        heading: "Roslagsvägen och Norrortsleden",
        paragraphs: [
          "Infart via Roslagsvägen/Norrortsleden. Rusning kan påverka vardag — söndag är lugnare.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Samma som Täby och Vaxholm. Garanti ingår.",
        ],
      },
      {
        heading: "Väder",
        paragraphs: [
          "Öppna lägen mot vatten och fält: blåst går, ösregn och is gör vi inte.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni Åkersberga?",
        answer: "Ja, det är Österåker. Samma pris.",
      },
      {
        question: "Kan ni stå vid centrum?",
        answer: "Hellre hemma.",
      },
    ],
    related: relatedForMunicipality(
      "Österåker",
    ),
  },
];
