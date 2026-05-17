"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Clock3,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Mail,
} from "lucide-react";

type Answer = {
  label: string;
  value: string;
  score?: number;
};

type Step = {
  id: string;
  question: string;
  subtitle?: string;
  condition?: (answers: Record<string, string>) => boolean;
  answers: Answer[];
};

type Observation = {
  title: string;
  text: string;
  severity: "low" | "medium" | "high";
};

const allSteps: Step[] = [
  {
    id: "status",
    question: "Hvordan ser din familiesituation ud i dag?",
    subtitle: "Familiesituationen har stor betydning for arv og begunstigelser.",
    answers: [
      { label: "Jeg er gift", value: "gift", score: 0 },
      { label: "Jeg er samlevende", value: "samlevende", score: 3 },
      { label: "Jeg er single", value: "single", score: 1 },
      { label: "Jeg er skilt eller separeret", value: "skilt", score: 3 },
      { label: "Jeg er enke/enkemand", value: "enke", score: 1 },
    ],
  },
  {
    id: "children",
    question: "Er der børn eller særbørn i billedet?",
    subtitle: "Særligt særbørn kan gøre arveforhold mere komplekse.",
    answers: [
      { label: "Nej, ingen børn", value: "ingen", score: 0 },
      { label: "Ja, fælles børn", value: "faelles", score: 1 },
      { label: "Ja, særbørn", value: "saerboern", score: 5 },
      { label: "Ja, både fælles børn og særbørn", value: "begge", score: 5 },
    ],
  },
  {
    id: "minorChildren",
    question: "Er nogle af børnene under 18 år?",
    subtitle: "Mindreårige børn kan gøre behovet for planlægning større.",
    condition: (answers) =>
      ["faelles", "saerboern", "begge"].includes(answers.children),
    answers: [
      { label: "Ja", value: "ja", score: 3 },
      { label: "Nej", value: "nej", score: 0 },
      { label: "Jeg er ikke sikker", value: "usikker", score: 2 },
    ],
  },
  {
    id: "testament",
    question: "Har du sikret, at arven fordeles efter dine egne ønsker?",
    subtitle:
      "Et testamente kan være vigtigt, hvis standardreglerne ikke matcher din familiesituation.",
    answers: [
      { label: "Ja, det har jeg taget stilling til", value: "ja", score: 0 },
      { label: "Nej, ikke endnu", value: "nej", score: 4 },
      { label: "Jeg er usikker", value: "usikker", score: 4 },
      { label: "Det blev gjort for længe siden", value: "gammelt", score: 2 },
    ],
  },
  {
    id: "pensionInsurance",
    question: "Har du pensioner eller livsforsikringer?",
    subtitle:
      "Pension og forsikring kan have egne begunstigelser, som ikke nødvendigvis følger arven.",
    answers: [
      { label: "Ja", value: "ja", score: 1 },
      { label: "Ja, flere steder", value: "flere", score: 2 },
      { label: "Nej, ikke hvad jeg ved af", value: "nej", score: 0 },
      { label: "Jeg er usikker", value: "usikker", score: 2 },
    ],
  },
  {
    id: "beneficiary",
    question: "Ved du, hvem der får dine pensioner og forsikringer udbetalt?",
    subtitle:
      "Begunstigelser kan være noget af det, mange glemmer at få opdateret.",
    condition: (answers) =>
      ["ja", "flere", "usikker"].includes(answers.pensionInsurance),
    answers: [
      { label: "Ja, og det er opdateret", value: "opdateret", score: 0 },
      { label: "Nej", value: "nej", score: 5 },
      { label: "Jeg er ikke sikker", value: "usikker", score: 5 },
      { label: "Det blev tjekket for længe siden", value: "gammelt", score: 3 },
    ],
  },
  {
    id: "power",
    question: "Har du taget stilling til, hvem der kan handle for dig ved sygdom?",
    subtitle: "Det handler blandt andet om fremtidsfuldmagt og praktisk hjælp.",
    answers: [
      { label: "Ja, det er på plads", value: "ja", score: 0 },
      { label: "Nej, ikke endnu", value: "nej", score: 3 },
      { label: "Jeg er usikker", value: "usikker", score: 3 },
      {
        label: "Jeg har hørt om det, men ikke fået det lavet",
        value: "ikke_lavet",
        score: 3,
      },
    ],
  },
  {
    id: "assets",
    question: "Er der større økonomiske forhold, der bør tages højde for?",
    subtitle: "Bolig, virksomhed og større opsparing kan øge kompleksiteten.",
    answers: [
      { label: "Ja, jeg ejer bolig", value: "bolig", score: 1 },
      { label: "Ja, jeg har virksomhed", value: "virksomhed", score: 5 },
      {
        label: "Ja, større opsparing eller investeringer",
        value: "opsparing",
        score: 2,
      },
      { label: "Nej, ikke umiddelbart", value: "nej", score: 0 },
    ],
  },
  {
    id: "review",
    question: "Hvornår blev det hele sidst gennemgået?",
    subtitle:
      "Ændringer i familie, bolig, pension eller arbejde kan hurtigt gøre gamle valg forældede.",
    answers: [
      { label: "Inden for det seneste år", value: "senest_aar", score: 0 },
      { label: "For 1–3 år siden", value: "1_3", score: 1 },
      { label: "For mere end 3 år siden", value: "mere_3", score: 3 },
      { label: "Aldrig", value: "aldrig", score: 5 },
      { label: "Jeg ved det ikke", value: "ved_ikke", score: 4 },
    ],
  },
];

