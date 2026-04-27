import './About.css';

export default function About({ language }) {
  const T = {
    English: {
      title: "About AaharSense AI",
      mission: "AaharSense AI is a next-generation food safety and nutritional analysis platform built for the Indian market. Leveraging advanced Gemini 1.5 Pro Vision AI, we empower consumers to make informed choices by identifying ingredients, nutritional value, and potential adulterants in everyday food.",
      features: [
        {
          title: "Adulteration Detection",
          desc: "Identify common adulterants in milk, spices, and grains through visual analysis and cross-referencing safety standards."
        },
        {
          title: "Safety Scoring",
          desc: "A proprietary algorithm that evaluates food based on ingredient purity, processing levels, and nutritional density."
        },
        {
          title: "Multilingual Support",
          desc: "Available in Kannada, Hindi, and English to ensure accessibility across diverse Indian regions."
        },
        {
          title: "Regional Context",
          desc: "Trained specifically on Indian food varieties, traditional snacks, and street food favorites."
        }
      ],
      tagline: "Building a healthier Bharat, one bite at a time."
    },
    ಕನ್ನಡ: {
      title: "AaharSense AI ಬಗ್ಗೆ",
      mission: "AaharSense AI ಎನ್ನುವುದು ಭಾರತೀಯ ಮಾರುಕಟ್ಟೆಗಾಗಿ ನಿರ್ಮಿಸಲಾದ ಮುಂದಿನ ಪೀಳಿಗೆಯ ಆಹಾರ ಸುರಕ್ಷತೆ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶದ ವಿಶ್ಲೇಷಣಾ ವೇದಿಕೆಯಾಗಿದೆ. ಸುಧಾರಿತ AI ತಂತ್ರಜ್ಞಾನವನ್ನು ಬಳಸಿಕೊಂಡು, ದೈನಂದಿನ ಆಹಾರದಲ್ಲಿರುವ ಪದಾರ್ಥಗಳು, ಪೌಷ್ಟಿಕಾಂಶದ ಮೌಲ್ಯ ಮತ್ತು ಕಲಬೆರಕೆಗಳನ್ನು ಗುರುತಿಸುವ ಮೂಲಕ ಗ್ರಾಹಕರಿಗೆ ಮಾಹಿತಿ ನೀಡುತ್ತೇವೆ.",
      features: [
        {
          title: "ಕಲಬೆರಕೆ ಪತ್ತೆ",
          desc: "ಹಾಲು, ಮಸಾಲೆಗಳು ಮತ್ತು ಧಾನ್ಯಗಳಲ್ಲಿನ ಸಾಮಾನ್ಯ ಕಲಬೆರಕೆಗಳನ್ನು ದೃಶ್ಯ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಸುರಕ್ಷತಾ ಮಾನದಂಡಗಳ ಮೂಲಕ ಗುರುತಿಸಿ."
        },
        {
          title: "ಸುರಕ್ಷತಾ ಸ್ಕೋರ್",
          desc: "ಪದಾರ್ಥಗಳ ಶುದ್ಧತೆ ಮತ್ತು ಪೌಷ್ಟಿಕಾಂಶದ ಸಾಂದ್ರತೆಯ ಆಧಾರದ ಮೇಲೆ ಆಹಾರವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡುವ ಕ್ರಮಾವಳಿ."
        },
        {
          title: "ಬಹುಭಾಷಾ ಬೆಂಬಲ",
          desc: "ಕನ್ನಡ, ಹಿಂದಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ಲಭ್ಯವಿದ್ದು, ವಿವಿಧ ಪ್ರದೇಶಗಳ ಜನರಿಗೆ ಪ್ರವೇಶವನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ."
        },
        {
          title: "ಪ್ರಾದೇಶಿಕ ಸಂದರ್ಭ",
          desc: "ಭಾರತೀಯ ಆಹಾರದ ವೈವಿಧ್ಯತೆಗಳು ಮತ್ತು ಸಾಂಪ್ರದಾಯಿಕ ತಿಂಡಿಗಳ ಬಗ್ಗೆ ವಿಶೇಷವಾಗಿ ತರಬೇತಿ ನೀಡಲಾಗಿದೆ."
        }
      ],
      tagline: "ಆರೋಗ್ಯಕರ ಭಾರತದತ್ತ ಒಂದು ಹೆಜ್ಜೆ."
    },
    हिन्दी: {
      title: "AaharSense AI के बारे में",
      mission: "AaharSense AI भारतीय बाजार के लिए बनाया गया एक अगली पीढ़ी का खाद्य सुरक्षा और पोषण विश्लेषण मंच है। उन्नत AI तकनीक का उपयोग करते हुए, हम उपभोक्ताओं को रोजमर्रा के भोजन में सामग्री, पोषण मूल्य और संभावित मिलावटों की पहचान करके सूचित विकल्प चुनने में सक्षम बनाते हैं।",
      features: [
        {
          title: "मिलावट का पता लगाना",
          desc: "दृश्य विश्लेषण और सुरक्षा मानकों के माध्यम से दूध, मसालों और अनाज में सामान्य मिलावटों की पहचान करें।"
        },
        {
          title: "सुरक्षा स्कोर",
          desc: "एक एल्गोरिदम जो सामग्री की शुद्धता और पोषण घनत्व के आधार पर भोजन का मूल्यांकन करता है।"
        },
        {
          title: "बहुभाषी समर्थन",
          desc: "विविध भारतीय क्षेत्रों में पहुंच सुनिश्चित करने के लिए कन्नड़, हिंदी और अंग्रेजी में उपलब्ध है।"
        },
        {
          title: "क्षेत्रीय संदर्भ",
          desc: "भारतीय खाद्य किस्मों और पारंपरिक स्नैक्स पर विशेष रूप से प्रशिक्षित।"
        }
      ],
      tagline: "एक स्वस्थ भारत का निर्माण, हर निवाले के साथ।"
    }
  };

  const content = T[language] || T.English;

  return (
    <div className="about-container animate-fade-in">
      <div className="about-header">
        <h1 className="about-title">{content.title}</h1>
        <p className="about-mission">{content.mission}</p>
      </div>

      <div className="features-grid">
        {content.features.map((f, i) => (
          <div key={i} className="feature-card">
            <div className="feature-icon-box">
              <span className="material-icons">verified</span>
            </div>
            <h3 className="feature-card-title">{f.title}</h3>
            <p className="feature-card-desc">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="about-footer">
        <h2 className="tagline">{content.tagline}</h2>
        <p className="amd-ideathon">Built for AMD Ideathon 2024</p>
      </div>
    </div>
  );
}
