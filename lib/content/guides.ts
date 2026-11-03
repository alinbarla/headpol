import type { ClusterDoc } from "@/lib/content/types";

/**
 * Problem- and question-led guides. Each one owns a search intent the service
 * pages do not (yellow lenses, besiktning, replace vs polish) and hands the
 * reader on to booking.
 */
export const GUIDE_PAGES: ClusterDoc[] = [
  {
    slug: "gula-stralkastare",
    kind: "other",
    title: "Gula strålkastare? Orsak och åtgärd – polering 899 kr/par",
    description:
      "Därför blir strålkastare gula, matta och mjölkiga, vad det gör med ljuset och besiktningen, och hur gulnaden tas bort för gott. 899 kr/par på din adress.",
    h1: "Gula strålkastare",
    lead: "Gula, matta eller mjölkiga strålkastare är nästan alltid oxiderad plast på utsidan, inte smuts på insidan. Det går att slipa bort, polera klart och skydda — utan att byta hela enheten.",
    sections: [
      {
        heading: "Varför blir strålkastare gula?",
        paragraphs: [
          "Moderna strålkastarglas är gjorda av polykarbonat. Från fabrik har plasten ett tunt UV-skydd. Sol, vägsalt, grus och tvättborstar nöter bort skyddet med åren, och sedan börjar plasten oxidera.",
          "Oxidationen gör ytan gul, matt och lite sträv. Bilar som står ute gulnar snabbare än bilar i garage, och den sida som får mest sol blir ofta sämst först.",
        ],
      },
      {
        heading: "Gul, matt, mjölkig eller repig – vad betyder det?",
        paragraphs: [
          "Det mesta syns på utsidan och går att åtgärda. Det som sitter på insidan gör det inte.",
        ],
        bullets: [
          "Gul ton: oxidation i plasten. Försvinner när det skadade skiktet slipas bort",
          "Matt eller mjölkig yta: sönderfallet fabriksskydd och mikrosprickor. Går att slipa och polera klart",
          "Fina repor och lätta stenskott: oftast ytliga och går att slipa ner. Djupa stenskott kan synas svagt efteråt",
          "Imma eller vatten på insidan: läckande tätning eller ventil. Går inte att polera bort",
          "Spricka genom glaset: enheten behöver bytas",
        ],
      },
      {
        heading: "Därför ska du inte vänta",
        paragraphs: [
          "Oxiderad plast sprider ljuset. Du ser kortare och sämre i mörker och regn, och mötande trafik kan bländas av det spridda ljuset. Kraftigt gulnade eller matta glas kan också ge anmärkning vid besiktningen.",
          "Ju längre oxidationen får arbeta, desto djupare sitter den. Polerar du i tid går jobbet fortare och mer material blir kvar i glaset.",
        ],
        href: "/stralkastare-besiktning",
        linkLabel: "Strålkastare och besiktning",
      },
      {
        heading: "Så tar vi bort gulnaden",
        paragraphs: [
          "Vi maskerar lacken runt strålkastaren, våtslipar bort det oxiderade skiktet stegvis från P400 till P3000, polerar tillbaka klarheten och avslutar med UV-keramiskt skydd. Ett par tar normalt 45–60 minuter och görs på din adress.",
          "Priset är 899 kr/par inklusive moms, med 12 månaders garanti. Samma pris i hela vårt område i Stockholms län.",
        ],
        href: "/stralkastarpolering",
        linkLabel: "Så går poleringen till",
      },
      {
        heading: "Kommer gulnaden tillbaka?",
        paragraphs: [
          "Utan nytt UV-skydd, ja — ofta inom några månader. Därför ingår UV-keramiskt skydd alltid hos oss. Vill du ha det tåligaste skyddet, även mot stenskott, kan vi lägga PPF-folie direkt efter poleringen.",
        ],
        href: "/polering-ppf",
        linkLabel: "Polering + PPF samma besök",
      },
    ],
    faqs: [
      {
        question: "Kan man ta bort gula strålkastare med tandkräm?",
        answer:
          "Tandkräm kan ge lite klarare glas en kort tid, men oxidationen längre in sitter kvar och inget UV-skydd läggs på. Gulnaden kommer därför snabbt tillbaka.",
        href: "/stralkastarpolering",
        linkLabel: "Polera strålkastare själv eller låta proffs göra det",
      },
      {
        question: "Är det smuts eller fukt på insidan när strålkastaren är gul?",
        answer:
          "Nästan aldrig. Gulnaden sitter i plasten på utsidan. Känns ytan sträv och blir trasan gul när du gnuggar med lite polish är det oxidation. Imma eller droppar på insidan är fukt och behöver åtgärdas på verkstad.",
      },
      {
        question: "Måste man byta gula strålkastare?",
        answer:
          "Nej, så länge glaset är helt och inte har fukt på insidan. Polering kostar 899 kr/par, mot ofta 5 000–20 000 kr styck för nya enheter.",
        href: "/byta-stralkastare-pris",
        linkLabel: "Byta eller polera – prisjämförelse",
      },
    ],
    compareSlider: true,
    related: [
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "stralkastare-besiktning", label: "Strålkastare och besiktning" },
      { slug: "byta-stralkastare-pris", label: "Byta eller polera" },
      { slug: "ppf", label: "PPF-folie" },
      { slug: "priser", label: "Priser" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "stralkastare-besiktning",
    kind: "other",
    title: "Strålkastare och besiktning: anmärkning för matta glas?",
    description:
      "Vad kontrolleras på strålkastarna vid besiktningen, när matta eller gula glas ger anmärkning och hur du fixar det före efterkontrollen. Polering 899 kr/par.",
    h1: "Strålkastare och besiktning",
    lead: "Vid besiktningen kontrolleras att strålkastarna fungerar, sitter rätt och ger en korrekt ljusbild. Gulnade, matta eller spruckna glas försämrar ljusbilden och är en vanlig orsak till anmärkning. Det mesta går att åtgärda på en timme.",
    sections: [
      {
        heading: "Vad kontrolleras på strålkastarna?",
        paragraphs: [
          "Besiktningsteknikern tittar på hela belysningen, inte bara på om lamporna lyser.",
        ],
        bullets: [
          "Att halvljus, helljus och övriga lampor fungerar",
          "Att strålkastarna är rätt inställda och ger en korrekt ljusbild",
          "Glasens skick: sprickor, kraftig oxidation och skador som påverkar ljuset",
          "Att strålkastarna sitter fast och har rätt typ av ljuskälla",
        ],
      },
      {
        heading: "Kan matta eller gula strålkastare ge anmärkning?",
        paragraphs: [
          "Ja, om glasen är så matta eller gula att ljusbilden påverkas. Oxiderad plast sprider ljuset, vilket ger kortare räckvidd och mer bländning för mötande trafik.",
          "Lätt gulnade glas brukar inte ge anmärkning, men de blir sämre för varje säsong. Det är billigare och enklare att polera i tid än att vänta tills glaset ger anmärkning.",
        ],
        href: "/gula-stralkastare",
        linkLabel: "Gula strålkastare: orsak och åtgärd",
      },
      {
        heading: "Fick du anmärkning? Så gör du",
        paragraphs: [
          "Blir bilen underkänd har du normalt en månad på dig att åtgärda felet och göra en efterkontroll. Gäller anmärkningen matta eller gula glas räcker polering i de flesta fall.",
          "Vi kommer till din adress i Stockholms län, polerar och lägger UV-keramiskt skydd för 899 kr/par. Det tar cirka en timme och det finns ofta lediga tider samma vecka.",
        ],
        href: "/#booking",
        linkLabel: "Boka tid",
      },
      {
        heading: "Ändras inställningen när strålkastarna poleras?",
        paragraphs: [
          "Nej. Vi arbetar bara på glasets utsida och rör inte infästning eller justering. Var strålkastarna felinställda redan före poleringen behöver de ställas in på en verkstad.",
          "Är lampan trasig, glaset sprucket eller enheten full av fukt hjälper inte polering. Då säger vi det innan vi börjar.",
        ],
      },
      {
        heading: "Inför besiktningen: snabb checklista",
        paragraphs: ["Gör en koll några dagar innan, gärna i mörker mot en vägg."],
        bullets: [
          "Testa halvljus, helljus, parkeringsljus, blinkers och bromsljus",
          "Titta efter gula, matta eller spruckna glas och imma på insidan",
          "Kontrollera att ljusbilden ser jämn ut på båda sidor",
          "Torka bort smuts och vägsalt från glasen",
        ],
      },
    ],
    faqs: [
      {
        question: "Blir bilen underkänd för gula strålkastare?",
        answer:
          "Det beror på hur mycket ljusbilden påverkas. Kraftigt gulnade eller matta glas kan ge anmärkning, lätt gulnade brukar inte göra det. Polering återställer klarheten i de flesta fall.",
      },
      {
        question: "Klarar bilen besiktningen efter polering?",
        answer:
          "I de flesta fall ja, när anmärkningen gällde matta eller gula glas. Polering tar bort oxidationen så att ljuset kommer ut som det ska. Felinställning, trasiga lampor och sprickor behöver åtgärdas separat.",
      },
      {
        question: "Hur snabbt kan ni komma före en efterkontroll?",
        answer:
          "Det finns ofta lediga tider samma vecka, vardagar efter 16 och helger 08–20. Välj tid i kalendern eller ring 076-344 11 68.",
        href: "/#booking",
        linkLabel: "Se lediga tider",
      },
    ],
    related: [
      { slug: "gula-stralkastare", label: "Gula strålkastare" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "stralkastarrenovering", label: "Strålkastarrenovering" },
      { slug: "byta-stralkastare-pris", label: "Byta eller polera" },
      { slug: "priser", label: "Priser" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "byta-stralkastare-pris",
    kind: "other",
    title: "Byta strålkastare – pris jämfört med att polera dem",
    description:
      "Vad kostar det att byta strålkastare? Ofta 5 000–20 000 kr styck med montering. Se när det räcker att polera för 899 kr/par och när ett byte behövs.",
    h1: "Byta strålkastare eller polera?",
    lead: "En ny strålkastare kostar ofta 5 000–20 000 kr styck med montering. Är glaset bara gult, matt eller repigt räcker det nästan alltid att polera båda sidorna för 899 kr/par.",
    sections: [
      {
        heading: "Vad kostar det att byta strålkastare?",
        paragraphs: [
          "Priset beror på bilmodell och teknik. Halogenstrålkastare är billigast, xenon och LED dyrare, och adaptiva matrisstrålkastare kan kosta betydligt mer än 20 000 kr styck.",
          "Till delen kommer montering. På många bilar måste stötfångaren av för att komma åt, vilket tar verkstadstid, och efter bytet ska strålkastaren ställas in.",
        ],
        bullets: [
          "Originalenhet: ofta 5 000–20 000 kr styck plus montering",
          "Eftermarknadsenhet: billigare, men passform och ljusbild varierar",
          "Begagnad enhet: billig, men ofta lika gammal och snart lika gul",
          "Polering av båda sidorna hos oss: 899 kr/par på din adress",
        ],
      },
      {
        heading: "När räcker det att polera?",
        paragraphs: [
          "När problemet sitter på glasets utsida: gul ton, matt eller mjölkig yta, fina repor och lätta stenskott. Vi slipar bort det skadade skiktet, polerar och lägger UV-keramiskt skydd. Du får 12 månaders garanti.",
        ],
        href: "/gula-stralkastare",
        linkLabel: "Gula strålkastare: orsak och åtgärd",
      },
      {
        heading: "När måste strålkastaren bytas?",
        paragraphs: ["Polering hjälper inte när felet sitter i själva enheten."],
        bullets: [
          "Spricka genom glaset",
          "Imma eller vatten på insidan som inte försvinner",
          "Trasiga fästen eller en enhet som sitter löst",
          "Bränd eller missfärgad reflektor på insidan",
        ],
      },
      {
        heading: "Räkneexempel",
        paragraphs: [
          "Två gulnade originalstrålkastare kan lätt kosta över 10 000 kr att byta, och mer med LED. Att polera båda kostar 899 kr och tar cirka en timme hemma hos dig.",
          "Byter du bara den ena sidan syns skillnaden mot den gamla direkt. Polerar du båda blir de lika.",
        ],
      },
      {
        heading: "Täcker försäkringen nya strålkastare?",
        paragraphs: [
          "Gulnade och matta glas räknas som slitage och täcks normalt inte. Stenskott eller trafikskada kan däremot gå på vagnskadeförsäkringen, beroende på villkor och självrisk. Fråga ditt försäkringsbolag.",
        ],
      },
    ],
    faqs: [
      {
        question: "Vad kostar en ny strålkastare?",
        answer:
          "Ofta 5 000–20 000 kr styck för en originalenhet, plus montering och inställning. LED- och matrisstrålkastare kan kosta mer.",
      },
      {
        question: "Kan man byta bara glaset på strålkastaren?",
        answer:
          "På vissa modeller finns separata glas, men de sitter limmade och enheten måste öppnas och tätas om. Det är ofta dyrare och mer riskabelt än att polera.",
      },
      {
        question: "Är det billigare att polera än att byta?",
        answer:
          "Ja, så länge glaset är helt. Polering med UV-skydd kostar 899 kr/par hos oss, med 12 månaders garanti.",
        href: "/priser",
        linkLabel: "Se alla priser",
      },
    ],
    compareSlider: true,
    related: [
      { slug: "gula-stralkastare", label: "Gula strålkastare" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "priser", label: "Priser" },
      { slug: "stralkastare-besiktning", label: "Strålkastare och besiktning" },
      { slug: "ppf", label: "PPF-folie" },
      { slug: "faq", label: "FAQ" },
    ],
  },
];
