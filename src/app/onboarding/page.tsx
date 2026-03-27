"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Flame, Calendar, Timer, ArrowRight, Activity, Dumbbell, Waves } from "lucide-react";
import { useTranslation } from "@/components/I18nProvider";

export default function Onboarding() {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    gender: "male",
    weight: "",
    restingHr: "",
    maxHr: "",
    ageGroup: "30-34", // Default value
    fitnessLevel: "Beginner",
    category: "Open", // Default value
    nextRaceDate: "",
    targetTime: "",
    pftRun: "",
    pftRow: "",
    pftBurpee: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    const savedData = localStorage.getItem("hyroxProfile");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(prev => ({ ...prev, ...parsed }));
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Save to localStorage
    localStorage.setItem("hyroxProfile", JSON.stringify(formData));
    
    // Save to DB (mocking the PFT metrics into the profile JSON)
    try {
      let eqData = null;
      try {
        const savedEq = localStorage.getItem("hyroxEquipment");
        if (savedEq) eqData = JSON.parse(savedEq);
      } catch (err) {}

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileData: {
            profile: formData,
            equipment: eqData,
          },
          microcycle: null,
          completedLogs: null,
        }),
      });

      if (!res.ok) throw new Error("Sync to DB failed");

      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to sync profile to DB:", err);
      alert("Profile sync failed. Please check network and retry.");
      setIsLoading(false);
    }
  };

  const updateData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateProgress = () => {
    let filled = 0;
    const total = 5; // core fields
    if (formData.gender) filled++;
    if (formData.weight) filled++;
    if (formData.fitnessLevel) filled++;
    if (formData.nextRaceDate) filled++;
    if (formData.pftRun || formData.pftRow || formData.pftBurpee) filled++;
    return Math.floor((filled / total) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary selection:text-on-primary">
      {/* TopAppBar Section */}
      <nav className="fixed top-0 w-full z-50 bg-[#131313] shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-2">
          <Flame className="text-primary w-6 h-6 fill-primary" />
          <span className="font-display font-black tracking-tighter uppercase text-2xl text-primary italic">FORGE</span>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary">
          <div className="w-full h-full bg-surface-container-highest flex items-center justify-center text-xs">U</div>
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Progress Header */}
          <header className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-1 block">ATHLETE ONBOARDING</span>
                <h1 className="font-display text-4xl font-black tracking-tighter uppercase leading-none">{t("onboarding.title")}</h1>
              </div>
              <span className="font-display text-2xl font-black text-primary italic">{progress}%</span>
            </div>
            <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 shadow-[0_0_15px_rgba(255,222,0,0.4)]" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </header>

          {/* Step 1: Profile Details */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-display font-black text-primary">01</span>
              <h2 className="font-display text-xl font-bold tracking-tight">{t("onboarding.step1TitleDesc")}</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-surface-container rounded-xl focus-within:ring-2 ring-primary/30 transition-all">
                  <label className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-2 block">{t("onboarding.gender")}</label>
                  <select 
                    title="选择性别"
                    value={formData.gender}
                    onChange={(e) => updateData('gender', e.target.value)}
                    className="w-full bg-transparent border-none p-0 font-sans text-lg font-semibold focus:ring-0 appearance-none cursor-pointer outline-none"
                  >
                    <option value="male" className="bg-surface text-on-surface">{t("onboarding.male")}</option>
                    <option value="female" className="bg-surface text-on-surface">{t("onboarding.female")}</option>
                    <option value="non-binary" className="bg-surface text-on-surface">{t("onboarding.nonBinary")}</option>
                  </select>
                </div>
                <div className="p-5 bg-surface-container rounded-xl focus-within:ring-2 ring-primary/30 transition-all">
                  <label className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-2 block">{t("onboarding.weight")}</label>
                  <input 
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateData('weight', e.target.value)}
                    className="w-full bg-transparent border-none p-0 font-sans text-lg font-semibold focus:ring-0 outline-none placeholder:text-on-surface/30" 
                    placeholder="75.0"
                    step="0.1"
                  />
                </div>
              </div>
              
              {/* Added Heart Rate Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-surface-container rounded-xl focus-within:ring-2 ring-primary/30 transition-all">
                  <label className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-2 flex items-center gap-1"><Activity className="w-3 h-3 text-primary"/> {t("onboarding.restingHr")}</label>
                  <input 
                    type="number"
                    value={formData.restingHr}
                    onChange={(e) => updateData('restingHr', e.target.value)}
                    className="w-full bg-transparent border-none p-0 font-sans text-lg font-semibold focus:ring-0 outline-none placeholder:text-on-surface/30" 
                    placeholder="e.g. 50"
                  />
                </div>
                <div className="p-5 bg-surface-container rounded-xl focus-within:ring-2 ring-primary/30 transition-all">
                  <label className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-2 flex items-center gap-1"><Activity className="w-3 h-3 text-red-500"/> {t("onboarding.maxHr")}</label>
                  <input 
                    type="number"
                    value={formData.maxHr}
                    onChange={(e) => updateData('maxHr', e.target.value)}
                    className="w-full bg-transparent border-none p-0 font-sans text-lg font-semibold focus:ring-0 outline-none placeholder:text-on-surface/30" 
                    placeholder="e.g. 190"
                  />
                </div>
              </div>

              {/* Legacy Required Fields for Engine: Age Group & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-surface-container rounded-xl focus-within:ring-2 ring-primary/30 transition-all">
                  <label className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-2 block">{t("onboarding.division")}</label>
                  <select 
                    title="选择参赛组别"
                    value={formData.category}
                    onChange={(e) => updateData('category', e.target.value)}
                    className="w-full bg-transparent border-none p-0 font-sans text-lg font-semibold focus:ring-0 appearance-none cursor-pointer outline-none"
                  >
                    <option value="Open" className="bg-surface">{t("onboarding.divisionOpen")}</option>
                    <option value="Pro" className="bg-surface">{t("onboarding.divisionPro")}</option>
                  </select>
                </div>
                <div className="p-5 bg-surface-container rounded-xl focus-within:ring-2 ring-primary/30 transition-all">
                  <label className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-2 block">{t("onboarding.ageGroup")}</label>
                  <select 
                    title="选择年龄段"
                    value={formData.ageGroup}
                    onChange={(e) => updateData('ageGroup', e.target.value)}
                    className="w-full bg-transparent border-none p-0 font-sans text-lg font-semibold focus:ring-0 appearance-none cursor-pointer outline-none"
                  >
                    {['16-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50-54', '55-59', '60+'].map((age) => (
                      <option key={age} value={age} className="bg-surface">{age}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-5 bg-surface-container rounded-xl">
                <label className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-4 block">{t("onboarding.fitnessLevel")}</label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                  {['Beginner', 'Intermediate', 'Advanced', 'Elite'].map((level) => {
                    const labels: Record<string, string> = {
                      'Beginner': t("onboarding.levelBeginner"),
                      'Intermediate': t("onboarding.levelIntermediate"),
                      'Advanced': t("onboarding.levelAdvanced"),
                      'Elite': t("onboarding.levelElite")
                    };
                    const isSelected = formData.fitnessLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => updateData('fitnessLevel', level)}
                        className={`px-6 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${
                          isSelected 
                            ? 'bg-primary text-on-primary' 
                            : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'
                        }`}
                      >
                        {labels[level]}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Step 2: Goal Setting */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-display font-black text-primary">02</span>
              <h2 className="font-display text-xl font-bold tracking-tight">{t("onboarding.step2TitleDesc")}</h2>
            </div>
            
            <div className="bg-surface-container rounded-xl p-6 border-l-4 border-primary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-2 block">{t("onboarding.raceDate")}</label>
                  <div className="flex items-center gap-3 text-on-surface">
                    <Calendar className="text-primary w-6 h-6" />
                    <input 
                      type="date"
                      title="比赛日期"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={formData.nextRaceDate}
                      onChange={(e) => updateData('nextRaceDate', e.target.value)}
                      className="bg-transparent border-none p-0 font-display text-2xl font-black focus:ring-0 uppercase tracking-tighter outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-display text-[10px] font-bold tracking-widest uppercase text-outline mb-2 block">{t("onboarding.goalTime")}</label>
                  <div className="flex items-center gap-3">
                    <Timer className="text-primary w-6 h-6" />
                    <input 
                      type="text"
                      placeholder="01:15:00"
                      value={formData.targetTime}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(/[^0-9:]/g, "").slice(0, 8);
                        updateData('targetTime', sanitized);
                      }}
                      className="bg-transparent border-none p-0 font-display text-2xl font-black focus:ring-0 w-32 tracking-tighter outline-none placeholder:text-on-surface/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Step 3: PFT Metrics */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center font-display font-black text-primary">03</span>
              <h2 className="font-display text-xl font-bold tracking-tight">{t("onboarding.step3Title")}</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {/* 1KM Run Card */}
              <div className="p-5 bg-surface-container rounded-xl flex items-center justify-between group hover:bg-surface-container-high transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-display font-black text-lg leading-tight">{t("onboarding.pftRun")}</p>
                    <p className="font-display text-[10px] text-outline tracking-wider uppercase">{t("onboarding.pftBest")}</p>
                  </div>
                </div>
                <div className="flex items-end gap-1">
                  <input 
                    type="text"
                    placeholder="4:00"
                    value={formData.pftRun}
                    onChange={(e) => updateData('pftRun', e.target.value)}
                    className="bg-transparent border-none p-0 font-display text-2xl font-black text-right focus:ring-0 w-20 outline-none placeholder:text-on-surface/20"
                  />
                  <span className="font-display text-xs text-outline mb-1">MIN</span>
                </div>
              </div>

              {/* Rowing Card */}
              <div className="p-5 bg-surface-container rounded-xl flex items-center justify-between group hover:bg-surface-container-high transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Waves className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-display font-black text-lg leading-tight">{t("onboarding.pftRow")}</p>
                    <p className="font-display text-[10px] text-outline tracking-wider uppercase">{t("onboarding.pftBest")}</p>
                  </div>
                </div>
                <div className="flex items-end gap-1">
                  <input 
                    type="text"
                    placeholder="3:45"
                    value={formData.pftRow}
                    onChange={(e) => updateData('pftRow', e.target.value)}
                    className="bg-transparent border-none p-0 font-display text-2xl font-black text-right focus:ring-0 w-20 outline-none placeholder:text-on-surface/20"
                  />
                  <span className="font-display text-xs text-outline mb-1">MIN</span>
                </div>
              </div>

              {/* Strength Card */}
              <div className="p-5 bg-surface-container rounded-xl flex items-center justify-between group hover:bg-surface-container-high transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-display font-black text-lg leading-tight">{t("onboarding.pftBurpee")}</p>
                    <p className="font-display text-[10px] text-outline tracking-wider uppercase">{t("onboarding.pftMax")}</p>
                  </div>
                </div>
                <div className="flex items-end gap-1">
                  <input 
                    type="number"
                    placeholder="20"
                    value={formData.pftBurpee}
                    onChange={(e) => updateData('pftBurpee', e.target.value)}
                    className="bg-transparent border-none p-0 font-display text-2xl font-black text-right focus:ring-0 w-20 outline-none placeholder:text-on-surface/20"
                  />
                  <span className="font-display text-xs text-outline mb-1">REPS</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Action */}
          <button 
            type="submit"
            disabled={isLoading || !formData.nextRaceDate}
            className="w-full bg-gradient-to-b from-[#FFE84D] to-[#FFDE00] py-6 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,222,0,0.2)] disabled:opacity-50"
          >
            <span className="font-display font-black text-on-primary text-xl tracking-tighter uppercase">{isLoading ? t("onboarding.generatingPlan") : t("onboarding.generatePlan")}</span>
            <ArrowRight className="text-on-primary font-black" />
          </button>
        </form>
      </main>
    </div>
  );
}
