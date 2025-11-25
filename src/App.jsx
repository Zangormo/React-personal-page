import { useState, useEffect } from "react";
import "./App.css";
import Spotify from "./components/Spotify.jsx";
import BlockBlast from "./components/BlockBlast.jsx";
import { translations } from "./translations.js";
import instagramImg from "./assets/instagram.jpg";
import telegramImg from "./assets/tg.png";
import linkedinImg from "./assets/linkedin.png";
import meNshinji from "./assets/meNshinji.jpg";

function App() {
  const [language, setLanguage] = useState('en');

  const t = translations[language];

  return (
    <div className="page">
      <div className="language-selector">
        <button 
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          EN
        </button>
        <button 
          className={`lang-btn ${language === 'ru' ? 'active' : ''}`}
          onClick={() => setLanguage('ru')}
        >
          RU
        </button>
        <button 
          className={`lang-btn ${language === 'lv' ? 'active' : ''}`}
          onClick={() => setLanguage('lv')}
        >
          LV
        </button>
      </div>

      <div className="aboutMe">
        <img src={meNshinji} alt="Me with Shinji" className="meNshinji" />
        <div className="aboutMeText">
          <h1 className="aboutMeTitle">{t.aboutTitle}</h1>
          <p className="aboutMeParagraph" style={{ whiteSpace: 'pre-line' }}>
            {t.aboutText}
          </p>
        </div>
      </div>
      
      <div className="cards-container">
        <Spotify language={language} />
        <BlockBlast language={language} />
      </div>

      <footer className="footer">

        <a href="https://www.instagram.com/zangormo?igsh=MThscDJtM2tjYzF1ZQ==" target="_blank">
          <img src={instagramImg} alt="Instagram" className="instRef" />
        </a>
        <a href="https://t.me/zangormo" target="_blank">
          <img src={telegramImg} alt="Telegram" className="tgRef" />
        </a>
        <a href="https://www.linkedin.com/in/i%C4%BCja-birjukovs" target="_blank">
          <img src={linkedinImg} alt="LinkedIn" className="linkedinRef" />
        </a>
      </footer>
    </div>
  );
}

export default App;
