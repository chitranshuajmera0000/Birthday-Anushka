import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Heart, Cake, Music, Volume2, VolumeX, ChevronRight, Gift, Star } from 'lucide-react';

// Safe icon wrapper: renders the lucide icon when available, otherwise a simple fallback glyph
const SafeIcon = ({ Comp, size = 24, className = '', style = {}, children, ...props }) => {
  if (Comp) return <Comp size={size} className={className} style={style} {...props}>{children}</Comp>;
  const fontSize = typeof size === 'number' ? size : 24;
  return (
    <span className={className} style={{ fontSize: fontSize, lineHeight: 1, display: 'inline-block', ...style }} {...props}>
      {children || '★'}
    </span>
  );
};

const BirthdayWebsite = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [candlesLit, setCandlesLit] = useState(Array(17).fill(true)); // All candles lit by default
  const [allCandlesBlown, setAllCandlesBlown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [wishMade, setWishMade] = useState(false);
  const audioRef = useRef(null);
    const audioPlayerRef = useRef(null);
  const [audioCheckResult, setAudioCheckResult] = useState(null);
  const [audioBlobInfo, setAudioBlobInfo] = useState(null);

  // Make a wish first
  const makeWish = () => {
    setWishMade(true);
  };

  // Blow out candles
  const blowCandles = () => {
    setCandlesLit(Array(17).fill(false));
    setAllCandlesBlown(true);
    setShowConfetti(true);
    if (audioRef.current) {
      try {
        // reset and ensure it's ready
        // Use a dedicated in-memory Audio instance to avoid DOM re-render / removal race
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio('/happy-birthday.mp3');
          audioPlayerRef.current.loop = true;
        }
        audioPlayerRef.current.volume = 0.85;
        // If already playing, do not reset or restart — keep continuous playback
        const isPlayingNow = audioPlayerRef.current && !audioPlayerRef.current.paused && !audioPlayerRef.current.ended && audioPlayerRef.current.currentTime > 0;
        if (!isPlayingNow) {
          const p = audioPlayerRef.current.play();
          if (p && typeof p.then === 'function') {
            p.then(() => setIsMusicPlaying(true)).catch((err) => {
              // eslint-disable-next-line no-console
              console.warn('Audio play failed:', err);
              alert('Unable to play the birthday audio. Check the browser console for details.');
            });
          } else {
            setIsMusicPlaying(true);
          }
        } else {
          // already playing — ensure state
          setIsMusicPlaying(true);
        }
        // Keep checking availability asynchronously
        checkAudioAvailability().then((ok) => {
          if (!ok) alert('Audio file not reachable at /happy-birthday.mp3. Please verify the file exists in the public folder and try again.');
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Audio play failed:', err);
        alert('Unable to play the birthday audio. Check the browser console for details.');
      }
    }
    setTimeout(() => setShowConfetti(false), 5000);
  };

  // Toggle music
  const toggleMusic = () => {
    if (audioRef.current) {
      try {
        if (isMusicPlaying) {
          // pause both DOM audio (controls) and in-memory player if present
          if (audioPlayerRef.current) {
            try { audioPlayerRef.current.pause(); } catch (e) {}
          }
          audioRef.current.pause();
          setIsMusicPlaying(false);
        } else {
          // prefer in-memory player (more reliable across re-renders)
          if (!audioPlayerRef.current) {
            audioPlayerRef.current = new Audio('/happy-birthday.mp3');
            audioPlayerRef.current.loop = true;
          }
          audioPlayerRef.current.volume = 0.85;
          const p = audioPlayerRef.current.play();
          if (p && typeof p.then === 'function') {
            p.then(() => setIsMusicPlaying(true)).catch((err) => {
              // eslint-disable-next-line no-console
              console.warn('toggleMusic play failed:', err);
              alert('Unable to play audio. Check /happy-birthday.mp3 and browser console for details.');
            });
          } else {
            setIsMusicPlaying(true);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('toggleMusic play failed:', err);
        alert('Unable to play audio. Check /happy-birthday.mp3 and browser console for details.');
      }
    }
  };

  // Auto-play music while on the Cake page (page index 4). Start when landing on Cake, stop when leaving it.
  useEffect(() => {
    // Play only on Cake page (index 4)
    if (currentPage === 4) {
      try {
        if (!audioPlayerRef.current) {
          audioPlayerRef.current = new Audio('/happy-birthday.mp3');
          audioPlayerRef.current.loop = true;
        }
        audioPlayerRef.current.volume = 0.85;
        const p = audioPlayerRef.current.play();
        if (p && typeof p.then === 'function') {
          p.then(() => setIsMusicPlaying(true)).catch((err) => {
            // autoplay may be blocked; leave the control for user to start
            // eslint-disable-next-line no-console
            console.warn('Autoplay on Cake page failed:', err);
          });
        } else {
          setIsMusicPlaying(true);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('Autoplay start error:', err);
      }
    } else {
      // Pause when leaving the Cake page
      try {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current.currentTime = 0;
        }
      } catch (e) {
        // ignore
      }
      setIsMusicPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Check if the audio file is reachable and log headers (debug helper)
  const checkAudioAvailability = async () => {
    try {
      const resp = await fetch('/happy-birthday.mp3', { method: 'GET' });
      if (!resp.ok) {
        console.warn('Audio fetch not ok', resp.status);
        return false;
      }
      const ct = resp.headers.get('content-type');
      // eslint-disable-next-line no-console
      console.log('Audio fetched OK, content-type:', ct, 'size:', resp.headers.get('content-length'));
      return true;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Audio fetch error', err);
      return false;
    }
  };

  // Debug helpers: fetch and inspect blob, and play a test Audio instance
  

  // Confetti particle component
  const Confetti = () => {
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 2,
      color: ['#ff6b9d', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'][Math.floor(Math.random() * 5)]
    }));

    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute w-3 h-3 rounded-full animate-fall"
            style={{
              left: `${p.left}%`,
              top: '-10px',
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>
    );
  };

  // Small, reusable page decorations (sparkles/balloons) used on each page
  const PageDecor = ({ variant = 'default' }) => {
    const colors = {
      landing: ['#fff', '#ffe6f0', '#fff7cc'],
      welcome: ['#fffcf0', '#ffe6ff', '#e6f7ff'],
      gallery: ['#ffffff', '#ffd6e7', '#e9d5ff'],
      memory: ['#f0fff4', '#e6f7ff', '#fff3e6'],
      cake: ['#fff7e6', '#fff0f6', '#fffef6'],
      final: ['#ffffff', '#fff0fb', '#ffeedd'],
      default: ['#ffffff']
    };
    const palette = colors[variant] || colors.default;
    const items = Array.from({ length: 8 }).map((_, i) => ({
      left: Math.random() * 100,
      top: 5 + Math.random() * 90,
      size: 12 + Math.random() * 28,
      color: palette[i % palette.length]
    }));

    return (
      <div className="hidden sm:block absolute inset-0 pointer-events-none z-0">
        {items.map((it, idx) => (
          <SafeIcon
            key={idx}
            Comp={Sparkles}
            size={Math.round(it.size)}
            className="absolute animate-float"
            style={{ left: `${it.left}%`, top: `${it.top}%`, color: it.color, opacity: 0.85 }}
          >
          </SafeIcon>
        ))}
      </div>
    );
  };
  // Page 0: Landing Page
  const LandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          >
            <SafeIcon Comp={Sparkles} className="text-white opacity-60" size={16 + Math.random() * 16} />
          </div>
        ))}
      </div>
      
      <div className="text-center z-10 animate-fadeIn px-4">
        <h1 className="text-5xl sm:text-7xl font-bold text-white mb-3 animate-bounce" style={{ fontFamily: 'cursive' }}>
          🎉 17 🎉
        </h1>
        <h2 className="text-2xl sm:text-5xl font-bold text-white mb-6 drop-shadow-lg">
          Something Special Awaits...
        </h2>
          <button
          onClick={() => setCurrentPage(1)}
          className="bg-white text-purple-600 px-6 py-3 sm:px-10 sm:py-4 rounded-full text-lg sm:text-xl font-bold shadow-2xl hover:scale-110 transform transition-all duration-300 flex items-center gap-3 mx-auto group w-full sm:w-auto"
        >
          <span className="flex items-center justify-center gap-3 w-full sm:w-auto">
            Start the Celebration
            <SafeIcon Comp={ChevronRight} className="group-hover:translate-x-2 transition-transform" size={20} />
          </span>
        </button>
      </div>
    </div>
  );

  // Page 1: Welcome Message
  const WelcomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-300 flex items-center justify-center p-4 sm:p-8">
      <PageDecor variant="welcome" />
      <div className="max-w-3xl bg-white/90 backdrop-blur rounded-3xl shadow-2xl p-6 sm:p-12 animate-slideUp mx-4">
        <div className="text-center mb-6 sm:mb-8">
          <SafeIcon Comp={Gift} className="mx-auto text-pink-500 mb-4 animate-bounce" size={56} />
          <h1 className="text-3xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4 sm:mb-6" style={{ fontFamily: 'cursive' }}>
            Happy 17th Birthday!
          </h1>
          <h2 className="text-2xl sm:text-4xl font-bold text-purple-600 mb-4">Anushka Shaw</h2>
        </div>
        
        <div className="space-y-4 sm:space-y-6 text-sm sm:text-lg text-gray-700 leading-relaxed">
          <p className="text-center text-lg sm:text-2xl">
            Hey Anushka! 🎈
          </p>
          <p className="text-center">
            Get ready for a special journey I've created just for you. This isn't just any birthday wish—it's a celebration of your playful, quirky, and absolutely amazing personality!
          </p>
          <p className="text-center text-base sm:text-xl font-semibold text-purple-600 mt-6">
            Let's make this birthday unforgettable! ✨
          </p>
          <p className="text-center text-xs sm:text-sm text-gray-500 italic mt-4">
            With love, Akshat Garg 💙
          </p>
        </div>
        
        <button
          onClick={() => setCurrentPage(2)}
          className="mt-8 sm:mt-10 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-lg hover:scale-105 transform transition-all mx-auto block w-full sm:w-auto"
        >
          Continue the Journey →
        </button>
      </div>
    </div>
  );

  // Page 2: Photo Gallery
  const PhotoGallery = () => {
    const photos = [
      { id: 1, url: 'https://res.cloudinary.com/dxj9gigbq/image/upload/v1763925923/1_xzoxx6.jpg', caption: "Your amazing smile! 😊" },
      { id: 2, url: 'https://res.cloudinary.com/dxj9gigbq/image/upload/v1763926207/2_yel4ra.jpg', caption: "Being absolutely quirky! 🌟" },
      { id: 3, url: 'https://res.cloudinary.com/dxj9gigbq/image/upload/v1763925923/3_wsyj2s.jpg', caption: "Radiating positive vibes! ✨" },
      { id: 4, url: 'https://res.cloudinary.com/dxj9gigbq/image/upload/v1763926207/4_gtzsnh.jpg', caption: "Just being YOU! 💖" },
      { id: 5, url: 'https://res.cloudinary.com/dxj9gigbq/image/upload/v1763926207/5_o98gnb.jpg', caption: "The best moments! 🎉" },
      { id: 6, url: 'https://res.cloudinary.com/dxj9gigbq/image/upload/v1763925924/6_libuwg.jpg', caption: "Memories that last forever 📸" }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4 sm:p-8">
        <PageDecor variant="gallery" />
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-5xl font-bold text-center text-purple-700 mb-8 sm:mb-12 animate-fadeIn" style={{ fontFamily: 'cursive' }}>
            Captured Memories 📸
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-8">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 hover:rotate-2 transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="h-48 sm:h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {photo.url ? (
                    // eslint-disable-next-line jsx-a11y/img-redundant-alt
                    <img src={photo.url} alt={`Photo ${photo.id}`} className="w-full h-48 sm:h-64 object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <div className="text-6xl mb-4">📷</div>
                      <p className="text-sm text-gray-600">
                        [Photo {photo.id} will go here]
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Add your image URL in the code
                      </p>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-6 bg-white">
                  <p className="text-center text-base sm:text-lg font-semibold text-purple-600">
                    {photo.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(3)}
            className="mt-8 sm:mt-12 bg-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-lg hover:scale-105 transform transition-all mx-auto block w-full sm:w-auto"
          >
            More Surprises Ahead! →
          </button>
        </div>
      </div>
    );
  };

  // Page 3: Memory Lane
  const MemoryLane = () => {
    const memories = [
      { title: "Your Playful Spirit", text: "Always bringing joy and laughter wherever you go!" },
      { title: "Quirky & Unique", text: "Never afraid to be yourself - that's what makes you special!" },
      { title: "17 Years of Awesome", text: "Every year getting more amazing than the last!" },
      { title: "Your Energy", text: "Infectious positivity that lights up every room!" }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-200 via-teal-200 to-blue-300 p-4 sm:p-8 flex items-center">
        <PageDecor variant="memory" />
        <div className="max-w-4xl mx-auto w-full px-4">
          <h2 className="text-3xl sm:text-5xl font-bold text-center text-teal-700 mb-8 sm:mb-16 animate-fadeIn" style={{ fontFamily: 'cursive' }}>
            What Makes You Special 💫
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memories.map((memory, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur rounded-2xl p-4 sm:p-8 shadow-xl transform hover:scale-105 transition-all animate-slideUp"
                style={{ animationDelay: `${index * 0.12}s` }}
              >
                <div className="flex items-start gap-4">
                  <SafeIcon Comp={Star} className="text-yellow-500 flex-shrink-0 mt-1" size={28} />
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-purple-600 mb-2">
                      {memory.title}
                    </h3>
                    <p className="text-gray-700 text-base sm:text-lg">
                      {memory.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10 sm:mt-16">
            <p className="text-lg sm:text-2xl text-teal-800 font-semibold mb-6">
              Now, for the MAIN event... 🎂
            </p>
            <button
              onClick={() => setCurrentPage(4)}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-full text-base sm:text-xl font-bold shadow-2xl hover:scale-110 transform transition-all w-full sm:w-auto"
            >
              Let's Cut The Cake! 🎂
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Page 4: Birthday Cake (THE BIG MOMENT!)
  const CakePage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-rose-900 flex items-center justify-center relative overflow-hidden">
        {showConfetti && <Confetti />}
        <PageDecor variant="cake" />
        
        {/* Elegant particle background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-twinkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${1 + Math.random() * 3}px`,
                height: `${1 + Math.random() * 3}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Floating hearts */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <SafeIcon
              Comp={Heart}
              key={i}
              className="absolute text-pink-400 opacity-20 animate-float"
              size={20 + Math.random() * 30}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${4 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">
          {!allCandlesBlown ? (
            <div className="text-center">
              {/* Title */}
              <div className="mb-8 sm:mb-12 animate-fadeIn px-2 sm:px-0">
                <h1 className="text-3xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 mb-3 sm:mb-4 drop-shadow-2xl" style={{ fontFamily: 'cursive' }}>
                  Make a Wish!
                </h1>
                <p className="text-base sm:text-2xl text-pink-200">
                  Anushka's 17th Birthday Celebration
                </p>
              </div>

              {/* Main cake container */}
              <div className="relative inline-block">
                {/* Soft glow background */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-pink-500/20 rounded-3xl" />

                <div className="relative bg-white/5 backdrop-blur rounded-3xl p-6 md:p-10 shadow-2xl border border-white/10 max-w-3xl mx-auto">
                  <div className="relative w-full max-w-md mx-auto mb-6">
                    <div className="relative">
                      <img
                        src="https://res.cloudinary.com/dxj9gigbq/image/upload/v1763926729/262492-P4XEPI-745_mfsk1n.jpg"
                        alt="Birthday Cake"
                        className="w-full h-auto rounded-2xl shadow-2xl object-cover"
                      />

                      {/* Numeric candles overlay '1' and '7' to form 17 */}
                      <div className="absolute inset-0 pointer-events-none">
                        {/* '1' */}
                        <div style={{ left: '38%', top: '-2%' }} className="absolute transform -translate-x-1/2 flex flex-col items-center">
                          {/* flame above the number - updated color */}
                          {!allCandlesBlown && (
                            <div className="w-5 h-8 rounded-full animate-flicker shadow-lg mb-1" style={{ background: 'linear-gradient(to top, #ff6b9d, #ff9fb8, #fff3b0)' }} />
                          )}
                          <div className="text-6xl md:text-9xl font-extrabold drop-shadow-md" style={{ fontFamily: 'cursive', color: '#FF6B9D' }}>1</div>
                        </div>

                        {/* '7' */}
                        <div style={{ left: '62%', top: '-2%' }} className="absolute transform -translate-x-1/2 flex flex-col items-center">
                          {!allCandlesBlown && (
                            <div className="w-5 h-8 rounded-full animate-flicker shadow-lg mb-1" style={{ background: 'linear-gradient(to top, #ff6b9d, #ff9fb8, #fff3b0)' }} />
                          )}
                          <div className="text-6xl md:text-9xl font-extrabold drop-shadow-md" style={{ fontFamily: 'cursive', color: '#FF6B9D' }}>7</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Move headline below the cake so it's readable */}
                  <div className="text-center mb-4 pointer-events-none">
                    <p className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'cursive' }}>
                      Happy Birthday
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-purple-200 mt-1" style={{ fontFamily: 'cursive' }}>
                      Anushka
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 space-y-6 text-center">
                    {!wishMade ? (
                      <div className="animate-fadeIn">
                        <p className="text-white text-2xl md:text-3xl mb-4 font-light">
                          Close your eyes, take a deep breath...
                        </p>
                        <p className="text-pink-300 text-xl md:text-2xl mb-4">
                          and make your most special wish ✨
                        </p>
                        <button
                          onClick={makeWish}
                          className="group bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-white px-6 py-3 sm:px-12 sm:py-4 rounded-full text-base sm:text-xl font-bold shadow-2xl hover:scale-105 transform transition-all relative overflow-hidden w-full sm:w-auto"
                        >
                          <span className="relative z-10">I've Made My Wish! ⭐</span>
                        </button>
                      </div>
                    ) : (
                      <div className="animate-fadeIn">
                        <p className="text-yellow-300 text-xl sm:text-3xl mb-3 sm:mb-4 font-bold animate-bounce">
                          Now... blow out the candles! 💨
                        </p>
                        <button
                          onClick={blowCandles}
                          className="group bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 text-white px-6 py-3 sm:px-10 sm:py-4 rounded-full text-base sm:text-2xl font-bold shadow-2xl hover:scale-105 transform transition-all animate-pulse relative overflow-hidden w-full sm:w-auto"
                        >
                          <span className="relative z-10">💨 BLOW! 💨</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center animate-fadeIn">
              {/* Success celebration */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-12 md:p-20 shadow-2xl border border-white/20 max-w-4xl mx-auto">
                          <div className="mb-6 sm:mb-8">
                          <div className="text-6xl sm:text-9xl mb-4 sm:mb-6 animate-bounce">🎉</div>
                          <div className="flex justify-center gap-4 text-4xl sm:text-6xl mb-4 sm:mb-6">
                            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>🎊</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>🎈</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>✨</span>
                          </div>
                        </div>
                        
                        <h2 className="text-3xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-300 to-yellow-300 mb-6 sm:mb-8 animate-pulse drop-shadow-2xl" style={{ fontFamily: 'cursive' }}>
                          HAPPY 17TH BIRTHDAY
                        </h2>
                        <h3 className="text-2xl sm:text-4xl font-bold text-white mb-8">
                          ANUSHKA! 🎂
                        </h3>
                
                <div className="space-y-6 text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
                  <p className="leading-relaxed">
                    May this year bring you endless joy, laughter, and amazing adventures!
                  </p>
                  <p className="text-pink-300 text-2xl md:text-3xl font-semibold">
                    Keep being the playful, quirky, wonderful person you are! 💖
                  </p>
                </div>
                
                <div className="flex justify-center gap-4 text-7xl my-10">
                  <span className="animate-bounce" style={{ animationDelay: '0s' }}>🎂</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>✨</span>
                  <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>🎈</span>
                </div>
                
                <button
                  onClick={() => setCurrentPage(5)}
                  className="group bg-white text-purple-600 px-6 py-3 sm:px-12 sm:py-4 rounded-full text-base sm:text-2xl font-bold shadow-2xl hover:scale-110 transform transition-all hover:shadow-white/50 relative overflow-hidden w-full sm:w-auto"
                >
                  <span className="relative z-10">One More Surprise! →</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-pink-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Music control */}
        <button
          onClick={toggleMusic}
          className="fixed bottom-6 right-4 sm:right-8 bg-white/90 backdrop-blur text-purple-600 p-3 sm:p-4 rounded-full shadow-2xl hover:scale-105 transform transition-all z-50 border-2 border-purple-300"
          title={isMusicPlaying ? "Pause Music" : "Play Music"}
        >
          {isMusicPlaying ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>

        {/* debug panel removed */}

        {/* Hidden audio element - ADD YOUR SONG URL HERE */}
        <audio ref={audioRef} loop preload="auto" onError={() => { console.error('Audio failed to load: /happy-birthday.mp3'); alert('Audio file failed to load — ensure /happy-birthday.mp3 exists in the public folder and is accessible.'); }}>
          <source src="/happy-birthday.mp3" type="audio/mpeg" />
        </audio>
      </div>
    );
  };

  // Page 5: Final Wishes
  const FinalPage = () => {
    const wishes = [
      "May all your dreams come true this year! ✨",
      "Keep spreading joy wherever you go! 😊",
      "Stay as quirky and unique as you are! 🌈",
      "May you laugh until your cheeks hurt! 😄",
      "Adventure awaits you at every corner! 🗺️",
      "Keep shining bright like the star you are! ⭐",
      "May your days be filled with surprises! 🎁",
      "Dance like nobody's watching! 💃",
      "Create memories that last forever! 📸",
      "May your heart be light and happy! 💕",
      "Chase your passions fearlessly! 🎯",
      "Surround yourself with love and laughter! 🤗",
      "Be bold, be brave, be YOU! 💪",
      "May every day be an adventure! 🚀",
      "Keep being absolutely amazing! 🌟",
      "Celebrate yourself every single day! 🎉",
      "Here's to 17 and many more incredible years! 🥳"
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-indigo-500 p-6 sm:p-12 flex items-center">
        <PageDecor variant="final" />
        <div className="max-w-5xl mx-auto w-full px-4">
          <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
              <SafeIcon Comp={Heart} className="mx-auto text-white mb-4 animate-pulse" size={56} />
              <h1 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4" style={{ fontFamily: 'cursive' }}>
                17 Wishes for You! 🎈
              </h1>
              <p className="text-base sm:text-2xl text-white/90">
                From Akshat, with love 💙
              </p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {wishes.map((wish, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl transform hover:scale-105 hover:rotate-1 transition-all animate-slideUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl font-bold text-purple-600">{index + 1}.</span>
                  <p className="text-gray-700 text-lg flex-1">{wish}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/90 backdrop-blur rounded-3xl p-10 shadow-2xl text-center animate-fadeIn">
            <h2 className="text-4xl font-bold text-purple-600 mb-6">
              Thank You for Being YOU! 💖
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Anushka, you bring so much light and joy to everyone around you. 
              Your playful spirit and quirky personality make every moment special.
              Here's to celebrating not just your birthday, but the incredible person you are!
            </p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-8">
              Happy 17th Birthday! <SafeIcon Comp={Cake} className="inline-block text-pink-400 mx-2" size={28} /><SafeIcon Comp={Sparkles} className="inline-block text-yellow-300 ml-1" size={24} />
            </p>
            <p className="text-lg text-gray-600 italic">
              ~ Akshat Garg
            </p>
            <p className="text-sm text-gray-500 mt-3">Website by <a href="https://www.instagram.com/ajmera_chitranshu_9999/" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:underline font-semibold">Chitranshu</a> <span role="img" aria-label="wink" className="ml-1">😉</span></p>
            <div className="max-w-xs mx-auto">
              <button
                onClick={() => setCurrentPage(0)}
                className="mt-6 sm:mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-3 rounded-full font-semibold shadow-lg hover:scale-105 transform transition-all w-full"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Celebrate Again!
                  <SafeIcon Comp={ChevronRight} size={18} className="ml-1" />
                </span>
              </button>
            </div>
            {/* Share Memories button removed per request */}
          </div>
        </div>
      </div>
    );
  };

  const pages = [
    <LandingPage key="landing" />,
    <WelcomePage key="welcome" />,
    <PhotoGallery key="gallery" />,
    <MemoryLane key="memory" />,
    <CakePage key="cake" />,
    <FinalPage key="final" />
  ];

  // MemoriesShare feature removed: pages list remains without a separate memories page

  // Temporary: add keyboard navigation handlers (ArrowLeft / ArrowRight)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') setCurrentPage(p => Math.max(0, p - 1));
      if (e.key === 'ArrowRight') setCurrentPage(p => Math.min(pages.length - 1, p + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pages.length]);

  // Ensure each page starts at the top when navigating
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      // also reset document/body scroll for some browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    } catch (e) {
      // ignore
    }
  }, [currentPage]);

  return (
    <div className="relative overflow-x-hidden">
      {/* Page indicator */}
      <div className="hidden sm:flex fixed top-8 right-8 flex gap-2 z-40">
        {pages.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              currentPage === index ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Prev/Next navigation removed for production/mobile-ready site */}
      

      {/* Current page */}
      {pages[currentPage]}

      {/* Animations moved to src/index.css for Tailwind build */}
    </div>
  );
};

export default BirthdayWebsite;