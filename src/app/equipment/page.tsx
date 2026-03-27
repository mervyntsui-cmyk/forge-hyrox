"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Circle, Flame, Save } from "lucide-react";

export default function EquipmentSettings() {
  const router = useRouter();
  const [equipment, setEquipment] = useState({
    skiErg: true,
    rower: true,
    sled: true,
    wallBall: true,
    kettlebells: true,
    dumbbells: true,
    sandbag: false,
    pullUpBar: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("hyroxEquipment");
    if (saved) setEquipment(JSON.parse(saved));
  }, []);

  const handleToggle = (key: keyof typeof equipment) => {
    setEquipment(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    localStorage.setItem("hyroxEquipment", JSON.stringify(equipment));
    router.push("/profile");
  };

  const equipList = [
    { key: "skiErg", label: "SkiErg", desc: "For 1000m Ski" },
    { key: "rower", label: "Rowing Machine", desc: "For 1000m Row" },
    { key: "sled", label: "Weighted Sled", desc: "Turf track required" },
    { key: "wallBall", label: "Wall Balls", desc: "Standard 4-9kg" },
    { key: "kettlebells", label: "Kettlebells", desc: "Farmers carry (16-32kg)" },
    { key: "dumbbells", label: "Dumbbells", desc: "Alternative lunges" },
    { key: "sandbag", label: "Sandbag", desc: "Lunges (10-30kg)" },
    { key: "pullUpBar", label: "Pull-Up Bar", desc: "Grip / Core access" },
  ];

  return (
    <div className="bg-background text-on-background antialiased pb-24 min-h-screen">
      {/* TopAppBar Shell */}
      <header className="bg-[#131313] fixed top-0 w-full z-50 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-b border-outline/10">
        <div className="flex justify-between items-center px-4 h-16 max-w-2xl mx-auto">
          <button 
            onClick={() => router.push("/profile")}
            className="flex items-center text-on-surface/60 hover:text-primary transition-colors pr-4 py-2"
            aria-label="返回档案页"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex gap-1 items-center">
             <Flame className="w-4 h-4 text-primary fill-primary" />
             <h1 className="font-display font-black tracking-tighter uppercase text-sm text-on-surface">FORGE <span className="text-on-surface/50">/ EQUIP</span></h1>
          </div>

          <div className="w-[40px]">
            {/* Empty block to center title */}
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 space-y-6 max-w-2xl mx-auto">
        <section className="mb-6">
          <h2 className="text-3xl font-extrabold italic uppercase font-display text-primary tracking-tighter leading-none mb-1">
            器械配置
          </h2>
          <p className="font-sans text-xs text-outline leading-relaxed max-w-xs">AI 引擎将根据你勾选的可用器械，为您生成平替动作。</p>
        </section>

        <section className="grid grid-cols-1 gap-3">
          {equipList.map((item) => (
            <button
              key={item.key}
              onClick={() => handleToggle(item.key as keyof typeof equipment)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all active:scale-[0.98] ${
                equipment[item.key as keyof typeof equipment]
                  ? "bg-primary/5 border-primary/40 shadow-[0_0_15px_rgba(255,222,0,0.1)]"
                  : "bg-surface-container border-outline/10 text-on-surface/40 hover:bg-surface-container-high"
              }`}
            >
              <div className="text-left flex-1 pl-2">
                <div className={`font-display font-bold uppercase tracking-widest text-sm mb-0.5 transition-colors ${
                  equipment[item.key as keyof typeof equipment] ? "text-primary" : "text-on-surface/60"
                }`}>
                  {item.label}
                </div>
                <div className="text-[10px] font-sans text-outline/80">{item.desc}</div>
              </div>
              <div className={`w-6 h-6 rounded border transition-colors flex items-center justify-center shrink-0 ml-4 ${
                  equipment[item.key as keyof typeof equipment] 
                    ? "bg-primary border-primary text-on-primary" 
                    : "bg-surface border-outline/30 text-transparent hover:border-outline/50"
              }`}>
                 <Check className="w-4 h-4" strokeWidth={3} />
              </div>
            </button>
          ))}
        </section>

        <button 
          onClick={handleSave}
          className="w-full mt-8 py-5 kinetic-gradient text-on-primary font-black font-display uppercase tracking-widest text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(255,222,0,0.2)] flex items-center justify-center gap-2 sticky bottom-6 z-20"
        >
          <Save className="w-5 h-5" /> 确认生效引擎配置
        </button>
      </main>
    </div>
  );
}
