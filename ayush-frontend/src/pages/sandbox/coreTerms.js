// Demo terminology list used by the sandbox.
// Each entry: term, namasteCode, icdCode, icdLabel, symptoms (plain-English keywords
// used for symptom matching and search).
//
// To use the full dataset, replace this object with the converted contents of
// namaste_sample.json (or load it from the backend) keeping the same shape.
export const CORE_TERMS_BY_SYSTEM = {
  Ayurveda: [
    { term: "Vata Jvara (वातज्वर)", namasteCode: "A_JV.1.1", icdCode: "SF82", icdLabel: "Traditional Medicine Fever",
      symptoms: ["fever", "shivering", "chills", "body ache", "joint pain", "dry mouth", "dryness", "constipation", "headache"] },
    { term: "Pitta Jvara (पित्तज्वर)", namasteCode: "A_JV.1.2", icdCode: "SF83", icdLabel: "Traditional Medicine Fever, Pitta Pattern",
      symptoms: ["fever", "high fever", "burning", "burning sensation", "sweating", "thirst", "vomiting", "bitter taste", "diarrhea"] },
    { term: "Kapha Jvara (कफज्वर)", namasteCode: "A_JV.1.3", icdCode: "SF84", icdLabel: "Traditional Medicine Fever, Kapha Pattern",
      symptoms: ["fever", "mild fever", "heaviness", "cold", "cough", "phlegm", "mucus", "nausea", "drowsiness", "loss of appetite"] },
    { term: "Sannipata Jvara (सन्निपातज्वर)", namasteCode: "A_JV.1.4", icdCode: "SF85", icdLabel: "Traditional Medicine Fever, Combined Pattern",
      symptoms: ["fever", "high fever", "confusion", "delirium", "severe weakness", "shivering", "burning", "cough"] },
    { term: "Amlapitta (अम्लपित्त)", namasteCode: "A_AP.9.2", icdCode: "SF88", icdLabel: "Traditional Medicine Acid-Peptic Disorder",
      symptoms: ["acidity", "heartburn", "burning", "burning sensation", "sour belching", "vomiting", "stomach pain", "nausea", "indigestion", "bloating"] },
  ],
  Siddha: [
    { term: "Iraippu Suram", namasteCode: "S_SU.2.1", icdCode: "SF90", icdLabel: "Traditional Medicine Respiratory Fever",
      symptoms: ["fever", "cough", "wheezing", "breathlessness", "difficulty breathing", "chest tightness"] },
    { term: "Vali Suram", namasteCode: "S_SU.2.2", icdCode: "SF91", icdLabel: "Traditional Medicine Fever, Vali Pattern",
      symptoms: ["fever", "body pain", "joint pain", "tremor", "shivering", "stiffness"] },
    { term: "Aiya Suram", namasteCode: "S_SU.2.3", icdCode: "SF92", icdLabel: "Traditional Medicine Fever, Aiya Pattern",
      symptoms: ["fever", "phlegm", "cold", "runny nose", "cough", "heaviness", "drowsiness"] },
  ],
  Unani: [
    { term: "Humma-e-Balghami", namasteCode: "U_HB.3.1", icdCode: "SF70", icdLabel: "Traditional Medicine Fever, Phlegmatic",
      symptoms: ["fever", "phlegm", "heaviness", "cold", "runny nose", "drowsiness", "lethargy"] },
    { term: "Humma-e-Damwi", namasteCode: "U_HB.3.2", icdCode: "SF71", icdLabel: "Traditional Medicine Fever, Sanguine",
      symptoms: ["fever", "headache", "flushed face", "red eyes", "body heat", "nosebleed"] },
    { term: "Humma-e-Safrawi", namasteCode: "U_HB.3.3", icdCode: "SF72", icdLabel: "Traditional Medicine Fever, Bilious",
      symptoms: ["fever", "vomiting", "bitter taste", "thirst", "burning", "dry mouth"] },
  ],
  "Yoga & Naturopathy": [
    { term: "Agnimandya", namasteCode: "Y_AG.4.1", icdCode: "SG10", icdLabel: "Traditional Medicine Digestive Weakness",
      symptoms: ["indigestion", "bloating", "gas", "loss of appetite", "heaviness after meals", "stomach pain", "nausea"] },
    { term: "Vata Vikruti", namasteCode: "Y_VV.4.2", icdCode: "SG11", icdLabel: "Traditional Medicine Constitutional Imbalance",
      symptoms: ["gas", "constipation", "anxiety", "dry skin", "joint pain", "insomnia", "restlessness"] },
  ],
  Homeopathy: [
    { term: "Febris Continua", namasteCode: "H_FC.5.1", icdCode: "SF60", icdLabel: "Traditional Medicine Continuous Fever",
      symptoms: ["fever", "continuous fever", "constant fever", "weakness", "headache"] },
    { term: "Febris Intermittens", namasteCode: "H_FI.5.2", icdCode: "SF61", icdLabel: "Traditional Medicine Intermittent Fever",
      symptoms: ["fever", "intermittent fever", "fever comes and goes", "chills", "sweating", "shivering"] },
  ],
};
