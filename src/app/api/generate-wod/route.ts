import { NextResponse } from "next/server";
import fs from "fs";

const logToFile = (msg: string) => {
  try { fs.appendFileSync("/tmp/wod-error.log", new Date().toISOString() + " " + msg + "\n"); } catch(e){}
};

const ALIYUN_API_KEY = process.env.ALIYUN_API_KEY || "";
const API_URL = process.env.LLM_API_URL || "https://coding.dashscope.aliyuncs.com/apps/anthropic/v1/messages";

export async function POST(req: Request) {
  let isTapering = false;
  let weeksOut = 0;
  let avgRpe: number | undefined = undefined;
  let profile: any = null;
  let isEnglish = false;
  
  try {
    const bodyText = await req.text();
    logToFile("Incoming body: " + bodyText);
    const bodyObj = JSON.parse(bodyText);
    const { equipment, startDate, completedLogs, focus, lang } = bodyObj;
    isEnglish = lang === 'en';
    profile = bodyObj.profile;

    if (!profile || !startDate) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const startObj = new Date(startDate);
    const raceObj = new Date(profile.nextRaceDate);
    const diffTime = raceObj.getTime() - startObj.getTime();
    weeksOut = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)) : 0;
    isTapering = weeksOut > 0 && weeksOut <= 2;

    let feedbackContext = "";
    if (completedLogs && Object.keys(completedLogs).length > 0) {
      const recentLogs = Object.values(completedLogs).filter((log: any) => {
        const logDate = new Date(log.date);
        const daysDiff = (startObj.getTime() - logDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff > 0 && daysDiff <= 14;
      });

      if (recentLogs.length > 0) {
        let maxRpe = 0;
        let localAvgRpe = 0;
        let validRpeCount = 0;
        const athleteNotes: string[] = [];
        recentLogs.forEach((log: any) => {
          if (log.rpe) {
             localAvgRpe += log.rpe;
             validRpeCount++;
             if (log.rpe > maxRpe) maxRpe = log.rpe;
          }
          // Extract user notes from block logs
          if (log.blockLogs) {
            Object.values(log.blockLogs).forEach((bl: any) => {
              if (bl.notes && bl.notes.trim().length > 0) {
                athleteNotes.push(`[${log.date}] ${bl.notes.trim()}`);
              }
            });
          }
        });
        if (validRpeCount > 0) {
          avgRpe = localAvgRpe / validRpeCount;
          feedbackContext = `\n[Historical Feedback - Last 14 Days]: Athlete's average RPE was ${avgRpe.toFixed(1)}/10, max ${maxRpe}/10.\n`;
          if (avgRpe >= 8) {
             feedbackContext += "CRITICAL: Athlete accumulated high fatigue! You MUST reduce overall volume and intensity for this microcycle. Prioritize recovery.\n";
          } else if (avgRpe <= 5) {
             feedbackContext += "NOTICE: Athlete's perceived exertion is relatively low. You MUST increase intensity, heavy lifts, or running volume this week.\n";
          } else {
             feedbackContext += "Athlete is responding well. Maintain progressive overload and specific HYROX intensities.\n";
          }
        }
        // Inject athlete's own qualitative notes into prompt
        if (athleteNotes.length > 0) {
          const notesStr = athleteNotes.slice(-10).join("\n"); // Cap at 10 most recent notes
          feedbackContext += `\n[Athlete's Own Training Notes]:\n${notesStr}\nIMPORTANT: Read the athlete's notes carefully. If they mention pain, injury, or equipment struggles, ADAPT the next plan accordingly (reduce volume, swap exercises, lower weight). If they mention feeling strong, increase challenge.\n`;
        }
      }
    }

    let taperingContext = "";
    if (isTapering) {
       taperingContext = `\n[🚨 TAPERING PHASE ACTIVE - ${weeksOut} WEEKS OUT]: Race day is IMMINENT. You MUST drastically reduce total volume by 40%. NO heavy Sled Pushes. Emphasize active recovery, short sharp intervals to maintain engine, and plenty of rest. Do NOT program high-volume chippers.\n`;
    }

    const equipmentList = equipment
      ? Object.entries(equipment)
          .filter(([_, available]) => available)
          .map(([name]) => name)
          .join(", ")
      : "Standard Gym Equipment";

    const focusContext = focus && focus !== "Balanced"
      ? `\nCRITICAL FOCUS FOR THIS CYCLE: [${focus}]. Give HEAVY priority to this goal. If 'Engine', emphasize long cardio & ergs. If 'Strength', emphasize Sleds, Sandbags, Farmers Carry. If 'Transition', emphasize HYROX style running-into-station combinations.`
      : "";

    const prompt = `
You are an elite HYROX coach. Generate a 7-day training microcycle starting from ${startDate}.
The athlete is a ${profile.ageGroup} ${profile.gender}, Level: ${profile.fitnessLevel}, Category: ${profile.category === 'Pro' ? 'Pro' : 'Open'}.
Next Race: ${profile.nextRaceDate} (${weeksOut > 0 ? weeksOut + ' Weeks Out' : 'Race Week'}), Target Time: ${profile.targetTime}.
Athlete Bio: Weight ${profile.weight}kg, Resting HR: ${profile.restingHr || 'Unknown'} BPM, Max HR: ${profile.maxHr || 'Unknown'} BPM.
${feedbackContext}${taperingContext}${focusContext}
Available Equipment: ${equipmentList}. NEVER program equipment that is not in this list.

Based on Gender and Category, you MUST STRICTLY program these standard HYROX weights if the exercise is programmed:
Open Men: Sled Push 152kg, Sled Pull 103kg, Wall Balls 6kg, Farmer Carry 24kgx2, Sandbag Lunges 20kg.
Pro Men: Sled Push 202kg, Sled Pull 153kg, Wall Balls 9kg, Farmer Carry 32kgx2, Sandbag Lunges 30kg.
Open Women: Sled Push 102kg, Sled Pull 78kg, Wall Balls 4kg, Farmer Carry 16kgx2, Sandbag Lunges 10kg.
Pro Women: Sled Push 152kg, Sled Pull 103kg, Wall Balls 6kg, Farmer Carry 24kgx2, Sandbag Lunges 20kg.
If standard equipment is unavailable (e.g. no sled), recommend Dumbbell/Kettlebell equivalents AND provide a suggested weight matching the athlete's category (e.g. 2x22.5kg DBs for Men's Open, 2x15kg for Women's Open).
DO NOT display or append the athlete's body weight to running or bodyweight exercises (e.g., just write "1km 跑步", NOT "1km 跑步 (75kg)"). The body weight is just for your background context.

Generate a JSON array of precisely 7 objects.
${isEnglish
  ? `IMPORTANT: The output MUST be in English. All 'phase', 'title', 'description', and 'name' properties MUST be in English.`
  : `IMPORTANT: The output MUST be localized in Simplified Chinese (简体中文). 'phase', 'title', 'description', and 'name' properties MUST be in Chinese. The actual exercise details can remain in English or be translated into standard Chinese gym terminology.`
}

JSON format requirement:
[
  {
    "date": "YYYY-MM-DD", (Starting from ${startDate})
    "isRestDay": boolean,
    "phase": ${isEnglish ? '"e.g., Base Phase, Peak Phase, Taper Phase"' : '"e.g., 基础期, 强化期, 巅峰期"'},
    "title": ${isEnglish ? '"e.g., Engine Builder, Heavy Sled Day, Full Rest"' : '"e.g., 引擎发动机, 重型雪橇日, 完全休息"'},
    "description": ${isEnglish ? '"Short description of the day intent in English"' : '"Short description of the day\'s intent in Chinese"'},
    "blocks": [
      {
        "type": "WarmUp" | "MainSet" | "CoolDown" | "Strength",
        "name": "e.g., 无间断 24分钟 (EMOM 24), 计时完成 (For Time), 4 轮",
        "format": "For Time" | "EMOM" | "AMRAP" | "Rounds" | "Sets" | "Relax",
        "details": ["15 Cal 划船机", "20 墙球", "25m 雪橇推 (125kg)"],
        "targetDuration": 24 // in minutes (optional integer)
      }
    ]
  }
]

Programming Guidelines:
- Plan exactly ONE full rest day per week.
- HYROX is a running-dominant sport. You MUST program at least 2 dedicated running sessions (e.g., Long Slow Distance, Interval Sprints, Lactate Threshold Runs).
- CALIBRATE RUNNING PACES AND HEART RATE based on the user's Target Time and HR profile. IF the user provided Resting/Max HR, you MUST suggest specific BPM ranges (e.g. "Zone 2: 135-145 BPM") along with specific paces (e.g. 5:00/km) for all running blocks!
- For the single rest day, 'blocks' can be empty or contain a simple 'Relax' block.
- For non-rest days, include a WarmUp, at least one MainSet, and a CoolDown.
- Adapt all HYROX specific movements to the available equipment. E.g., if no SkiErg, program DB Devil Presses or Kettlebell Swings. If no Sled, program Heavy DB Lunges.
- Make the workouts highly specific to HYROX, with running intervals combined with functional exercises.
- CRITICAL: Ensure high variance between generations. Vary the distances, reps, and rep schemes completely. Use creative formats like 'Death by...', 'Chipper', 'Ladder', 'TABATA' occasionally. Do not repeat the exact same structure from previous weeks.
- Random Context Entropy ID: ${Math.random() * 100000} (Use this to force a unique workout structure).
- Valid json only.
`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "x-api-key": ALIYUN_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "qwen3.5-plus",
        max_tokens: 4096,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });
    
    clearTimeout(timeoutId);

    logToFile(`Aliyun response status: ${response.status}`);

    if (!response.ok) {
      const errText = await response.text();
      logToFile("Aliyun API Error: " + errText);
      console.error("Aliyun API Error:", errText);
      throw new Error(`Aliyun API Error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    logToFile("Aliyun parsed JSON length: " + JSON.stringify(data).length);
    const responseText = data.content?.[0]?.text || "";
    
    // Strip markdown formatting if any
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/```\n([\s\S]*?)\n```/);
    const cleanJson = jsonMatch ? jsonMatch[1] : responseText;

    logToFile("Cleaned JSON: " + cleanJson.substring(0, 500));
    const parsedRes = JSON.parse(cleanJson.trim());
    logToFile("Returning OK JSON map with length " + parsedRes.length);
    return NextResponse.json(parsedRes);
  } catch (error: any) {
    logToFile("EXCEPTION CAUGHT: " + error.message + " | Stack: " + error.stack);
    console.error("Qwen API Error:", error);
    
    logToFile("Initiating Elite Rescue DAA Fallback...");
    // Fallback Mock generation perfectly matching Tapering/RPE logic dynamically
    const fallbackPlan = [];
    const baseDate = new Date(); // fallback to today if parsing fails
    
    // Evaluate conditions for dynamic fallback building
    const isHighFatigue = typeof avgRpe !== 'undefined' && avgRpe >= 8;
    const isLowFatigue = typeof avgRpe !== 'undefined' && avgRpe <= 5;
    
    let basePhase = isTapering 
      ? (isEnglish ? "Race Taper Phase" : "赛前减量保养期")
      : (isEnglish ? "Base Volume Accumulation" : "基础容量积累期");
    if (!isTapering && isHighFatigue) basePhase = isEnglish ? "Forced Fatigue Reduction" : "疲劳强制削减期";

    const isMale = profile?.gender?.toLowerCase() === 'male';
    const isPro = profile?.category === 'Pro';
    const sledPushW = isMale ? (isPro ? "202kg" : "152kg") : (isPro ? "152kg" : "102kg");
    const sledPullW = isMale ? (isPro ? "153kg" : "103kg") : (isPro ? "103kg" : "78kg");
    const wallBallW = isMale ? (isPro ? "9kg" : "6kg") : (isPro ? "6kg" : "4kg");
    const farmerW = isMale ? (isPro ? "32kgx2" : "24kgx2") : (isPro ? "24kgx2" : "16kgx2");
    const lungeW = isMale ? (isPro ? "30kg" : "20kg") : (isPro ? "20kg" : "10kg");

    for (let i = 0; i < 7; i++) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const fbDate = d.toISOString().split('T')[0];
        const lvl = profile?.fitnessLevel?.toLowerCase() || 'intermediate';
        let basePace = "5:30/km";
        let intervalPace = "4:45/km";
        if (lvl === 'beginner') { basePace = "6:30/km"; intervalPace = "5:30/km"; }
        if (lvl === 'advanced') { basePace = "4:45/km"; intervalPace = "4:00/km"; }
        if (lvl === 'elite') { basePace = "4:15/km"; intervalPace = "3:30/km"; }
        
        if (i === 6) {
             fallbackPlan.push({
                 date: fbDate,
                 isRestDay: true,
                 phase: basePhase,
                 title: isEnglish ? "Full Rest (Active Recovery)" : "彻底休息 (Active Recovery)",
                 description: isEnglish
                   ? (isHighFatigue && isTapering ? "High fatigue detected near race week. Full rest mandated."
                      : isHighFatigue ? "High RPE detected recently. Mandatory active recovery day."
                      : isTapering ? `${weeksOut} weeks to race. Reserve energy with extra rest.`
                      : "Rest day. Stretch and recover.")
                   : (isHighFatigue && isTapering ? "昨日你的疲劳反馈极高，加上距离比赛不足两周，AI 强制切断所有高强度训练，彻底静养。"
                      : isHighFatigue ? "由于近期积累了高达 8 以上的平均疲劳(RPE)，系统为你指派了强制主动恢复日。"
                      : isTapering ? `距离比赛仅剩 ${weeksOut} 周，多安排休息以储备体能。`
                      : "日常休息日，拉伸与放松肌肉。"),
                 blocks: [{ type: "Relax", name: isEnglish ? "Light Stretch & Walk" : "轻度拉伸与散步", format: "Relax", details: isEnglish ? ["20min Easy Walk", "Foam Roll & Static Stretch"] : ["20分钟慢走", "泡沫轴放松拉伸"], targetDuration: 30 }]
             });
        } else if (i === 1 || i === 4) {
             let runTitle = i === 1 ? "乳酸阈值间歇 (Lactate Intervals)" : "长距离有氧引擎 (Long Slow Distance)";
             let runDesc = i === 1 ? "通过短距离冲刺提升乳酸清除能力与跑步极速。" : "建立超长待机的有氧底座，HYROX 取胜的关键。";
             let runningBlock = i === 1 
                 ? { type: "MainSet", name: "800m 间歇串", format: "Intervals", details: [`8 x 800m 跑步 (目标配速 ${intervalPace})`, "组间慢走休息 90 秒"], targetDuration: 45 }
                 : { type: "MainSet", name: "周末长距离跑", format: "Relax", details: [`12km - 15km 轻松跑`, `目标心率 Zone 2，配速推荐 ${basePace}`, "注意步频与呼吸的结合"], targetDuration: 90 };
                 
             if (isTapering) {
                 runTitle = "赛前配速锁定 (Race Pace Lock-in)";
                 runDesc = "不再追求极速与大容量，仅寻找比赛当天的发力感。";
                 runningBlock = { type: "MainSet", name: "目标配速巡航", format: "Intervals", details: [`4 x 1km 跑步 (严格锁定比赛目标配速 ${basePace})`, "组间休息 2 分钟"], targetDuration: 30 };
             }
             
             fallbackPlan.push({
                 date: fbDate,
                 isRestDay: false,
                 phase: basePhase,
                 title: runTitle,
                 description: runDesc,
                 blocks: [
                     { type: "WarmUp", name: "跑前动态激活", format: "Relax", details: ["马克操 (A/B Skips)", "脚踝与髋部灵活性激活"], targetDuration: 15 },
                     runningBlock,
                     { type: "CoolDown", name: "跑后排酸", format: "Relax", details: ["静态拉伸小腿与大腿后侧"], targetDuration: 10 }
                 ]
             });
        } else {
             let workoutTitle = "混合引擎 (Mixed Engine)";
             let workoutDesc = "结合跑步与 HYROX 核心站点的交叉训练。";
             let mainSet = { type: "MainSet", name: "综合训练", format: "ROUNDS", details: ["3 轮:", "1km 跑步", `25m 雪橇推 (${sledPushW})`], targetDuration: 35 };

             if (isTapering) {
                 workoutTitle = "降频引擎复苏 (Speed & Engine Maintenance)";
                 workoutDesc = `距离比赛还有 ${weeksOut} 周，坚决不碰导致 DOMS 的重型设备，保持呼吸畅通的短冲为主。`;
                 mainSet = { type: "MainSet", name: "速度唤醒组", format: "Intervals", details: ["5 x 400m 跑步 (轻松偏快)", "每组间隔 15 波比跳", "完全休息 2 分钟"], targetDuration: 25 };
                 if (isHighFatigue) workoutDesc += " 同时严控心率，今日禁止进入 Zone 4。";
             } else {
                 if (isHighFatigue) {
                     workoutTitle = "有氧引擎修复 (Easy Engine)";
                     workoutDesc = "近期 RPE 高光预警，今日免去大重量，改为纯粹的低心率引擎打磨。";
                     mainSet = { type: "MainSet", name: "Zone 2 修复", format: "Relax", details: ["40分钟 划船机/SkiErg 交替", "严格控制心率在 Zone 2"], targetDuration: 40 };
                 } else if (isLowFatigue) {
                     workoutTitle = "超负荷赛事模拟 (HYROX Overload)";
                     workoutDesc = "系统监测到你近期状态极佳，今日追加魔鬼级容量冲击你的转换极限！";
                     mainSet = { type: "MainSet", name: "赛事模拟缩影", format: "For Time", details: ["1.5km 跑步", `50m 重装雪橇推 (${sledPushW})`, "1km 跑步", `50m 沙袋弓箭步 (${lungeW})`, "1km 跑步", `100 墙球 (${wallBallW})`], targetDuration: 55 };
                 } else {
                     // 正常情况下的丰富变化 (0, 2, 3, 5 are the non-rest days)
                     if (i === 0) {
                         workoutTitle = "拉力与有氧 (Pull & Cardio)";
                         workoutDesc = "强化背部拉力与持续输出能力。";
                         mainSet = { type: "MainSet", name: "阶梯递减", format: "For Time", details: ["1000m SkiErg", `50m 雪橇拉 (${sledPullW})`, "800m 跑步", `25m 雪橇拉 (${sledPullW})`, "500m SkiErg"], targetDuration: 35 };
                     } else if (i === 2) {
                         workoutTitle = "下肢与核心 (Legs & Core)";
                         workoutDesc = "应对沙袋弓箭步与墙球的极度酸痛。";
                         mainSet = { type: "MainSet", name: "EMOM 30", format: "EMOM", details: [`分钟 1: 15 墙球 (${wallBallW})`, `分钟 2: 20m 沙袋弓箭步 (${lungeW})`, "分钟 3: 15 卡 划船"], targetDuration: 30 };
                     } else if (i === 3) {
                         workoutTitle = "推力极限 (Push & Engine)";
                         workoutDesc = "雪橇推与波比跳的绝望组合。";
                         mainSet = { type: "MainSet", name: "死亡交叉", format: "ROUNDS", details: ["4 轮:", "800m 跑步", `25m 雪橇推 (${sledPushW})`, "20 波比跳远 (Burpee Broad Jumps)"], targetDuration: 40 };
                     } else {
                         workoutTitle = "绝对引擎建设 (Pure Engine)";
                         workoutDesc = "在沉重的无氧消耗后维持体能。";
                         mainSet = { type: "MainSet", name: "引擎轰炸", format: "Intervals", details: ["2000m 划船", "1000m 跑步", `100m 农夫走 (${farmerW})`, "1000m 跑步", "2000m SkiErg"], targetDuration: 45 };
                     }
                 }
             }

             fallbackPlan.push({
                 date: fbDate,
                 isRestDay: false,
                 phase: basePhase,
                 title: workoutTitle,
                 description: workoutDesc,
                 blocks: [
                     { type: "WarmUp", name: "全身动态激活", format: "For Time", details: ["5分钟 慢跑或划船", "10 徒手深蹲", "10 俯卧撑", "动态拉伸"], targetDuration: 10 },
                     mainSet,
                     { type: "CoolDown", name: "静态冥想与排酸", format: "Relax", details: ["小腿按摩滚轴放松", "彻底拉伸腿部筋膜"], targetDuration: 10 }
                 ]
             });
        }
    }
    return NextResponse.json(fallbackPlan);
  }
}
