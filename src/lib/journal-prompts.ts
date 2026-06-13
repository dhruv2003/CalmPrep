import { Mood, ExamType } from './types';

export function getJournalPrompts(
  language: string,
  mood?: Mood,
  examType?: ExamType
): string[] {
  const isOverwhelmed = mood === 'anxious' || mood === 'overwhelmed' || mood === 'low';
  const examLabel = examType && examType !== 'Other' ? examType : language === 'hi' ? 'परीक्षा' : language === 'mr' ? 'परीक्षा' : 'exam';
  
  if (language === 'hi') {
    if (isOverwhelmed) {
      return [
        "अभी आपके दिमाग में सबसे ज्यादा क्या बात घूम रही है?",
        "आज ऐसा क्या हुआ जिसने आपको सबसे ज्यादा परेशान किया?",
        "एक गहरी सांस लें। क्या कोई एक छोटी चीज है जो अभी आपके नियंत्रण में है?",
        `${examLabel} की तैयारी में आज कौन सा दबाव सबसे तेज महसूस हुआ?`,
        "आज रात 5% बेहतर महसूस करने के लिए आप क्या कर सकते हैं?"
      ];
    }
    return [
      "आज आपने क्या एक चीज कल से बेहतर की?",
      "आज कौन सा विषय पढ़ने में सबसे अच्छा लगा?",
      "अपनी पढ़ाई में आपको सबसे ज्यादा गर्व किस बात पर है?",
      "कल के लिए आपका सबसे छोटा लक्ष्य क्या है?",
      "आप अपनी सफलता को कैसे परिभाषित करते हैं?"
    ];
  }

  if (language === 'mr') {
    if (isOverwhelmed) {
      return [
        "सध्या तुमच्या मनात कोणता विचार सतत येत आहे?",
        "आज तुम्हाला कोणत्या गोष्टीमुळे सर्वात जास्त त्रास झाला?",
        "एक दीर्घ श्वास घ्या. सध्या तुमच्या नियंत्रणात असलेली एक लहान गोष्ट कोणती?",
        `${examLabel} तयारीत आज कोणता दबाव सर्वात मोठा वाटला?`,
        "आज रात्री 5% शांत वाटण्यासाठी तुम्ही काय करू शकता?"
      ];
    }
    return [
      "आज तुम्ही कालपेक्षा कोणती एक गोष्ट चांगली केली?",
      "आज कोणता विषय वाचायला सर्वात जास्त आवडला?",
      "तुमच्या अभ्यासात तुम्हाला सर्वात जास्त अभिमान कोणत्या गोष्टीचा वाटतो?",
      "उद्यासाठी तुमचे सर्वात लहान ध्येय काय आहे?",
      "तुम्ही तुमच्या यशाची व्याख्या कशी करता?"
    ];
  }

  // Default to English
  if (isOverwhelmed) {
    return [
      "What thought kept repeating today?",
      "What moment made you feel stuck?",
      "Take a deep breath. What is one tiny thing currently within your control?",
      `What pressure felt the loudest in your ${examLabel} preparation today?`,
      "What would help you feel 5% calmer tonight?"
    ];
  }
  
  return [
    "What thought kept repeating today?",
    "What moment made you feel stuck?",
    "What is one thing you handled better than yesterday?",
    `What pressure felt the loudest in your ${examLabel} preparation today?`,
    "What would help you feel 5% calmer tonight?"
  ];
}