function getActiveSteps(answers: Record<string, string>) {
  return allSteps.filter((step) => !step.condition || step.condition(answers));
}

function buildObservations(answers: Record<string, string>): Observation[] {
  const observations: Observation[] = [];

  if (
    answers.status === "samlevende" &&
    ["nej", "usikker", "gammelt"].includes(answers.testament)
  ) {
    observations.push({
      title: "Samliv giver ikke automatisk samme arveret som ægteskab",
      text: "Hvis man er samlevende uden et opdateret testamente, kan arven ende anderledes, end mange forventer.",
      severity: "high",
    });
  }

  if (
    answers.status === "skilt" &&
    ["nej", "usikker", "gammelt"].includes(answers.beneficiary)
  ) {
    observations.push({
      title: "Gamle begunstigelser kan stadig være aktive",
      text: "Efter skilsmisse eller separation kan det være vigtigt at kontrollere, hvem der står som begunstiget.",
      severity: "high",
    });
  }

  if (["saerboern", "begge"].includes(answers.children)) {
    observations.push({
      title: "Særbørn kan gøre arvefordelingen mere kompleks",
      text: "Når der er særbørn, kan fordelingen mellem ægtefælle, samlever og børn blive anderledes, end familien forventer.",
      severity: "high",
    });
  }

  if (
    answers.minorChildren === "ja" &&
    ["nej", "usikker", "gammelt"].includes(answers.testament)
  ) {
    observations.push({
      title: "Mindreårige børn kan kræve ekstra planlægning",
      text: "Hvis der er børn under 18 år, kan det være vigtigt at få overblik over arv, værgemål og praktisk sikring.",
      severity: "medium",
    });
  }

  if (["nej", "usikker", "gammelt"].includes(answers.beneficiary)) {
    observations.push({
      title: "Pension og forsikring følger ikke altid arvereglerne",
      text: "Udbetalinger fra pensioner og forsikringer afhænger ofte af begunstigelser og kan derfor ende et andet sted end resten af arven.",
      severity: "high",
    });
  }

  if (["nej", "usikker", "ikke_lavet"].includes(answers.power)) {
    observations.push({
      title: "Uden fremtidsfuldmagt kan dine nærmeste få svært ved at hjælpe",
      text: "Hvis du ikke selv kan handle, kan familien få sværere ved at hjælpe med økonomi og praktiske beslutninger.",
      severity: "medium",
    });
  }

  if (answers.assets === "virksomhed") {
    observations.push({
      title: "Virksomhed kan gøre planlægningen mere sårbar",
      text: "Hvis du har virksomhed, kan det være vigtigt at tage stilling til ejerskab, drift og overdragelse.",
      severity: "high",
    });
  }

  if (answers.pensionInsurance === "flere") {
    observations.push({
      title: "Pensioner flere steder kan skabe manglende overblik",
      text: "Når pensioner er spredt flere steder, kan det være lettere at overse gamle ordninger og begunstigelser.",
      severity: "medium",
    });
  }

  if (["aldrig", "ved_ikke", "mere_3"].includes(answers.review)) {
    observations.push({
      title: "Gamle valg kan være forældede",
      text: "Familie, bolig, pension og arbejde ændrer sig over tid. Derfor kan tidligere valg være mindre passende i dag.",
      severity: answers.review === "aldrig" ? "high" : "medium",
    });
  }

  if (observations.length === 0) {
    observations.push({
      title: "Det vigtigste er løbende opdatering",
      text: "Din situation virker umiddelbart overskuelig, men arv, begunstigelser og fuldmagter bør stadig holdes opdateret over tid.",
      severity: "low",
    });
  }

  return observations.slice(0, 4);
}

