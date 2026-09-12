import type { ClusterDoc } from "@/lib/content/types";
import { relatedForMunicipality } from "@/lib/content/municipalities";

/**
 * Non-kommun locality landings (Tumba pattern): high-search tätorter
 * kept alongside their parent municipality page.
 */
export const LOCALITY_PAGES: ClusterDoc[] = [
  {
    slug: "stralkastarpolering-arenastaden",
    kind: "location",
    title: "Polera strålkastare i Arenastaden – 899 kr/par",
    description:
      "Polera strålkastare i Arenastaden, Solna. Jobbparkering, tjänstebil och gård utomhus. Fast pris 899 kr/par, vi kommer till dig efter 16.",
    h1: "Polera strålkastare i Arenastaden",
    lead: "Vill du polera strålkastare i Arenastaden? Arenastaden är Solnas kontors- och eventkvarter: Friends, Mall of Scandinavia och många tjänstebilar. Här styr platsen mer än kilometrarna från city — bilen behöver stå ute en timme.",
    locationName: "Arenastaden",
    sections: [
      {
        heading: "Kontor, tjänstebil och gård",
        paragraphs: [
          "Många bokar vardag efter 16 vid kontoret. En tjänsteplats utomhus på gården funkar. Korttids-P vid Mall of Scandinavia och garageplan under husen är sämre arbetsytor — våtslipning behöver avrinning och stillastående bil.",
          "Har ni flera bilar samma kväll passar företagssidan bättre än en och en privatbokning. Hemma i Huvudsta, Råsunda eller Hagalund är ofta enklare än köpcentrumets angöring.",
        ],
      },
      {
        heading: "Hitta hit och rusning",
        paragraphs: [
          "Arenastaden ligger tätt mot Solna station och E4/E20. Vardag 16–17 kan Norrtull och Solna pendla. Söndag är nästan alltid enklare. Skriv portkod, garagebom eller ‘gårdplats B12’ i bokningen så vi inte bränner slotten vid grinden.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par, samma som övriga Solna och Stockholm. Ingen Arenastaden-avgift. UV-keramiskt skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Utomhuskrav",
        paragraphs: [
          "Vi polerar utomhus. Carport utan väggar går. Stängt garageplan utan ventilation och vattenavrinning säger vi nej till. Bilen behöver stå still tills skyddet satt sig — du kan vänta bredvid.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Arenastaden samma som Solna?",
        answer:
          "Arenastaden ligger i Solna kommun. Vi har egen sida så du hittar oss oavsett hur du söker — samma pris och samma tjänst. Mer om hela kommunen finns på Solna-sidan.",
      },
      {
        question: "Kan ni ta bilen vid Mall of Scandinavia?",
        answer:
          "Sällan som arbetsyta — korttid och trafik. Bättre med tjänsteplats utomhus på gården eller hemadress.",
      },
    ],
    related: relatedForMunicipality("Arenastaden", [
      { slug: "stralkastarpolering-solna", label: "Solna" },
      { slug: "foretagskunder", label: "Företag" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-sickla",
    kind: "location",
    title: "Polera strålkastare i Sickla – 899 kr/par",
    description:
      "Polera strålkastare i Sickla, Nacka. Bostadsgård, villa och arbetsplats utomhus. Fast pris 899 kr/par. Undvik köpcentrumets korttids-P.",
    h1: "Polera strålkastare i Sickla",
    lead: "Vill du polera strålkastare i Sickla? Sickla är Nackas täta port mot stan: nybygge, Nacka Forum och mycket garage. Vi tar jobbet när bilen står ute på gård, uppfart eller tjänsteplats — inte i köpcentrumets angöring.",
    locationName: "Sickla",
    sections: [
      {
        heading: "Gård, villa och Forum",
        paragraphs: [
          "Sickla köpkvarter och Nacka Forum har korttids-P och genomfart som sällan räcker en timme. Boka hellre föreningens utomhusplats, en villaadress mot Plania/Finnberget eller en tjänsteruta ni får använda.",
          "Nyare kvarter har ofta garage under huset. Behöver ni bilen ut på gården innan vi kommer. Reservera två rutor så vi kommer åt båda glasen.",
        ],
      },
      {
        heading: "Värmdöleden och Skurubron",
        paragraphs: [
          "Infart via Värmdöleden. Rusning mot Nacka efter 16 kan äta restid — söndag är mer förutsägbart. Bom och portkod: skriv i bokningen.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen Sickla-avgift. Samma UV-skydd och 12 månaders garanti som i övriga Nacka.",
        ],
      },
      {
        heading: "Utomhus i tätt kvarter",
        paragraphs: [
          "Vi behöver fri nos och plats att stå cirka en timme utan att blockera sopbil eller angöring. Trånga garageplan utan avrinning funkar inte för våtslipning.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Sickla samma som Nacka?",
        answer:
          "Sickla är en tätort i Nacka kommun. Egen sida för sökningen — samma pris. Se också Nacka, Älta och Saltsjöbaden.",
      },
      {
        question: "Sickla köpkvarter som mötesplats?",
        answer: "Dålig arbetsyta. Hellre hemadress eller arbetsplats med egen P utomhus.",
      },
    ],
    related: relatedForMunicipality("Sickla", [
      { slug: "stralkastarpolering-nacka", label: "Nacka" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-alta",
    kind: "location",
    title: "Polera strålkastare i Älta – 899 kr/par",
    description:
      "Polera strålkastare i Älta, Nacka. Radhusgård, villauppfart och Fisksätra-nära adresser. Fast pris 899 kr/par, vi kommer till dig.",
    h1: "Polera strålkastare i Älta",
    lead: "Vill du polera strålkastare i Älta? Älta ligger i Nacka mellan Sickla och Tyresö: radhus, lamellhus och villa. Vi tar jobbet på uppfart eller gårdsplats utomhus till samma 899 kr/par.",
    locationName: "Älta",
    sections: [
      {
        heading: "Radhus, villa och Fisksätra-hållet",
        paragraphs: [
          "Vanligast är asfalterad uppfart eller två reserverade rutor på radhusgården. Älta centrum är sämre arbetsyta (korttid) än en bostadsadress en minut bort.",
          "Mot Fisksätra och Orminge gäller samma sak: bilen ute, nosen fri, plats att stå en timme. Portkod och bom skrivs i bokningen.",
        ],
      },
      {
        heading: "Infart från Nacka och Tyresö",
        paragraphs: [
          "Vi kommer ofta via Ältavägen från Nacka eller från Tyresöhållet. Vardag efter 16 kan köa; söndag är lugnare. Ange ‘uppfarten mot gatan’ om huset har flera entréer.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Samma som Sickla och övriga Nacka. Ingen zonavgift. UV-skydd och garanti ingår.",
        ],
      },
      {
        heading: "Väder och underlag",
        paragraphs: [
          "Grusgård och lutande uppfart går bra. Skotta nosen vintertid. Vi arbetar inte i ösregn eller på blankis.",
        ],
      },
    ],
    faqs: [
      {
        question: "Ingår Älta i Nacka?",
        answer:
          "Ja. Älta är Nacka kommun. Vi har egen sida så du hittar oss — samma fastpris. Mer om hela kommunen på Nacka-sidan.",
      },
      {
        question: "Kan ni stå på radhusparkeringen?",
        answer:
          "Ja om ni får stå kvar cirka en timme och vi kommer åt båda strålkastarna. Reservera gärna två rutor.",
      },
    ],
    related: relatedForMunicipality("Älta", [
      { slug: "stralkastarpolering-nacka", label: "Nacka" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-saltsjobaden",
    kind: "location",
    title: "Polera strålkastare i Saltsjöbaden – 899 kr/par",
    description:
      "Polera strålkastare i Saltsjöbaden, Nacka. Villauppfarter mot sjön, Boo-hållet och längre slinga från stan. Fast pris 899 kr/par.",
    h1: "Polera strålkastare i Saltsjöbaden",
    lead: "Vill du polera strålkastare i Saltsjöbaden? Saltsjöbaden är Nackas sjönära villaområden — längre slinga från stan, samma pris. Uppfarten är arbetsytan; brygga och båtplats är det inte.",
    locationName: "Saltsjöbaden",
    sections: [
      {
        heading: "Villa mot vattnet",
        paragraphs: [
          "Vanligast är långa eller branta uppfarter. Ställ bilen så båda strålkastarna nås utan att vi blockerar grannens utfart. Centrumparkering och station är sämre än hemadress.",
          "Boo och Igelboda tar vi samma villkor. Söndag är oftast smidigare över Skurubron än vardagskväll.",
        ],
      },
      {
        heading: "Saltsjöbadsleden och broar",
        paragraphs: [
          "Restiden styrs av Värmdöleden/Skurubron mer än kilometrarna. Bom och grindkod: skriv i bokningen så vi inte står vid grinden halva slotten.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Ingen Saltsjöbaden-avgift trots längre väg. UV-skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Sjönära uppfarter",
        paragraphs: [
          "Lutning mot vattnet: stabil uppställning med fri nos. Inte på brygga. Vintertid behöver isen vara skrapad där vi står. Mossiga skuggiga tomter — se till att underlaget inte är blankis.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Saltsjöbaden Nacka kommun?",
        answer:
          "Ja. Egen sida för sökningen — samma tjänst och samma 899 kr/par. Se också Nacka och Sickla.",
      },
      {
        question: "Kan ni polera vid båtklubben?",
        answer: "Nej som arbetsyta. Hellre hemma på uppfarten.",
      },
    ],
    related: relatedForMunicipality("Saltsjöbaden", [
      { slug: "stralkastarpolering-nacka", label: "Nacka" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-tureberg",
    kind: "location",
    title: "Polera strålkastare i Tureberg – 899 kr/par",
    description:
      "Polera strålkastare i Tureberg, Sollentuna. Hemadress, kontors-P utomhus och Edsberg-nära. Fast pris 899 kr/par. Undvik centrumets korttids-P.",
    h1: "Polera strålkastare i Tureberg",
    lead: "Vill du polera strålkastare i Tureberg? Tureberg är Sollentunas tätort längs E4: centrum, kontor och bostäder. Vi tar jobbet hemma eller på en utomhusplats ni får använda en timme — inte på korttids-P vid gallerian.",
    locationName: "Tureberg",
    sections: [
      {
        heading: "Hem, kontor och centrum",
        paragraphs: [
          "Tureberg centrum har korttids-P som sällan funkar en timme. Boka hemadress i närområdet, Edsberg, Helenelund eller en tjänsteplats utomhus efter 16.",
          "Lamellhus med gård: reservera två rutor. Garageplan utan avrinning säger vi nej till.",
        ],
      },
      {
        heading: "E4 och Häggvik",
        paragraphs: [
          "E4 och anslutningar mot Häggvik styr restiden. Vardag efter 16 kan köa; söndag är enklare. Portkod skrivs i bokningen.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Samma som övriga Sollentuna och Täby. Ingen zonavgift. UV-skydd och garanti ingår.",
        ],
      },
      {
        heading: "Väder",
        paragraphs: [
          "Skuggiga gårdar torkar långsammare efter regn. Vi väntar hellre till nästa slot än att slipa på blöt plast i ösregn.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Tureberg samma som Sollentuna?",
        answer:
          "Tureberg är tätorten i Sollentuna kommun. Egen sida — samma pris. Mer om Edsberg, Helenelund och Sjöberg på Sollentuna-sidan.",
      },
      {
        question: "Kan ni ta bilen vid kontoret i Tureberg?",
        answer: "Ja om det finns en utomhusplats ni får använda en timme.",
      },
    ],
    related: relatedForMunicipality("Tureberg", [
      { slug: "stralkastarpolering-sollentuna", label: "Sollentuna" },
      { slug: "foretagskunder", label: "Företag" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-djursholm",
    kind: "location",
    title: "Polera strålkastare i Djursholm – 899 kr/par",
    description:
      "Polera strålkastare i Djursholm, Danderyd. Långa villauppfarter, Stocksund-nära och sjönära tomter. Fast pris 899 kr/par, ingen zonavgift.",
    h1: "Polera strålkastare i Djursholm",
    lead: "Vill du polera strålkastare i Djursholm? Djursholm är Danderyds villaområden — långa uppfarter, ibland branta, mer sjönära än centrumparkering. Vi kommer till uppfarten till samma 899 kr/par som övriga länet.",
    locationName: "Djursholm",
    sections: [
      {
        heading: "Villauppfarter och tomter",
        paragraphs: [
          "Ställ bilen så båda strålkastarna nås utan att vi blockerar grannens utfart. Långa grus- eller asfaltuppfarter funkar samma sak: nosen fri, plats att stå en timme.",
          "Stocksund och Enebyberg tar vi samma villkor. Mörby centrum är sämre arbetsyta än hemadress. Bom och grindkod skrivs i bokningen.",
        ],
      },
      {
        heading: "E18 och Roslagsvägen",
        paragraphs: [
          "Nära city men rusning mot Danderyds sjukhus och Mörby kan påverka. Söndag är oftast smidigast. Vi siktar på början av er bokade timme.",
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
        question: "Är Djursholm Danderyd kommun?",
        answer:
          "Ja. Egen sida för sökningen — samma tjänst och samma pris. Mer om Stocksund och Enebyberg på Danderyd-sidan.",
      },
      {
        question: "Går det vid Mörby centrum?",
        answer: "Hellre hemma. Korttids-P räcker sällan en timme.",
      },
    ],
    related: relatedForMunicipality("Djursholm", [
      { slug: "stralkastarpolering-danderyd", label: "Danderyd" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-akersberga",
    kind: "location",
    title: "Polera strålkastare i Åkersberga – 899 kr/par",
    description:
      "Polera strålkastare i Åkersberga, Österåker. Villauppfart och radhusgård. Fast pris 899 kr/par, ingen zonavgift. Undvik centrumets korttids-P.",
    h1: "Polera strålkastare i Åkersberga",
    lead: "Vill du polera strålkastare i Åkersberga? Åkersberga är Österåkers tätort norr/ost om Täby: villa, radhus och lite centrum. Vi tar jobbet på uppfarten — samma 899 kr/par som i Täby och Vaxholm.",
    locationName: "Åkersberga",
    sections: [
      {
        heading: "Villa runt tätorten",
        paragraphs: [
          "Åkersberga centrum: undvik korttids-P. Villa och radhus i runt tätorten är standardarbetsytan. Reservera plats på radhusgård så vi kommer åt båda glasen.",
          "Österåkers övriga villaområden tar vi samma villkor. Ange gatuadress och eventuell portkod i bokningen.",
        ],
      },
      {
        heading: "Roslagsvägen och Norrortsleden",
        paragraphs: [
          "Infart via Roslagsvägen/Norrortsleden. Rusning kan påverka vardag — söndag är lugnare. Vi siktar på början av er slot.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Samma som Täby och övriga Österåker. Ingen milersättning. UV-skydd och garanti ingår.",
        ],
      },
      {
        heading: "Väder",
        paragraphs: [
          "Öppna lägen mot vatten och fält: blåst går, ösregn och is gör vi inte. Skotta nosen vintertid.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Åkersberga samma som Österåker?",
        answer:
          "Åkersberga är tätorten i Österåker kommun. Egen sida — samma pris. Se Österåker-sidan för hela kommunen.",
      },
      {
        question: "Kan ni stå vid centrum?",
        answer: "Hellre hemma. Korttids-P räcker sällan en timme.",
      },
    ],
    related: relatedForMunicipality("Åkersberga", [
      { slug: "stralkastarpolering-osteraker", label: "Österåker" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-flemingsberg",
    kind: "location",
    title: "Polera strålkastare i Flemingsberg – 899 kr/par",
    description:
      "Polera strålkastare i Flemingsberg, Huddinge. Arbetsplats efter 16, villa och radhus. Fast pris 899 kr/par längs Huddingevägen.",
    h1: "Polera strålkastare i Flemingsberg",
    lead: "Vill du polera strålkastare i Flemingsberg? Flemingsberg är Huddinges knutpunkt med sjukhus, campus och blandad bebyggelse. Vi tar jobbet på uppfart, gårds-P eller tjänsteplats utomhus — gärna vardag efter 16.",
    locationName: "Flemingsberg",
    sections: [
      {
        heading: "Sjukhus, campus och bostad",
        paragraphs: [
          "På arbetsplatser kring Huddinge sjukhus och campus bokar vi gärna vardag efter 16 när bilarna står still. Korttids-P vid stationen är sämre än en tjänsteruta eller hemadress.",
          "Villa och radhus i Flemingsberg, Visättra och mot Stuvsta funkar som vanligt: bilen ute, nosen fri, plats att stå en timme.",
        ],
      },
      {
        heading: "Huddingevägen och E4",
        paragraphs: [
          "Från Stockholm kör vi Huddingevägen eller E4 mot Fittja och av mot kommunen. Söndag dagtid är ofta kortare restid än vardagskväll. Portkod skrivs i bokningen.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par, samma som övriga Huddinge. Ingen zonavgift. UV-skydd och 12 månaders garanti ingår.",
        ],
      },
      {
        heading: "Utomhuskrav",
        paragraphs: [
          "Innergård vid hyres- eller bostadsrätt går om ni reserverar två rutor. Stängt garageplan utan avrinning funkar inte. Vatten från slipningen ska kunna rinna av.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Flemingsberg Huddinge kommun?",
        answer:
          "Ja. Egen sida för sökningen — samma pris. Mer om Stuvsta, Skogås och Trångsund på Huddinge-sidan.",
      },
      {
        question: "Kan ni ta bilen vid sjukhuset?",
        answer:
          "Ja om ni har en utomhusplats ni får använda en timme. Ange var bilen står i bokningen.",
      },
    ],
    related: relatedForMunicipality("Flemingsberg", [
      { slug: "stralkastarpolering-huddinge", label: "Huddinge" },
      { slug: "foretagskunder", label: "Företag" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-handen",
    kind: "location",
    title: "Polera strålkastare i Handen – 899 kr/par",
    description:
      "Polera strålkastare i Handen, Haninge. Hellre bostadsadress än centrum-P. Fast pris 899 kr/par via väg 73.",
    h1: "Polera strålkastare i Handen",
    lead: "Vill du polera strålkastare i Handen? Handen är Haninges centrum — genomfart och korttids-P. Vi tar jobbet hellre på en bostadsadress en kilometer bort, i Vendelsö, Vega eller Brandbergen, till samma 899 kr/par.",
    locationName: "Handen",
    sections: [
      {
        heading: "Bostad före centrum-P",
        paragraphs: [
          "Handen centrum är sämre arbetsyta (genomfart, korttids-P) än en villa- eller radhusadress i närområdet. Vendelsö och Brandbergen: uppfarten är standard. Vega och Port 73 har mer parkeringsdäck — då behövs utomhusplats, inte slutet garageplan.",
          "Västerhaninge och Tungelsta tar längre tid från stan, särskilt vardag. Söndag är oftast enklare.",
        ],
      },
      {
        heading: "Nynäsvägen och 73:an",
        paragraphs: [
          "Vanlig infart är väg 73. Rusning söderut efter 16 kan äta restid. Bomnyckel till förening: skriv i bokningen.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Samma som övriga Haninge. Avståndet läggs inte på fakturan. Garanti och UV-skydd ingår.",
        ],
      },
      {
        heading: "Väder",
        paragraphs: [
          "Slipning går i blåst; ösregn och ishalka på uppfarten gör vi inte. Skotta nosen vintertid.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är Handen samma som Haninge?",
        answer:
          "Handen är tätorten i Haninge kommun. Egen sida — samma pris. Se Haninge-sidan för Vendelsö, Vega och Västerhaninge.",
      },
      {
        question: "Går det på Port 73:s parkering?",
        answer:
          "Bara om ni har en ruta ni får använda en timme utomhus. Enklare hemma.",
      },
    ],
    related: relatedForMunicipality("Handen", [
      { slug: "stralkastarpolering-haninge", label: "Haninge" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-barkarby",
    kind: "location",
    title: "Polera strålkastare i Barkarby – 899 kr/par",
    description:
      "Polera strålkastare i Barkarby, Järfälla. Nybygge, tjänsteplats utomhus och villa i Viksjö-nära. Fast pris 899 kr/par. Undvik handelsområdets korttids-P.",
    h1: "Polera strålkastare i Barkarby",
    lead: "Vill du polera strålkastare i Barkarby? Barkarby blandar handelsområde, nybygge och närhet till Jakobsberg. Vi tar jobbet när bilen står ute — hemma, på gården eller på en tjänsteplats — inte på köpcentrumets korttids-P.",
    locationName: "Barkarby",
    sections: [
      {
        heading: "Nybygge, handel och bostad",
        paragraphs: [
          "Barkarby handelsområde har korttid och trafik som sällan funkar en timme. Nyare kvarter har ofta garage — bilen behöver stå ute på gård eller gästplats.",
          "Jakobsberg centrum är sämre arbetsyta än en bostadsadress. Viksjö, Aspnäs och Kallhäll är ofta villa och radhus där uppfarten är standard.",
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
          "899 kr/par i Barkarby och övriga Järfälla. Ingen zonavgift. Garanti och UV-skydd ingår.",
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
        question: "Är Barkarby Järfälla kommun?",
        answer:
          "Ja. Egen sida för sökningen — samma pris. Mer om Jakobsberg, Viksjö och Kallhäll på Järfälla-sidan.",
      },
      {
        question: "Funkar Barkarby handels-P?",
        answer:
          "Sällan — korttid och trafik. Bättre hemma eller på en tjänsteplats utomhus.",
      },
    ],
    related: relatedForMunicipality("Barkarby", [
      { slug: "stralkastarpolering-jarfalla", label: "Järfälla" },
      { slug: "foretagskunder", label: "Företag" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-gustavsberg",
    kind: "location",
    title: "Polera strålkastare i Gustavsberg – 899 kr/par",
    description:
      "Polera strålkastare i Gustavsberg, Värmdö. Villauppfart och radhus. Fast pris 899 kr/par via Värmdöleden. Undvik centrumets korttids-P.",
    h1: "Polera strålkastare i Gustavsberg",
    lead: "Vill du polera strålkastare i Gustavsberg? Gustavsberg är Värmdös tätort längs Värmdöleden. Längre väg från stan — samma pris. Vi tar villa och radhus på uppfarten; centrumparkering är sämre arbetsyta.",
    locationName: "Gustavsberg",
    sections: [
      {
        heading: "Tätort och villa",
        paragraphs: [
          "Gustavsberg centrum är sämre arbetsyta än hemadress. Villa och radhus runt tätorten: uppfarten är standard. Hemmesta och vidare mot Stavsnäs tar vi samma villkor inom bokningsbara postnummer.",
          "Färjelägen är inte slipplatser. Bom och portkod till förening skrivs i bokningen.",
        ],
      },
      {
        heading: "Värmdöleden och Skurubron",
        paragraphs: [
          "Värmdöleden och Skurubron påverkar tiden mer än kilometrarna. Söndag är oftast smidigast. Vi siktar på början av er bokade timme.",
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
        question: "Är Gustavsberg samma som Värmdö?",
        answer:
          "Gustavsberg är tätorten i Värmdö kommun. Egen sida — samma pris. Se Värmdö-sidan för Hemmesta och övriga kommunen.",
      },
      {
        question: "Kan ni åka ut till ö med färja?",
        answer:
          "Vi tar biladresser på fast vägförbindelse inom bokningsbara postnummer — inte rena färjeöar utan bilväg.",
      },
    ],
    related: relatedForMunicipality("Gustavsberg", [
      { slug: "stralkastarpolering-varmdo", label: "Värmdö" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "priser", label: "Priser" },
    ]),
  },
  {
    slug: "stralkastarpolering-tullinge",
    kind: "location",
    title: "Polera strålkastare i Tullinge – 899 kr/par",
    description:
      "Polera strålkastare i Tullinge, Botkyrka. Villa- och radhusuppfarter. Fast pris 899 kr/par, samma som Tumba. Vi kommer till dig.",
    h1: "Polera strålkastare i Tullinge",
    lead: "Vill du polera strålkastare i Tullinge? Tullinge är Botkyrkas villa- och radhusområden nära Tumba. Uppfarten är arbetsytan — samma 899 kr/par som i övriga länet, ingen zonavgift.",
    locationName: "Tullinge",
    sections: [
      {
        heading: "Villa och radhus",
        paragraphs: [
          "Vanligast är asfalterad eller grusad uppfart. Tullinge centrum är sämre som arbetsyta (korttid) än en bostadsadress. Mot Tumba, Storvreten och Rönninge-gränsen mot Salem tar vi samma villkor.",
          "Reservera plats på radhusgård. Portkod och bom: skriv i bokningen. Mer om Tumba centrum finns på Tumba-sidan; hela kommunen på Botkyrka-sidan.",
        ],
      },
      {
        heading: "E4/E20 och Hågelby",
        paragraphs: [
          "Vanlig infart är E4/E20 mot Fittja eller avfart Tumba/Hågelby. Vardag 16–18 kan Södertäljevägen ta tid — söndag är mer förutsägbart.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "899 kr/par. Samma som Tumba och övriga Botkyrka. UV-keramiskt skydd och 12 månaders garanti ingår.",
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
        question: "Är Tullinge Botkyrka kommun?",
        answer:
          "Ja. Tullinge är en tätort i Botkyrka, precis som Tumba. Egen sida — samma pris och samma tjänst.",
      },
      {
        question: "Kan ni ta bilen vid Tullinge station?",
        answer:
          "Dålig plats att stå en timme. Bättre med hemmauppfart eller en ruta på gården ni får använda.",
      },
    ],
    related: relatedForMunicipality("Tullinge", [
      { slug: "stralkastarpolering-botkyrka", label: "Botkyrka" },
      { slug: "stralkastarpolering-tumba", label: "Tumba" },
      { slug: "priser", label: "Priser" },
    ]),
  },
];
