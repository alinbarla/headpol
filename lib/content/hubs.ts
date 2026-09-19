import type { ClusterDoc } from "@/lib/content/types";
import { bookingUrl, PRODUCTS } from "@/lib/products";

export const HUB_PAGES: ClusterDoc[] = [
  {
    slug: "stralkastarpolering",
    kind: "service-polering",
    title: "Polera strålkastare – 899 kr/par, 12 mån garanti",
    description:
      "Polera strålkastare mobil i Stockholm: 899 kr/par, UV-keramiskt skydd och 12 månaders garanti. Vi kommer till dig.",
    h1: "Polera strålkastare",
    lead: "När folk säger att de vill polera strålkastare menar de nästan alltid samma sak: glasen har blivit gula eller mjölkiga och de vill ha blanka strålkastare igen. Det är inte smuts. Det är plasten som oxiderat — och det går att fixa utan att byta hela enheten.",
    sections: [
      {
        heading: "Vad som egentligen hänt med glaset",
        paragraphs: [
          "Moderna strålkastare är polykarbonat. Fabriken lade ett tunt UV-skydd som solen sakta nöter bort. När skyddet är borta oxiderar plasten en bit in, inte bara på ytan. En trasa och polish räcker därför sällan mer än någon vecka.",
          "Att polera strålkastare på riktigt betyder att ta bort det skadade skiktet, polera tillbaka klarheten och lägga ett nytt skydd. Utan det sista steget gulnar plasten fort igen.",
        ],
      },
      {
        heading: "Vem det passar att polera strålkastare för",
        paragraphs: [
          "De flesta moderna bilar och motorcyklar har strålkastare av polykarbonat. Du kan polera strålkastare så länge glaset inte är sprucket eller fyllt med fukt på insidan.",
        ],
        bullets: [
          "Gulnade eller mjölkiga glas före besiktning",
          "Sämre ljus på landsväg och i regn",
          "Bilen ska säljas eller lämnas i inbyte",
          "Du vill slippa byta dyra originalenheter",
        ],
      },
      {
        heading: "Polera strålkastare själv eller låta proffs göra det",
        paragraphs: [
          "Kit från affären kan se bra ut i några veckor när du försöker polera strålkastare själv. Många saknar ett UV-skydd som faktiskt ersätter fabrikslackeringen. Slipningen tar bort det som fanns kvar av originalskyddet, så utan nytt skydd kommer gulnaden tillbaka.",
          "Vi slipar vått från P400 upp till P3000, polerar med polymer och lägger UV-keramiskt skydd. Det är därför vi kan lämna 12 månaders garanti. Ett kit på uppfarten ger sällan samma sak.",
        ],
      },
      {
        heading: "När glaset inte går att rädda",
        paragraphs: [
          "Spricka genom plasten, imma på insidan eller en enhet som sitter fel går inte att polera bort. Då säger vi det innan vi börjar och tar inte betalt — hellre än att polera strålkastare som inte blir bättre.",
          "Ytliga repor och hela oxidationen går däremot. Osäker? Skicka en bild eller vänta tills vi tittar på plats.",
        ],
      },
      {
        heading: "När ska man boka att polera strålkastare?",
        paragraphs: [
          "Boka när glasen syns gula i dagsljus, när ljusbilden känns svag på landsväg, eller inför besiktning och försäljning. Ju tidigare du polerar strålkastare efter att UV-skyddet slitits, desto enklare är slipningen.",
          "Ett par strålkastare kostar 899 kr inklusive moms, UV-keramiskt skydd och 12 månaders garanti. Vill du ha extra skydd mot stenskott finns PPF-folie och paketet polering + PPF. Ett vanligt poleringsjobb tar 45–60 minuter. Du kan vänta eller lämna bilen.",
          "Samma pris i hela vårt område. Ingen zonavgift för kommunerna i Stockholms län vi tar — från Solna och Sundbyberg till Södertälje, Värmdö och Nynäshamn.",
        ],
      },
    ],
    faqs: [
      {
        question: "Hur får man blanka strålkastare som håller när man polerar strålkastare?",
        answer:
          "Slipning tills oxidationen är borta, sedan polering och ett UV-skydd som faktiskt sitter. Puts på ytan ger glans en kort tid. Skyddet är det som gör att ytan inte gulnar igen efter några månader.",
      },
      {
        question: "Kan man polera strålkastare som är matta?",
        answer:
          "Ja. Matt yta är oxidation i plasten. När vi polerar strålkastare slipar vi bort skiktet och polerar tillbaka klarheten, sedan lägger vi UV-skydd så det inte återgår på några månader.",
      },
      {
        question: "Måste jag lämna in bilen för att polera strålkastare?",
        answer:
          "Nej. Vi kommer till den adress du anger: uppfart, arbetsplats eller innergård, så länge bilen står utomhus och vi kommer åt båda sidorna.",
      },
    ],
    compareSlider: true,
    related: [
      { slug: "stralkastarrenovering", label: "Strålkastarrenovering" },
      { slug: "ppf", label: "PPF-folie" },
      { slug: "polering-ppf", label: "Polering + PPF" },
      { slug: "priser", label: "Priser" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
      { slug: "stralkastarpolering-huddinge", label: "Huddinge" },
      { slug: "stralkastarpolering-solna", label: "Solna" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "stralkastarrenovering",
    kind: "service-renovering",
    title: "Strålkastarrenovering – 899 kr/par, 12 mån garanti",
    description:
      "Strålkastarrenovering i Stockholm: 899 kr/par, UV-keramiskt skydd och 12 månaders garanti. Slipning, polering och när det inte fungerar.",
    h1: "Strålkastarrenovering",
    lead: "En strålkastarrenovering är hela återställningen — mer än att bara polera strålkastare till tillfällig glans. Slipning, polering och nytt UV-skydd räknas. Här är processen, materialen och gränserna för vad som går att rädda.",
    sections: [
      {
        heading: "Restaurering är samma sak",
        paragraphs: [
          "En del söker på strålkastare restaurering. Det är samma jobb: ta bort den oxiderade plasten och skydda den på nytt. Vi säger renovering i telefonen, men stegen är desamma.",
        ],
      },
      {
        heading: "Varför strålkastare blir gula",
        paragraphs: [
          "Moderna strålkastarglas är polykarbonat, inte glas. Materialet är slagtåligt men känsligt för UV. Fabriken lägger ett tunt hard-coat som tar emot solen. När det lagret spricker och nöts börjar plasten oxidera.",
          "Oxidationen gör ytan mikroojämn. Ljuset sprids i plasten i stället för att gå rakt ut. Därför ser du gult, mjölkigt sken och en svagare ljusbild på vägen, även om lampan själv är hel.",
        ],
      },
      {
        heading: "Oxidation och polykarbonat",
        paragraphs: [
          "Det gula sitter i plasten, typiskt tiondels millimeter in. Putsmedel på ytan tar bara det yttersta. Därför slipar vi stegvis: grovt nog för att ta oxidationen, fint nog för att inte lämna djupa repor som syns när ljuset tänds.",
          "Polykarbonat tål inte för aggressiv värme. Vi arbetar vått, med kontrollerat tryck, och går från P400 upp till P3000 innan polymerpoleringen.",
        ],
      },
      {
        heading: "Så går jobbet till",
        paragraphs: [
          "Maskering skyddar lack och lister. Våtslipning tar oxidationen. Polymerpolering återställer djup och glans. UV-keramiskt skydd ersätter fabrikens hard-coat. Till sist kontrollerar vi finish och ljusbild i dagsljus.",
          "Utan det sista steget gulnar plasten igen inom några månader. Slipningen har tagit bort det som fanns kvar av originalskyddet. Därför ingår skyddet alltid, och därför kan vi lämna 12 månaders garanti.",
        ],
        bullets: [
          "Maskering och rengöring",
          "Våtslipning P400–P3000",
          "Polymerpolering",
          "UV-keramiskt skydd",
          "Kontroll av ljusbild och finish",
        ],
      },
      {
        heading: "Hur länge håller en strålkastarrenovering?",
        paragraphs: [
          "Med UV-keramiskt skydd och normal biltvätt håller finishen i flera år. Garantin är 12 månader. Parkering ute i söderläge, högtryck mot kanten och slipande tvättanläggningar sliter snabbare, men skyddet är till för just det.",
        ],
      },
      {
        heading: "När renovering inte fungerar",
        paragraphs: [
          "Spricka genom glaset, inre fukt, spräckt infästning eller en lampa som sitter fel internt går inte att polera bort. Då säger vi det innan vi börjar och tar inte betalt för ett jobb som inte hjälper.",
          "Kraftigt stenskott kan lämna en grop även efter slipning. Ytliga repor och hela oxidationen går däremot att ta.",
        ],
      },
      {
        heading: "Pris och bokning",
        paragraphs: [
          "Personbil 899 kr/par. Samma fast pris oavsett kommun i vårt område. Boka i kalendern eller ring, så kommer vi till dig.",
        ],
      },
    ],
    faqs: [
      {
        question: "Vad är skillnaden mellan polering och strålkastarrenovering?",
        answer:
          "Polering är momentet som tar bort oxidationen. Renovering är hela kedjan med slipning, polering och nytt UV-skydd. Vi gör alltid hela kedjan.",
      },
      {
        question: "Kan man renovera strålkastare själv?",
        answer:
          "Kit finns, men de flesta saknar ett UV-skydd som faktiskt ersätter fabrikslackeringen. Utan det gulnar plasten snabbt igen efter slipning.",
      },
      {
        question: "Kan man renovera strålkastare i Stockholm?",
        answer:
          "Ja. Vi gör hela kedjan på den adress du anger i länet: uppfart, innergård eller arbetsplats, så länge bilen står ute och nosen är fri.",
        href: "/stralkastarpolering-stockholm",
        linkLabel: "Områden vi åker till i Stockholm",
      },
    ],
    images: [
      {
        src: "/images/step-map/sanding.webp",
        alt: "Våtslipning av oxiderad strålkastare",
        caption: "Våtslipning tar det oxiderade skiktet, inte bara ytan.",
      },
      {
        src: "/images/step-map/ceramic.webp",
        alt: "UV-keramiskt skydd på nypolerad strålkastare",
        caption: "UV-keramiskt skydd ersätter fabrikens hard-coat.",
      },
    ],
    related: [
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "ppf", label: "PPF-folie" },
      { slug: "polering-ppf", label: "Polering + PPF" },
      { slug: "fore-bilder", label: "Före och efter" },
      { slug: "priser", label: "Priser" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "priser",
    kind: "other",
    title: "Priser: polering 899 kr, PPF 1899 kr, paket 2599 kr",
    description:
      "Fast pris i Stockholms län: polera strålkastare 899 kr/par, PPF-folie 1899 kr/par, polering + PPF 2599 kr/par. 12 månaders garanti. Ingen zonavgift.",
    h1: "Priser för strålkastare",
    lead: "Tre fasta priser per par, inklusive moms. Polering 899 kr, PPF-folie 1899 kr, paketet 2599 kr. Samma pris i hela Stockholmsområdet.",
    priceTiers: [
      {
        title: PRODUCTS.polering.nameSv,
        description:
          "Slipning, polering och UV-skydd av båda strålkastarna. Vi kommer till din adress. Ingen startavgift och ingen milersättning inom området.",
        oldPrice: PRODUCTS.polering.listPriceLabel,
        price: PRODUCTS.polering.priceLabel,
        unit: PRODUCTS.polering.unit,
        badge: "Mest bokad",
        includes: [
          "Båda strålkastarna",
          "Maskering och våtslipning",
          "Polymerpolering",
          "UV-keramiskt skydd",
          "Kontroll av ljusbild",
          "12 månaders garanti",
        ],
        href: bookingUrl("polering"),
        cta: "Boka tid",
        moreHref: `/${PRODUCTS.polering.slug}`,
        moreCta: "Läs mer",
      },
      {
        title: PRODUCTS.ppf.nameSv,
        description:
          "Skyddsfolie på båda strålkastarna. Passar när glaset redan är klart, eller som extra skydd efter polering.",
        oldPrice: PRODUCTS.ppf.listPriceLabel,
        price: PRODUCTS.ppf.priceLabel,
        unit: PRODUCTS.ppf.unit,
        includes: [
          "Båda strålkastarna",
          "PPF-folie (TPU)",
          "Skydd mot stenskott och ny UV-skada",
          "12 månaders garanti",
        ],
        href: bookingUrl("ppf"),
        cta: "Boka tid",
        moreHref: `/${PRODUCTS.ppf.slug}`,
        moreCta: "Läs mer",
      },
      {
        title: PRODUCTS["polering-ppf"].nameSv,
        description:
          "Vi polerar först och lägger PPF-folie samma besök. 199 kr billigare än att boka dem var för sig.",
        oldPrice: PRODUCTS["polering-ppf"].listPriceLabel,
        price: PRODUCTS["polering-ppf"].priceLabel,
        unit: PRODUCTS["polering-ppf"].unit,
        featured: true,
        badge: "Paket · spara 199 kr",
        includes: [
          "Båda strålkastarna",
          "Hela poleringskedjan",
          "PPF-folie ovanpå",
          "Samma besök",
          "12 månaders garanti",
        ],
        href: bookingUrl("polering-ppf"),
        cta: "Boka tid",
        moreHref: `/${PRODUCTS["polering-ppf"].slug}`,
        moreCta: "Läs mer",
      },
    ],
    sections: [
      {
        heading: "Renovera eller byta",
        paragraphs: [
          "Nya originalstrålkastare ligger ofta på 5 000–20 000 kr styck plus montering, särskilt på bilar med LED eller adaptivt ljus. En renovering kostar 899 kr för paret när plasten är oxiderad men hel.",
          "Byte är rätt val när glaset är sprucket, svetsat fel eller har fukt inuti. Då hjälper inte polering, och vi tar inte betalt för att konstatera det.",
        ],
      },
      {
        heading: "Betalning",
        paragraphs: [
          "Du betalar vid bokning med kort eller Swish via Stripe. Avbokning senast 24 timmar före tiden ger pengarna tillbaka. Villkoren står på villkorssidan.",
        ],
      },
    ],
    faqs: [
      {
        question: "Är det billigare att renovera än att byta?",
        answer:
          "Ja, så länge glaset är helt. Polering 899 kr/par, PPF 1899 kr/par, paket 2599 kr/par — mot ofta femsiffriga belopp per sida för nya enheter.",
      },
      {
        question: "Kostar det extra utanför innerstan?",
        answer:
          "Nej. Alla kommuner i Stockholms län vi åker till — bland annat Huddinge, Botkyrka, Tumba, Södertälje, Haninge, Nacka, Solna, Täby och Värmdö — har samma fastpris.",
      },
    ],
    related: [
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "ppf", label: "PPF-folie" },
      { slug: "polering-ppf", label: "Polering + PPF" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "ppf",
    kind: "service-ppf",
    title: "PPF-folie för strålkastare – 1899 kr/par, Stockholm",
    description:
      "PPF-folie på strålkastare i Stockholms län: 1899 kr/par (ord. 2499 kr). TPU-skydd mot stenskott och ny UV-skada. Vi kommer till din adress.",
    h1: "PPF-folie för strålkastare",
    lead: "PPF är en klar TPU-folie som sitter på strålkastarglaset. Den tar stenskott och ny UV-belastning så att polykarbonatet under inte oxiderar om. Det är inte samma sak som UV-keramiskt skydd efter polering — folien är ett fysiskt skikt, inte en beläggning.",
    sections: [
      {
        heading: "Vad PPF gör på en strålkastare",
        paragraphs: [
          "Strålkastarglas är polykarbonat. När fabrikens hard-coat är borta tar solen och vägsmuts i plasten. PPF-folie lägger ett offerlager utanpå: stenskott och mikrosprickor stannar i filmen i stället för i glaset.",
          "Filmen är optiskt klar när den är rätt applicerad. Den ersätter inte en lampa som redan är mjölkig inuti. Den skyddar en yta som redan är klar — eller en yta vi just polerat.",
        ],
      },
      {
        heading: "PPF eller UV-keramiskt skydd",
        paragraphs: [
          "UV-keramiskt skydd är det tunna skiktet vi alltid lägger efter polering. Det bromsar gulning men är inte ett pansar mot stenskott.",
          "PPF är tjockare. Den tar träffar som keramik inte klarar. Därför finns den som eget jobb när glaset redan är blankt, och som sista steg i paketet polering + PPF.",
        ],
      },
      {
        heading: "När räcker folie utan polering",
        paragraphs: [
          "Om glaset redan är klart — nyare bil, nyligen polerat, ingen synlig gulnad — kan vi lägga PPF direkt. Då betalar du 1899 kr för paret.",
          "Är plasten gul, mjölkig eller matt måste oxidationen bort först. Folie på oxiderat glas låser in diset. Då är paketet rätt val: vi polerar och lägger filmen samma besök.",
        ],
        bullets: [
          "Klara glas: PPF räcker ofta",
          "Gulnade eller matta glas: polera först",
          "Spricka eller fukt inuti: varken polering eller PPF hjälper",
        ],
      },
      {
        heading: "Pris och bokning",
        paragraphs: [
          "PPF-folie kostar 1899 kr för båda strålkastarna, ned från 2499 kr. Moms och 12 månaders garanti ingår. Samma pris i hela området vi tar. Boka i kalendern eller ring.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kan man lägga PPF på gula strålkastare?",
        answer:
          "Inte som enda åtgärd. Gulnad sitter i plasten. Folie ovanpå låser in diset. Polera först, eller boka paketet polering + PPF.",
      },
      {
        question: "Vad är skillnaden mellan PPF och keramiskt UV-skydd?",
        answer:
          "Keramiskt skydd är en tunn beläggning efter polering. PPF är en TPU-folie, ett fysiskt skikt som tar stenskott. De kompletterar varandra, de är inte samma produkt.",
      },
      {
        question: "Hur länge håller PPF på strålkastare?",
        answer:
          "Vi lämnar 12 månaders garanti, samma som på polering. Filmen är till för att ta träffar och UV så att glaset under inte oxiderar om.",
      },
      {
        question: "Måste jag lämna in bilen?",
        answer:
          "Nej. Vi kommer till den adress du anger, så länge bilen står utomhus och vi kommer åt båda sidorna.",
      },
      {
        question: "Vad kostar PPF-folie för strålkastare?",
        answer:
          "1899 kr för båda sidorna, ned från 2499 kr. Paketet med polering samma besök kostar 2599 kr.",
      },
    ],
    related: [
      { slug: "polering-ppf", label: "Polering + PPF" },
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "priser", label: "Priser" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "polering-ppf",
    kind: "service-combo",
    title: "Polering + PPF – 2599 kr/par, 12 mån garanti",
    description:
      "Polera strålkastare och lägg PPF-folie samma besök i Stockholm: 2599 kr/par (ord. 3499 kr). Sparar 199 kr mot att boka var för sig.",
    h1: "Polering + PPF för strålkastare",
    lead: "Paketet är ett besök: vi tar bort oxidationen, polerar till klar yta och lägger PPF-folie ovanpå. Du betalar 2599 kr för paret — 199 kr mindre än 899 + 1899 om du bokar jobben separat.",
    sections: [
      {
        heading: "Varför samma besök",
        paragraphs: [
          "PPF ska sitta på en klar yta. Om glaset är gult måste vi polera först, annars syns diset genom filmen. Att göra båda på en gång betyder en uppställning, en maskering och en kontroll av ljusbilden.",
          "Separata bokningar fungerar, men du betalar mer och bilen ska stå framme två gånger.",
        ],
      },
      {
        heading: "Vem paketet passar",
        paragraphs: [
          "Det är rätt val när glasen är matta eller gula och du vill att resultatet ska tåla stenskott och UV efteråt — inför besiktning, försäljning eller bara för att slippa göra om poleringen i tid.",
          "Redan klara glas behöver sällan hela kedjan. Då räcker PPF. Sprucket glas eller fukt inuti går inte att rädda med något av jobben.",
        ],
        bullets: [
          "Gulnade glas som också ska skyddas",
          "Besiktning plus längre skydd mot ny skada",
          "Ett besök i stället för två",
        ],
      },
      {
        heading: "Så går det till",
        paragraphs: [
          "Först samma poleringskedja som på poleringssidan: maskering, våtslipning, polymerpolering och UV-keramiskt skydd. Därefter PPF-folie på båda sidorna. Du kan vänta eller lämna bilen.",
        ],
      },
      {
        heading: "Pris",
        paragraphs: [
          "2599 kr för paret, ned från 3499 kr. Moms och 12 månaders garanti ingår. Samma pris i hela Stockholmsområdet vi tar. Boka paketet i kalendern.",
        ],
      },
    ],
    faqs: [
      {
        question: "Varför är paketet billigare än polering och PPF var för sig?",
        answer:
          "Restid, maskering och uppställning sker en gång. 2599 kr mot 899 + 1899 kr.",
      },
      {
        question: "Kan jag bara polera nu och lägga PPF senare?",
        answer:
          "Ja. Boka polering först. När du vill ha folie bokar du PPF. Paketet är billigare om du redan vet att du vill ha båda.",
      },
      {
        question: "Ingår 12 månaders garanti?",
        answer:
          "Ja. Samma garanti som på polering och PPF var för sig.",
      },
      {
        question: "Hur lång tid tar polering + PPF?",
        answer:
          "Samma kalenderlucka som övriga jobb. Du kan vänta eller lämna bilen utomhus med plats runt båda strålkastarna.",
      },
      {
        question: "Kommer ni till mig?",
        answer:
          "Ja, i Stockholms län (inte Norrtälje och inte Sigtuna kommun). Ingen zonavgift.",
      },
    ],
    related: [
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "ppf", label: "PPF-folie" },
      { slug: "priser", label: "Priser" },
      { slug: "stralkastarrenovering", label: "Så går poleringen till" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "fore-bilder",
    kind: "other",
    title: "Före och efter: polera strålkastare – 899 kr/par, 12 mån garanti",
    description:
      "Bilder före och efter när vi polerar strålkastare. 899 kr/par, UV-keramiskt skydd och 12 månaders garanti. Oxiderad plast mot klar yta.",
    h1: "Före och efter att polera strålkastare",
    lead: "Så ser det ut när vi polerar strålkastare: oxiderad, gul plast före — klar yta efter slipning, polering och UV-keramiskt skydd. Samma resultat på din uppfart.",
    sections: [
      {
        heading: "Vad bilderna visar",
        paragraphs: [
          "Före: gulnad, mjölkig polykarbonat där ljuset sprids i ytan. Efter: klar plast efter våtslipning, polymerpolering och UV-keramiskt skydd. Jobbet tar ungefär en timme på plats.",
          "Vi publicerar inte påhittade kundnamn eller städer på bilderna. Fler steg i processen finns på sidan om strålkastarrenovering.",
        ],
      },
    ],
    compareSlider: true,
    related: [
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "ppf", label: "PPF-folie" },
      { slug: "polering-ppf", label: "Polering + PPF" },
      { slug: "priser", label: "Priser" },
    ],
  },
  {
    slug: "faq",
    kind: "faq",
    title: "FAQ: polera strålkastare – 899 kr/par, 12 mån garanti",
    description:
      "FAQ om att polera strålkastare: 899 kr/par, 12 månaders garanti, matta glas, gulnad, besiktning, byte, DIY och mobil service i Stockholm.",
    h1: "Vanliga frågor om att polera strålkastare",
    lead: "Här är svaren vi ger oftast när kunder vill polera strålkastare: matta och gulnade glas, besiktning, pris, byte mot renovering, sprickor, kit hemma och mobil service i Stockholm.",
    sections: [
      {
        heading: "Sökintention och längre svar",
        paragraphs: [
          "Frågorna nedan är skrivna som folk ställer dem: matta glas, gula glas, besiktning, byte kontra renovering. Svaren är desamma som vi ger i telefon innan vi rullar ut.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kan man polera strålkastare själv?",
        answer:
          "Kit kan se bra ut i några veckor. De flesta saknar ett UV-skydd som faktiskt ersätter fabrikslackeringen. Vi slipar till P3000 och lägger skyddet som gör att vi kan lämna 12 månaders garanti.",
      },
      {
        question: "Vad är skillnaden mot strålkastare restaurering?",
        answer:
          "Ingen, i praktiken. Restaurering och renovering är samma jobb: slipning, polering och nytt UV-skydd. Polering är bara ett av stegen.",
      },
      {
        question: "Kan man polera matta strålkastare?",
        answer:
          "Ja. Matt yta är oxidation i polykarbonatet. Vi slipar bort skiktet, polerar och lägger UV-skydd. Smuts på utsidan räcker det att tvätta. Det här är när tvätt inte hjälper.",
      },
      {
        question: "Varför blir strålkastare gula?",
        answer:
          "UV bryter ner fabrikens hard-coat. Därefter oxiderar plasten och blir gul och mjölkig. Det är därför nytt UV-skydd alltid ingår efter slipning.",
      },
      {
        question: "Hur länge håller en strålkastarrenovering?",
        answer:
          "Med UV-keramiskt skydd lämnar vi 12 månaders garanti. Utan skydd efter slipning börjar gulnaden ofta synas inom några månader.",
      },
      {
        question: "Vad kostar det att byta strålkastare?",
        answer:
          "Ofta 5 000–20 000 kr styck plus montering, mer på LED- och matrix-enheter. Renovering av paret är 899 kr när glaset är oxiderat men helt.",
      },
      {
        question: "Är det billigare att renovera strålkastaren än att byta den?",
        answer:
          "Ja, i nästan alla fall där plasten inte är sprucken. Byte bara när glaset är sönder eller fuktig inuti.",
      },
      {
        question: "Kan man klara besiktningen med matta strålkastare?",
        answer:
          "Kraftigt gulnade eller matta glas är en vanlig anmärkning eftersom ljusbilden blir sämre. Efter renovering går de flesta igenom på den punkten. Vi kan inte lova utfallet av hela besiktningen.",
      },
      {
        question: "Kan spruckna strålkastare renoveras?",
        answer:
          "Ytliga repor ja. Spricka genom materialet eller imma på insidan nej. Då säger vi nej på plats.",
      },
      {
        question: "Vad är skillnaden mellan polering och strålkastarrenovering?",
        answer:
          "Polering är ett moment. Renovering är maskering, slipning, polering och UV-skydd. Vi säljer inte polering utan de andra stegen.",
      },
      {
        question: "Hur lång tid tar det?",
        answer:
          "Cirka 45–60 minuter för en personbil. Bilen behöver stå utomhus och vara åtkomlig från båda sidorna.",
      },
      {
        question: "Vad kostar PPF-folie för strålkastare?",
        answer:
          "1899 kr för båda strålkastarna, ned från 2499 kr. Gulnade glas måste poleras först — då är paketet polering + PPF 2599 kr.",
      },
      {
        question: "Vad är skillnaden mellan PPF och UV-keramiskt skydd?",
        answer:
          "UV-keramiskt skydd är en tunn beläggning efter polering. PPF är en TPU-folie, ett fysiskt skikt som tar stenskott. De är inte samma sak.",
      },
      {
        question: "Kommer ni till mig?",
        answer:
          "Ja, i Stockholms län (inte Norrtälje och inte Sigtuna kommun). Vi har lokala sidor för kommunerna och tätorter vi tar — bland annat Huddinge, Flemingsberg, Botkyrka, Tumba, Tullinge, Södertälje, Haninge, Handen, Nacka, Sickla, Solna, Arenastaden, Sundbyberg, Täby, Lidingö, Sollentuna, Tureberg och Värmdö. Samma pris, ingen zonavgift.",
      },
    ],
    related: [
      { slug: "stralkastarpolering", label: "Polera strålkastare" },
      { slug: "ppf", label: "PPF-folie" },
      { slug: "polering-ppf", label: "Polering + PPF" },
      { slug: "priser", label: "Priser" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
    ],
  },
  {
    slug: "om-oss",
    kind: "other",
    title: "Om oss – polera strålkastare 899 kr/par, 12 mån garanti",
    description:
      "Vi kommer till dig och polerar strålkastare i Stockholms län. Fast pris 899 kr/par, UV-keramiskt skydd och 12 månaders garanti — ingen inlämningsverkstad.",
    h1: "Om oss",
    lead: "Vi är en mobil tjänst som hjälper dig polera strålkastare där bilen står. Fast pris, UV-keramiskt skydd och 12 månaders garanti i Stockholms län.",
    compareSlider: true,
    sections: [
      {
        heading: "Hur vi arbetar",
        paragraphs: [
          "Varje jobb är samma kedja: maskering av lack, våtslipning från P400 till P3000, polymerpolering och UV-keramiskt skydd. Inget halvfabrikat och ingen ‘snabbglans’ som saknar skydd.",
          "Bilen ska stå utomhus, torr nog att arbeta på och med plats runt båda strålkastarna. Innergård, villauppfart och företagsparkering går bra. Vi arbetar lördag–söndag 08–20 och måndag–fredag 16–20.",
        ],
      },
      {
        heading: "Material och metod",
        paragraphs: [
          "Polykarbonat kräver både mekanisk avverkning av oxidationen och ett nytt UV-skikt. Skyddet är det som gör att vi kan lämna 12 månaders garanti. Utan det vore slipningen bara ett tillfälligt lyft.",
        ],
      },
      {
        heading: "Garanti och tydligt pris",
        paragraphs: [
          "Polering 899 kr/par, PPF-folie 1899 kr/par och paketet 2599 kr/par — samma i hela området vi tar. Går inte glaset att rädda tar vi inte betalt. Avbokning senast 24 timmar före tiden.",
        ],
      },
      {
        heading: "Kontakt",
        paragraphs: [
          "Ring 076-344 11 68 eller mejla teo@stralkastarpolering.se. Bokning i kalendern på startsidan. Organisationsuppgifter och villkor finns på villkorssidan.",
        ],
      },
    ],
    related: [
      { slug: "stralkastarrenovering", label: "Metoden" },
      { slug: "priser", label: "Priser" },
      { slug: "ppf", label: "PPF-folie" },
      { slug: "stralkastarpolering-stockholm", label: "Områden i länet" },
    ],
  },
];