export default function Home() {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [lead, setLead] = useState({
    name: "",
    email: "",
    wantsContact: "no",
    phone: "",
    preferredTime: "",
    consent: false,
  });

  const activeSteps = getActiveSteps(answers);
  const step = activeSteps[currentStep];
  const isDone = started && currentStep >= activeSteps.length;
  const progress = Math.round(((currentStep + 1) / activeSteps.length) * 100);

  const result = useMemo(() => {
    const score = activeSteps.reduce((sum, s) => {
      const answer = s.answers.find((a) => a.value === answers[s.id]);
      return sum + (answer?.score || 0);
    }, 0);

    const observations = buildObservations(answers);
    const hasHigh = observations.some((o) => o.severity === "high");
    const hasMedium = observations.some((o) => o.severity === "medium");

    if (score >= 16 || hasHigh) {
      return {
        level: "Høj kompleksitet",
        intro:
          "Der er flere forhold i dine svar, som kan få praktisk betydning for din familie, hvis de ikke er afklaret.",
        color: "#B42318",
        soft: "#FFF5F5",
        observations,
      };
    }

    if (score >= 8 || hasMedium) {
      return {
        level: "Middel kompleksitet",
        intro:
          "Der er enkelte forhold, som kan være vigtige at få gennemgået, så dine ønsker og oplysninger passer til din situation.",
        color: "#B54708",
        soft: "#FFFAEB",
        observations,
      };
    }

    return {
      level: "Lav kompleksitet",
      intro:
        "Din situation ser umiddelbart overskuelig ud, men det er stadig vigtigt at holde dokumenter og begunstigelser opdateret.",
      color: "#027A48",
      soft: "#ECFDF3",
      observations,
    };
  }, [answers, activeSteps]);

  const canSubmit =
    lead.name.trim() &&
    lead.email.trim() &&
    lead.email.includes("@") &&
    lead.consent &&
    (lead.wantsContact === "no" ||
      (lead.phone.trim() && lead.preferredTime.trim()));

  function selectAnswer(value: string) {
    const nextAnswers = { ...answers, [step.id]: value };
    setAnswers(nextAnswers);

    setTimeout(() => {
      const nextActiveSteps = getActiveSteps(nextAnswers);
      const nextIndex = currentStep + 1;

      if (nextIndex >= nextActiveSteps.length) {
        setCurrentStep(nextActiveSteps.length);
      } else {
        setCurrentStep(nextIndex);
      }
    }, 180);
  }

  function goBack() {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      setStarted(false);
    }
  }

