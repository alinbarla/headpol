import type { ClusterDoc } from "@/lib/content/types";

export const LOCATION_PAGES: ClusterDoc[] = [
  {
    slug: "stralkastarpolering-stockholm",
    kind: "location",
    title: "Strålkastarpolering Stockholm – vi kommer till din adress",
    description:
      "Mobil strålkastarpolering i Stockholms län. Fast pris 799 kr/par, ingen zonavgift. Vi tar innerstad, villaområden och arbetsplatser. UV-skydd och 5 års garanti.",
    h1: "Strålkastarpolering i Stockholms län",
    lead: "Vi är en mobil tjänst, inte en verkstad du lämnar bilen till. Stockholms län betyder innergårdar, villauppfarter, företagsparkeringar och olika restider — inte ett och samma upplägg överallt.",
    locationName: "Stockholm",
    sections: [
      {
        heading: "Täckning i länet",
        paragraphs: [
          "Vi tar adresser i Stockholms stad och kommunerna runt om, ungefär 40 km från centrum. Söderut kör vi bland annat till Huddinge, Tumba, Södertälje och Haninge. Österut till Nacka. Norrut till Solna och vidare mot Täby, Sollentuna och Järfälla.",
          "Postnummer 10xxx–19xxx och 76xxx (Norrtälje) går att boka i kalendern. Ligger du precis utanför, ring — vi bedömer restiden från fall till fall.",
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
          "799 kr/par för personbil, oavsett om adressen är Södermalm eller Södertälje. Ingen zonavgift och ingen milersättning inom det vi tar. UV-keramiskt skydd och 5 års garanti ingår.",
        ],
      },
      {
        heading: "Utomhusjobb",
        paragraphs: [
          "Vi polerar utomhus. Under tak på en öppen carport går bra. Ett stängt garage där vi inte får plats med slipning och vatten är sämre. Bilen behöver stå still tills skyddet har satt sig — du kan vänta bredvid.",
        ],
      },
    ],
    faqs: [
      {
        question: "Tar ni hela Stockholms län?",
        answer:
          "Större delen, ja. Kalendern släpper igenom postnummer i länet. Osäker? Skriv adressen i bokningen eller ring 076-344 11 68.",
      },
      {
        question: "Fungerar det med gatuparkering i stan?",
        answer:
          "Ja om vi kommer åt båda strålkastarna och kan stå kvar ungefär en timme. P-skiva eller garageplats ni anvisar under tiden funkar.",
      },
    ],
    related: [
      { slug: "stralkastarpolering-huddinge", label: "Huddinge" },
      { slug: "stralkastarpolering-tumba", label: "Tumba" },
      { slug: "stralkastarpolering-sodertalje", label: "Södertälje" },
      { slug: "stralkastarpolering-haninge", label: "Haninge" },
      { slug: "stralkastarpolering-nacka", label: "Nacka" },
      { slug: "stralkastarpolering-solna", label: "Solna" },
      { slug: "stralkastarpolering", label: "Tjänsten" },
    ],
  },
  {
    slug: "stralkastarpolering-huddinge",
    kind: "location",
    title: "Strålkastarpolering Huddinge – uppfart och Flemingsberg",
    description:
      "Mobil strålkastarpolering i Huddinge. Vi kommer till villauppfart, radhus och arbetsplatser längs Huddingevägen. Fast pris 799 kr/par, ingen zonavgift.",
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
          "799 kr/par, samma som i stan. Ingen extra avgift för Huddinge. MC från 499 kr. Skydd och 5 års garanti ingår.",
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
        answer:
          "Ja. Det är Huddinge kommun och samma fastpris. Skriv gatuadressen i bokningen.",
      },
      {
        question: "Kan ni stå på en radhusparkering?",
        answer:
          "Ja om ni får stå kvar cirka en timme och vi kommer åt båda strålkastarna. Meddela portkod eller bommnyckel i meddelandet om det behövs.",
      },
    ],
    related: [
      { slug: "stralkastarpolering-stockholm", label: "Hela Stockholm" },
      { slug: "stralkastarpolering-tumba", label: "Tumba" },
      { slug: "stralkastarpolering-haninge", label: "Haninge" },
      { slug: "priser", label: "Priser" },
    ],
  },
  {
    slug: "stralkastarpolering-tumba",
    kind: "location",
    title: "Strålkastarpolering Tumba – Botkyrka och villaområden",
    description:
      "Mobil strålkastarpolering i Tumba och Botkyrka. Villa och radhus längs Hågelbyvägen och Tumba centrum. Fast pris 799 kr/par, vi kommer till dig.",
    h1: "Strålkastarpolering i Tumba",
    lead: "Tumba är Botkyrka: villaområden, radhus och en del arbetsplatser runt centrum — inte Södermalms gator. Vi tar jobbet hemma hos dig om bilen står ute och nosen är fri.",
    locationName: "Tumba",
    sections: [
      {
        heading: "Tumba, Tullinge och resten av Botkyrka",
        paragraphs: [
          "Vanligast är uppfart i Tumba, Tullinge, Storvreten och Rönninge-gränsen mot Salem. Flerfamiljshus vid Tumba centrum går om ni kan peka ut en ruta utomhus där vi står kvar en timme utan att bli blockerade av angöring till ICA eller pendeltåget.",
          "Vi tar också Fittja, Alby och Hallunda när bilen står på en vanlig p-plats eller gård — inte i ett trångt garageplan utan ventilation och vattenavrinning.",
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
          "Samma 799 kr/par som i Stockholm. Ingen zonavgift för Botkyrka. Räkna med 45–60 minuter på plats. Öppet lör–sön 08–20, vardagar 16–20.",
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
        answer:
          "Ja. Tullinge är samma kommun och samma pris. Boka med gatuadress.",
      },
      {
        question: "Pendeltågsparkering vid Tumba station?",
        answer:
          "Dålig plats att stå en timme. Bättre med hemmauppfart eller en ruta på gården som ni får använda.",
      },
    ],
    related: [
      { slug: "stralkastarpolering-huddinge", label: "Huddinge" },
      { slug: "stralkastarpolering-sodertalje", label: "Södertälje" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
      { slug: "stralkastarpolering", label: "Tjänsten" },
    ],
  },
  {
    slug: "stralkastarpolering-sodertalje",
    kind: "location",
    title: "Strålkastarpolering Södertälje – E4/E20 och industri",
    description:
      "Mobil strålkastarpolering i Södertälje. Villa, radhus och fordonsflottor vid E4/E20. Fast pris 799 kr/par, ingen extra avgift för avståndet.",
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
          "799 kr/par även här. Vi tar inte extra för Södertälje. Tar jobbet längre tid på grund av väder eller att bilen inte är framme, säger vi till — vi påbörjar inte slipning på en blöt nos i ösregn.",
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
        answer:
          "Ofta ja om postnumret går igenom i bokningen. Osäker — mejla adressen eller ring innan ni betalar.",
      },
      {
        question: "Kan ni göra flera tjänstebilar samma kväll?",
        answer:
          "Ja. Se företagssidan och mejla antal. Styckpriset blir lägre när restiden bara sker en gång.",
      },
    ],
    related: [
      { slug: "stralkastarpolering-tumba", label: "Tumba" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
      { slug: "foretagskunder", label: "Företag" },
      { slug: "priser", label: "Priser" },
    ],
  },
  {
    slug: "stralkastarpolering-haninge",
    kind: "location",
    title: "Strålkastarpolering Haninge – Handen, Vega och Vendelsö",
    description:
      "Mobil strålkastarpolering i Haninge. Handen, Vega, Vendelsö, Västerhaninge. Fast pris 799 kr/par. Vi kommer till uppfart eller p-plats utomhus.",
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
          "799 kr/par, samma som Solna. Avståndet till Haninge läggs inte på fakturan. Garanti och UV-skydd ingår.",
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
        answer:
          "Ja, det är Haninge kommun. Samma pris. Boka med gatuadress.",
      },
      {
        question: "Går det på Port 73:s parkering?",
        answer:
          "Bara om ni har en ruta ni får använda en timme utomhus. Enklare hemma.",
      },
    ],
    related: [
      { slug: "stralkastarpolering-huddinge", label: "Huddinge" },
      { slug: "stralkastarpolering-nacka", label: "Nacka" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
      { slug: "priser", label: "Priser" },
    ],
  },
  {
    slug: "stralkastarpolering-nacka",
    kind: "location",
    title: "Strålkastarpolering Nacka – Sickla, Älta och Saltsjöbaden",
    description:
      "Mobil strålkastarpolering i Nacka. Sickla, Forum, Älta, Fisksätra, Saltsjöbaden. Broar och bommar påverkar ankomst. Fast pris 799 kr/par.",
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
          "799 kr/par. Ingen Nacka-avgift. Samma skydd och garanti som i resten av länet.",
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
        answer:
          "Ja. Längre restid, samma pris. Söndag är oftast smidigast.",
      },
      {
        question: "Sickla köpkvarter som mötesplats?",
        answer:
          "Dålig arbetsyta. Bättre med hemadress eller arbetsplats med egen P utomhus.",
      },
    ],
    related: [
      { slug: "stralkastarpolering-haninge", label: "Haninge" },
      { slug: "stralkastarpolering-solna", label: "Solna" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
      { slug: "stralkastarpolering", label: "Tjänsten" },
    ],
  },
  {
    slug: "stralkastarpolering-solna",
    kind: "location",
    title: "Strålkastarpolering Solna – innerstad, Arenastaden och jobb-P",
    description:
      "Mobil strålkastarpolering i Solna. Gatuparkering, bostadsrättsgård och arbetsplatser i Arenastaden. Fast pris 799 kr/par, vi kommer till dig.",
    h1: "Strålkastarpolering i Solna",
    lead: "Solna är tätt: gatuparkering, garageinfarter och många som vill att vi tar bilen på jobbet i Arenastaden eller Sundbyberg-gränsen. Här är platsen det svåra — inte avståndet från city.",
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
          "799 kr/par, ingen innerstadsrabatt och inget påslag. Samma som Tumba. UV-skydd och 5 års garanti ingår.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kan ni ta bilen på jobbet i Arenastaden?",
        answer:
          "Ja om det finns en utomhusplats ni får använda en timme. Garageplan utan avrinning säger vi nej till.",
      },
      {
        question: "Ingår Sundbyberg?",
        answer:
          "Ja, vi tar Sundbyberg. Samma pris. Det finns ingen egen sida för Sundbyberg — boka med adressen.",
      },
    ],
    related: [
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
      { slug: "stralkastarpolering-nacka", label: "Nacka" },
      { slug: "foretagskunder", label: "Företag" },
      { slug: "priser", label: "Priser" },
    ],
  },
];
