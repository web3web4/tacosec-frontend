import React, { useState, useEffect, useRef } from 'react';
import { Logo } from "@/assets";
import "./Loading.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const Loading: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showSlowWarning, setShowSlowWarning] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);

  const steps = [
    "Initializing TACo...",
    "Loading wallet...",
    "Connecting..."
  ];

  // Initialize particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);


    const particleCount = 60;
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width / window.devicePixelRatio,
        y: Math.random() * canvas.height / window.devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 1
      });
    }
    
    particlesRef.current = particles;


    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.clearRect(0, 0, width, height);


      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;


        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;


        particle.x = Math.max(0, Math.min(width, particle.x));
        particle.y = Math.max(0, Math.min(height, particle.y));
      });


      const maxDistance = 150;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.8;

            ctx.strokeStyle = `rgba(149, 255, 93, ${opacity})`;
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(149, 255, 93, 0.8)';
            
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            
            ctx.shadowBlur = 0;
          }
        }
      }

      particles.forEach(particle => {

        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, 'rgba(149, 255, 93, 0.8)');
        gradient.addColorStop(0.5, 'rgba(149, 255, 93, 0.3)');
        gradient.addColorStop(1, 'rgba(149, 255, 93, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(149, 255, 93, 1)';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const stage1 = setTimeout(() => setCurrentStep(1), 2000);
    const stage2 = setTimeout(() => setCurrentStep(2), 4000);
    
    const slowWarning = setTimeout(() => {
      setShowSlowWarning(true);
    }, 7000);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(stage1);
      clearTimeout(stage2);
      clearTimeout(slowWarning);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="loading-container">
      <canvas ref={canvasRef} className="neural-canvas" />

      <div className="loading-content">
        <div className="logo-container">
          <img src={Logo} alt="TACO Sec Logo" className="logo-image" />
          <div className="logo-pulse"></div>
        </div>
        
        {/* Progress Indicator */}
        <div className="progress-container">
          <div className="progress-text">
            {isOffline ? (
              <span className="offline-warning">⚠ No internet connection</span>
            ) : (
              <>
                <span className="step-label">{steps[currentStep]}</span>
                <span className="step-counter">{currentStep + 1}/3</span>
              </>
            )}
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Slow Connection */}
        {showSlowWarning && !isOffline && (
          <div className="slow-warning">
            Slow connection detected...
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;