async function submitLead() {
  if (!canSubmit) return;

  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lead,
        result: result.level,
        observations: result.observations,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed");
    }

    setSubmitted(true);
  } catch (error) {
    console.error(error);
    alert("Der skete en fejl.");
  }
}

  return (
    <main className="min-h-screen bg-[#F4FAFA] text-[#253457] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(79,183,231,0.15),transparent_32%),linear-gradient(180deg,#F8FCFC_0%,#EEF8F8_100%)]" />

      <header className="relative z-10 border-b border-[#253457]/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:px-10">
          <img
  src="/Logo-A.png"
  alt="RådgiverXperten"
  className="h-8 w-auto md:h-9"
/>

          <button
            onClick={() => setStarted(true)}
            className="hidden rounded-full bg-[#253457] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1D2948] sm:inline-flex"
          >
            Start gratis check
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!started ? (
          <motion.section
            key="landing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.42 }}
            className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-16"
          >
            <div className="mx-auto max-w-5xl text-center">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.32em] text-[#4FB7E7] md:text-base">
                FamilieTryg
              </p>

              <p className="mb-8 text-xs font-semibold uppercase tracking-[0.28em] text-[#8D95A6] md:text-sm">
                by RådgiverXperten
              </p>

              <h1 className="mx-auto max-w-5xl text-[3rem] font-black leading-[0.98] tracking-[-0.05em] text-[#253457] md:text-[4.4rem]">
                Har du styr på,{" "}
                <span className="text-[#4FB7E7]">hvem der får hvad</span>, hvis
                der sker noget med dig?
              </h1>

              <p className="mx-auto mt-7 max-w-3xl text-[1.05rem] leading-relaxed text-[#5F687A] md:text-[1.25rem]">
                Få et vejledende overblik over arv, begunstigelse og
                fremtidsfuldmagter — baseret på din familiesituation.
              </p>

              <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => setStarted(true)}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#253457] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#253457]/15 transition hover:bg-[#1D2948]"
                >
                  Start gratis check
                  <ArrowRight
                    size={20}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>

                <div className="inline-flex items-center gap-3 rounded-full border border-[#253457]/10 bg-white/80 px-6 py-4 text-sm font-semibold text-[#4B5563] shadow-sm">
                  <Clock3 size={18} className="text-[#4FB7E7]" />
                  Ca. 2 minutter
                </div>
              </div>
            </div>
          </motion.section>
        ) : !isDone && step ? (
          <motion.section
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-12"
          >
            <div className="w-full max-w-2xl">
              <button
                onClick={goBack}
                className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#8D95A6] transition hover:text-[#253457]"
              >
                <ChevronLeft size={18} />
                Tilbage
              </button>

              <div className="mb-8">
                <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.18em] text-[#8D95A6]">
                  <span>
                    Spørgsmål {currentStep + 1} / {activeSteps.length}
                  </span>
                  <span>{progress}%</span>
                </div>

                <div className="h-[3px] overflow-hidden rounded-full bg-[#DCE8ED]">
                  <motion.div
                    className="h-full rounded-full bg-[#4FB7E7]"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-[#253457]/10 bg-white/88 p-6 shadow-[0_18px_55px_rgba(37,52,87,0.07)] backdrop-blur md:p-8">
                <h2 className="text-[1.85rem] font-black leading-[1.08] tracking-[-0.03em] text-[#253457] md:text-[2.35rem]">
                  {step.question}
                </h2>

                <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-[#667085] md:text-base">
                  {step.subtitle}
                </p>

                <div className="mt-7 space-y-2.5">
                  {step.answers.map((answer) => (
                    <button
                      key={answer.value}
                      onClick={() => selectAnswer(answer.value)}
                      className="group flex w-full items-center justify-between gap-4 rounded-[18px] border border-[#253457]/10 bg-[#FBFCFD] px-4 py-3.5 text-left transition hover:border-[#4FB7E7]/60 hover:bg-white hover:shadow-sm"
                    >
                      <span className="text-[0.98rem] font-semibold text-[#253457]">
                        {answer.label}
                      </span>

                      <ArrowRight
                        size={17}
                        className="text-[#A0A8B8] transition group-hover:translate-x-1 group-hover:text-[#4FB7E7]"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>
        ) : submitted ? (
          <motion.section
            key="submitted"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-10"
          >
            <div className="w-full max-w-xl rounded-[28px] border border-[#253457]/10 bg-white/92 p-8 text-center shadow-[0_18px_55px_rgba(37,52,87,0.07)]">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#ECFDF3]">
                <Check size={26} className="text-[#027A48]" />
              </div>

              <h2 className="text-3xl font-black tracking-[-0.03em] text-[#253457]">
                Dit overblik er på vej
              </h2>

              <p className="mx-auto mt-4 max-w-md text-[#667085] leading-relaxed">
                Tak — vi har modtaget dine oplysninger. Du vil modtage dit
                FamilieTryg-overblik på mail.
              </p>
            </div>
          </motion.section>
        ) : showLeadForm ? (
          <motion.section
            key="lead-form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-10"
          >
            <div className="w-full max-w-xl">
              <button
                onClick={() => setShowLeadForm(false)}
                className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-[#8D95A6] transition hover:text-[#253457]"
              >
                <ChevronLeft size={18} />
                Tilbage til resultat
              </button>

              <div className="rounded-[28px] border border-[#253457]/10 bg-white/92 p-6 shadow-[0_18px_55px_rgba(37,52,87,0.07)] md:p-8">
                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EAF7FD]">
                    <Mail size={21} className="text-[#4FB7E7]" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#4FB7E7]">
                      Næste skridt
                    </p>

                    <h2 className="mt-2 text-3xl font-black tracking-[-0.03em] text-[#253457]">
                      Få dit fulde overblik på mail
                    </h2>

                    <p className="mt-3 text-sm leading-relaxed text-[#667085]">
                      Vi sender dig en vejledende opsummering af dine svar og de
                      forhold, der kan være relevante at få gennemgået.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    value={lead.name}
                    onChange={(e) =>
                      setLead((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Navn"
                    className="w-full rounded-[16px] border border-[#253457]/10 bg-[#FBFCFD] px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-[#4FB7E7]"
                  />

                  <input
                    value={lead.email}
                    onChange={(e) =>
                      setLead((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="E-mail"
                    type="email"
                    className="w-full rounded-[16px] border border-[#253457]/10 bg-[#FBFCFD] px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-[#4FB7E7]"
                  />

                  <div>
                    <p className="mb-2 text-sm font-bold text-[#253457]">
                      Ønsker du at blive kontaktet om dit resultat?
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Ja, gerne", value: "yes" },
                        { label: "Nej, kun mail", value: "no" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            setLead((prev) => ({
                              ...prev,
                              wantsContact: option.value,
                            }))
                          }
                          className={`rounded-[16px] border px-4 py-3 text-sm font-bold transition ${
                            lead.wantsContact === option.value
                              ? "border-[#4FB7E7] bg-[#EAF7FD] text-[#253457]"
                              : "border-[#253457]/10 bg-[#FBFCFD] text-[#667085]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {lead.wantsContact === "yes" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <input
                          value={lead.phone}
                          onChange={(e) =>
                            setLead((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="Telefonnummer"
                          className="w-full rounded-[16px] border border-[#253457]/10 bg-[#FBFCFD] px-4 py-3.5 text-sm font-semibold outline-none transition focus:border-[#4FB7E7]"
                        />

                        <select
                          value={lead.preferredTime}
                          onChange={(e) =>
                            setLead((prev) => ({
                              ...prev,
                              preferredTime: e.target.value,
                            }))
                          }
                          className="w-full rounded-[16px] border border-[#253457]/10 bg-[#FBFCFD] px-4 py-3.5 text-sm font-semibold text-[#667085] outline-none transition focus:border-[#4FB7E7]"
                        >
                          <option value="">Hvornår passer det bedst?</option>
                          <option value="morgen">Morgen</option>
                          <option value="formiddag">Formiddag</option>
                          <option value="eftermiddag">Eftermiddag</option>
                          <option value="aften">Aften</option>
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <label className="flex cursor-pointer items-start gap-3 rounded-[16px] border border-[#253457]/10 bg-[#FBFCFD] p-4">
                    <input
                      type="checkbox"
                      checked={lead.consent}
                      onChange={(e) =>
                        setLead((prev) => ({
                          ...prev,
                          consent: e.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4"
                    />

                    <span className="text-xs leading-relaxed text-[#667085]">
                      Jeg accepterer, at RådgiverXperten må behandle mine
                      oplysninger og sende mit FamilieTryg-overblik på mail. Hvis
                      jeg ønsker kontakt, accepterer jeg også, at relevante
                      oplysninger kan videregives til udvalgte samarbejdspartnere
                      med henblik på kontakt.
                    </span>
                  </label>

                  <button
                    onClick={submitLead}
                    disabled={!canSubmit}
                    className={`inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-3.5 text-sm font-bold transition ${
                      canSubmit
                        ? "bg-[#253457] text-white hover:bg-[#1D2948]"
                        : "cursor-not-allowed bg-[#D7DEE8] text-white"
                    }`}
                  >
                    Send mit FamilieTryg-overblik
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35 }}
            className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-6 py-10"
          >
            <div className="w-full max-w-2xl">
              <div className="rounded-[28px] border border-[#253457]/10 bg-white/92 p-6 shadow-[0_18px_55px_rgba(37,52,87,0.07)] md:p-8">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#4FB7E7]">
                  Dit FamilieTryg-overblik
                </p>

                <h2 className="mt-4 text-[2.15rem] font-black leading-none tracking-[-0.04em] text-[#253457] md:text-[3.1rem]">
                  {result.level}
                </h2>

                <p className="mt-4 max-w-xl text-[1rem] font-semibold leading-relaxed text-[#253457] md:text-[1.08rem]">
                  {result.intro}
                </p>

                <div className="mt-6 rounded-[22px] border border-[#B42318]/15 bg-[#FFF7F7] p-5">
                  <div className="flex gap-3">
                    <AlertTriangle
                      size={20}
                      className="mt-1 shrink-0 text-[#B42318]"
                    />

                    <div>
                      <h3 className="text-[1.05rem] font-black text-[#B42318]">
                        Hvorfor kan det få betydning?
                      </h3>

                      <p className="mt-2 text-[0.95rem] leading-relaxed text-[#253457]/80">
                        Hvis dokumenter, begunstigelser eller fuldmagter ikke er
                        opdateret, kan pengene ende anderledes end forventet —
                        og dine nærmeste kan få sværere ved at handle, hvis du
                        ikke selv kan.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <h3 className="text-[1.05rem] font-black text-[#253457]">
                    Forhold vi har markeret i dine svar
                  </h3>

                  <div className="mt-3 divide-y divide-[#253457]/10 rounded-[22px] border border-[#253457]/10 bg-[#FBFCFD]">
                    {result.observations.map((item, index) => (
                      <div key={index} className="p-4">
                        <div className="flex gap-3">
                          <div
                            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                item.severity === "high"
                                  ? "#B42318"
                                  : item.severity === "medium"
                                  ? "#B54708"
                                  : "#027A48",
                            }}
                          />

                          <div>
                            <h4 className="text-[0.98rem] font-black text-[#253457]">
                              {item.title}
                            </h4>

                            <p className="mt-1.5 text-[0.92rem] leading-relaxed text-[#667085]">
                              {item.text}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setShowLeadForm(true)}
                    className="inline-flex items-center justify-center gap-3 rounded-full bg-[#253457] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#1D2948]"
                  >
                    Send mit fulde FamilieTryg-overblik
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => {
                      setAnswers({});
                      setCurrentStep(0);
                      setStarted(false);
                      setShowLeadForm(false);
                      setSubmitted(false);
                    }}
                    className="inline-flex items-center justify-center rounded-full border border-[#253457]/10 bg-white px-6 py-3.5 text-sm font-bold text-[#253457] transition hover:bg-[#F8FAFC]"
                  >
                    Start forfra
                  </button>
                </div>

                <p className="mt-5 text-xs leading-relaxed text-[#8D95A6]">
                  Resultatet er vejledende og udgør ikke juridisk, finansiel
                  eller investeringsmæssig rådgivning.
                </p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}