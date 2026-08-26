import type { ClusterDoc } from "@/lib/content/types";

export const HUB_PAGES: ClusterDoc[] = [
  {
    slug: "stralkastarpolering",
    kind: "service-polering",
    title: "Strålkastarpolering i Stockholm – så fungerar det",
    description:
      "Strålkastarpolering tar bort gulnad, matt yta och repor från plaststrålkastare. Vi kommer till dig i Stockholm. 799 kr/par och 5 års garanti.",
    h1: "Strålkastarpolering i Stockholm",
    lead: "Strålkastarpolering är jobbet som tar bort oxidationen från plastglaset så att ljuset når vägen igen. Vi gör det på plats hos dig — hemma, på jobbet eller i garaget — och avslutar alltid med UV-keramiskt skydd.",
    sections: [
      {
        heading: "Vad strålkastarpolering faktiskt gör",
        paragraphs: [
          "När folk söker på strålkastarpolering menar de oftast att strålkastarna blivit gula, matta eller rökiga. Det är inte smuts på utsidan. Det är polykarbonatplasten som oxiderat efter att fabrikens UV-skydd slitits bort av solen.",
          "En riktig polering tar bort det skadade ytskiktet, återställer klarheten och lägger ett nytt skydd. En snabb puts med polish på ytan räcker inte — den gula plasten sitter i materialet, inte ovanpå det.",
        ],
      },
      {
        heading: "Vem det passar",
        paragraphs: [
          "De flesta moderna bilar, motorcyklar och mopeder har strålkastare av polykarbonat. De går att polera så länge glaset inte är sprucket eller fyllt med fukt på insidan.",
        ],
        bullets: [
          "Gulnade eller mjölkiga glas före besiktning",
          "Sämre ljus på landsväg och i regn",
          "Bilen ska säljas eller lämnas i inbyte",
          "Du vill slippa byta dyra originalenheter",
        ],
      },
      {
        heading: "Polering är ett moment — inte hela jobbet",
        paragraphs: [
          "Själva poleringen är steget där polymercompound tar bort de sista reporna efter slipningen. Utan våtslipning innan och UV-skydd efter blir resultatet kortlivat. Därför ingår alltid hela kedjan: maskering, slipning P400–P3000, polymerpolering och UV-keramiskt skydd.",
          "Behöver du den tekniska genomgången — varför plasten gulnar, när renovering inte fungerar och hur länge det håller — finns det på sidan om strålkastarrenovering.",
        ],
      },
      {
        heading: "Pris och tid",
        paragraphs: [
          "Ett par strålkastare på personbil kostar 799 kr inklusive moms, skydd och 5 års garanti. Motorcykel och moped från 499 kr. Ett vanligt jobb tar 45–60 minuter. Du kan vänta eller lämna bilen.",
          "Samma pris i hela vårt område. Ingen zonavgift för Huddinge, Tumba, Södertälje, Haninge, Nacka eller Solna.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kan man polera matta strålkastare?",
        answer:
          "Ja. Matt yta är oxidation i plasten. Vi slipar bort skiktet och polerar tillbaka klarheten, sedan lägger vi UV-skydd så det inte återgår på några månader.",
      },
      {
        question: "Måste jag lämna in bilen?",
        answer:
          "Nej. Vi kommer till den adress du anger — uppfart, garageuppfart, arbetsplats eller innergård så länge bilen står utomhus och vi kommer åt båda sidorna.",
      },
    ],
    related: [
      { slug: "stralkastarrenovering", label: "Strålkastarrenovering" },
      { slug: "priser", label: "Priser" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "stralkastarrenovering",
    kind: "service-renovering",
    title: "Strålkastarrenovering – oxidation, slipning och UV-skydd",
    description:
      "Så går en strålkastarrenovering till: varför strålkastare gulnar, polykarbonat, våtslipning, polering, UV-keramiskt skydd, livslängd och när det inte fungerar.",
    h1: "Strålkastarrenovering",
    lead: "Strålkastarrenovering är hela återställningen — inte bara en yta som får glans. Här är processen, materialen och gränserna för vad som går att rädda.",
    sections: [
      {
        heading: "Varför strålkastare blir gula",
        paragraphs: [
          "Moderna strålkastarglas är polykarbonat, inte glas. Materialet är slagtåligt men känsligt för UV. Fabriken lägger ett tunt hard-coat som tar emot solen. När det lagret spricker och nöts börjar plasten oxidera.",
          "Oxidationen gör ytan mikroojämn. Ljuset sprids i plasten i stället för att gå rakt ut. Därför ser du gult, mjölkigt sken och en svagare ljusbild på vägen — även om lampan själv är hel.",
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
          "Utan det sista steget gulnar plasten igen inom några månader — slipningen har tagit bort det som fanns kvar av originalskyddet. Därför ingår skyddet alltid, och därför kan vi lämna 5 års garanti.",
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
          "Med UV-keramiskt skydd och normal biltvätt håller finishen i flera år. Garantin är 5 år. Parkering ute i söderläge, högtryck mot kanten och slipande tvättanläggningar sliter snabbare — men skyddet är till för just det.",
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
          "Personbil 799 kr/par. Samma fast pris oavsett kommun i vårt område. Boka i kalendern eller ring — vi kommer till dig.",
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
    ],
    images: [
      {
        src: "/images/step-map/sanding.webp",
        alt: "Våtslipning av oxiderad strålkastare",
        caption: "Våtslipning tar det oxiderade skiktet — inte bara ytan.",
      },
      {
        src: "/images/step-map/ceramic.webp",
        alt: "UV-keramiskt skydd på nypolerad strålkastare",
        caption: "UV-keramiskt skydd ersätter fabrikens hard-coat.",
      },
    ],
    related: [
      { slug: "stralkastarpolering", label: "Strålkastarpolering" },
      { slug: "fore-bilder", label: "Före och efter" },
      { slug: "priser", label: "Priser" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "priser",
    kind: "other",
    title: "Pris för strålkastarpolering – 799 kr/par",
    description:
      "Fast pris för strålkastarpolering i Stockholm: 799 kr/par för personbil, från 499 kr för MC. Jämfört med att byta strålkastare. Ingen zonavgift.",
    h1: "Priser för strålkastarpolering",
    lead: "Ett par strålkastare på personbil kostar 799 kr inklusive moms. UV-keramiskt skydd och 5 års garanti ingår. Samma pris i hela Stockholmsområdet.",
    sections: [
      {
        heading: "Vad som ingår i 799 kr",
        paragraphs: [
          "Båda strålkastarna, maskering, våtslipning, polymerpolering, UV-keramiskt skydd och kontroll. Vi kommer till din adress. Inget startavgift och ingen milersättning inom vårt område.",
        ],
      },
      {
        heading: "Renovera eller byta",
        paragraphs: [
          "Nya originalstrålkastare ligger ofta på 5 000–20 000 kr styck plus montering, särskilt på bilar med LED eller adaptivt ljus. En renovering kostar 799 kr för paret när plasten är oxiderad men hel.",
          "Byte är rätt val när glaset är sprucket, svetsat fel eller har fukt inuti. Då hjälper inte polering — och vi tar inte betalt för att konstatera det.",
        ],
      },
      {
        heading: "MC, moped och företag",
        paragraphs: [
          "Kompakta enheter på motorcykel och moped från 499 kr, samma material och skydd. Åkerier, bilhandlare och vagnparker får offert — se sidan för företagskunder.",
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
          "Ja, så länge glaset är helt. 799 kr/par mot ofta femsiffriga belopp per sida för nya enheter.",
      },
      {
        question: "Kostar det extra utanför innerstan?",
        answer:
          "Nej. Huddinge, Tumba, Södertälje, Haninge, Nacka, Solna och övriga kommuner vi tar har samma fastpris.",
      },
    ],
    related: [
      { slug: "stralkastarpolering", label: "Strålkastarpolering" },
      { slug: "foretagskunder", label: "Företag och bilhandlare" },
      { slug: "faq", label: "FAQ" },
    ],
  },
  {
    slug: "foretagskunder",
    kind: "other",
    title: "Strålkastarpolering för företag och bilhandlare",
    description:
      "Volympris och mobil strålkastarpolering för bilhandlare, åkerier och vagnparker i Stockholm. Vi kommer till er gård eller verkstad.",
    h1: "Företag och bilhandlare",
    lead: "Gula strålkastare på en bil i lager sänker intrycket av hela bilen. På en vagnpark syns det i besiktning och nattkörning. Vi tar flera bilar på samma adress.",
    sections: [
      {
        heading: "Bilhandlare",
        paragraphs: [
          "Inbytesbilar med oxiderade glas ser äldre ut än mätarställningen. Vi kan stå på er gård och ta en rad bilar samma eftermiddag, så att fotot mot rutan och visningen matchar resten av lacken.",
        ],
      },
      {
        heading: "Åkeri och tjänstebilar",
        paragraphs: [
          "Yrkestrafik kör mycket i mörker. Matta glas märks på landsväg och i regn. Vi kommer till depån när bilarna ändå står still — kvällar vardagar och dagtid söndag.",
        ],
      },
      {
        heading: "Så funkar offerten",
        paragraphs: [
          "Personbilspriset 799 kr/par är utgångspunkten. Flera bilar på samma plats ger lägre styckpris eftersom restid och uppställning bara sker en gång. Mejla antal, adress och ungefärligt skick, eller ring.",
        ],
      },
    ],
    related: [
      { slug: "priser", label: "Priser" },
      { slug: "om-oss", label: "Om oss" },
      { slug: "stralkastarpolering-stockholm", label: "Stockholm" },
    ],
  },
  {
    slug: "fore-bilder",
    kind: "other",
    title: "Före och efter strålkastarpolering",
    description:
      "Bilder före och efter strålkastarpolering. Oxiderad, gul plast mot klar yta efter slipning, polering och UV-keramiskt skydd.",
    h1: "Före och efter",
    lead: "Samma strålkastare, samma bil, före och efter. Det du ser är oxidation som slipats bort och ytan som förseglats — inte ett filter och inte en ny lampa.",
    sections: [
      {
        heading: "Vad bilderna visar",
        paragraphs: [
          "Före: gulnad, mjölkig polykarbonat där ljuset sprids i ytan. Efter: klar plast efter våtslipning, polymerpolering och UV-keramiskt skydd. Jobbet tar ungefär en timme på plats.",
          "Vi publicerar inte påhittade kundnamn eller städer på bilderna. Fler steg i processen finns på sidan om strålkastarrenovering.",
        ],
      },
    ],
    images: [
      {
        src: "/images/gallery/stralkastarepolering-fore-efter.jpg",
        alt: "Före och efter strålkastarpolering på samma bil",
        caption: "Före och efter på samma strålkastare.",
      },
      {
        src: "/images/gallery/car-2.jpg",
        alt: "Bil efter strålkastarpolering",
        caption: "Klar yta efter UV-keramiskt skydd.",
      },
      {
        src: "/images/gallery/car-3.jpg",
        alt: "Närbild av polerad strålkastare",
        caption: "Närbild efter polymerpolering.",
      },
    ],
    related: [
      { slug: "stralkastarrenovering", label: "Processen" },
      { slug: "stralkastarpolering", label: "Strålkastarpolering" },
      { slug: "priser", label: "Priser" },
    ],
  },
  {
    slug: "faq",
    kind: "faq",
    title: "Vanliga frågor om strålkastarpolering",
    description:
      "FAQ om strålkastarpolering och strålkastarrenovering: matta glas, gulnad, besiktning, pris, byte, sprickor, DIY och mobil service i Stockholm.",
    h1: "Vanliga frågor",
    lead: "Korta svar på det folk faktiskt söker på. Behöver du processen i detalj, gå vidare till strålkastarrenovering. Pris finns samlat på prissidan.",
    sections: [
      {
        heading: "Sökintention och längre svar",
        paragraphs: [
          "Frågorna nedan är skrivna som folk ställer dem — matta glas, gula glas, besiktning, byte kontra renovering. Svaren är desamma som vi ger i telefon innan vi rullar ut.",
        ],
      },
    ],
    faqs: [
      {
        question: "Kan man polera matta strålkastare?",
        answer:
          "Ja. Matt yta är oxidation i polykarbonatet. Vi slipar bort skiktet, polerar och lägger UV-skydd. Smuts på utsidan räcker det att tvätta — det här är när tvätt inte hjälper.",
      },
      {
        question: "Varför blir strålkastare gula?",
        answer:
          "UV bryter ner fabrikens hard-coat. Därefter oxiderar plasten och blir gul och mjölkig. Det är därför nytt UV-skydd alltid ingår efter slipning.",
      },
      {
        question: "Hur länge håller en strålkastarrenovering?",
        answer:
          "Med UV-keramiskt skydd lämnar vi 5 års garanti. Utan skydd efter slipning börjar gulnaden ofta synas inom några månader.",
      },
      {
        question: "Vad kostar det att byta strålkastare?",
        answer:
          "Ofta 5 000–20 000 kr styck plus montering, mer på LED- och matrix-enheter. Renovering av paret är 799 kr när glaset är oxiderat men helt.",
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
        question: "Kommer ni till mig?",
        answer:
          "Ja, i Stockholm med omnejd — bland annat Huddinge, Tumba, Södertälje, Haninge, Nacka och Solna. Samma pris, ingen zonavgift.",
      },
    ],
    related: [
      { slug: "stralkastarpolering", label: "Strålkastarpolering" },
      { slug: "stralkastarrenovering", label: "Strålkastarrenovering" },
      { slug: "priser", label: "Priser" },
    ],
  },
  {
    slug: "om-oss",
    kind: "other",
    title: "Om oss – strålkastarpolering på plats i Stockholm",
    description:
      "Vi utför strålkastarpolering mobilt i Stockholm: våtslipning, polymerpolering och UV-keramiskt skydd med 5 års garanti. Fast pris, inget verkstadsbesök.",
    h1: "Om oss",
    lead: "Strålkastarpolering är en mobil tjänst i Stockholms län. Vi tar med materialet till din bil i stället för att du ska lämna in den.",
    sections: [
      {
        heading: "Hur vi arbetar",
        paragraphs: [
          "Varje jobb är samma kedja: maskering av lack, våtslipning från P400 till P3000, polymerpolering och UV-keramiskt skydd. Inget halvfabrikat och ingen ‘snabbglans’ som saknar skydd.",
          "Bilen ska stå utomhus, torr nog att arbeta på och med plats runt båda strålkastarna. Innergård, villauppfart och företagsparkering går bra. Vi arbetar söndag 08–20 och måndag–fredag 16–20.",
        ],
      },
      {
        heading: "Material och metod",
        paragraphs: [
          "Polykarbonat kräver både mekanisk avverkning av oxidationen och ett nytt UV-skikt. Skyddet är det som gör att vi kan lämna 5 års garanti. Utan det vore slipningen bara ett tillfälligt lyft.",
        ],
      },
      {
        heading: "Garanti och tydligt pris",
        paragraphs: [
          "799 kr/par för personbil, samma i hela området vi tar. Går inte glaset att rädda tar vi inte betalt. Avbokning senast 24 timmar före tiden.",
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
      { slug: "foretagskunder", label: "Företag" },
    ],
  },
];
