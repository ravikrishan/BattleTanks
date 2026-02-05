import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Target, Zap, Wind } from 'lucide-react';

const TanksGame = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Game state
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [gamePhase, setGamePhase] = useState('aiming'); // 'aiming', 'firing', 'waiting'
  const [movesLeft, setMovesLeft] = useState(4);
  const [weaponDropdownOpen, setWeaponDropdownOpen] = useState(false);
  const [currentScene, setCurrentScene] = useState('mountains');
  const [explosion, setExplosion] = useState(null);
  const [clouds, setClouds] = useState([]);
  const [stars, setStars] = useState([]);
  
  // Player 1 state
  const [player1, setPlayer1] = useState({
    x: 150,
    health: 100,
    angle: 45,
    power: 50,
    selectedWeapon: 'Standard',
    movesRemaining: 4,
  });
  
  // Player 2 state
  const [player2, setPlayer2] = useState({
    x: 650,
    health: 100,
    angle: 135,
    power: 50,
    selectedWeapon: 'Standard',
    movesRemaining: 4,
  });
  
  // Projectile state
  const [projectile, setProjectile] = useState(null);
  
  // Environment
  const gravity = 1;
  const wind = 1;
  const weapons = ['Standard', 'Heavy', 'Cluster'];
  const scenes = ['mountains', 'desert', 'arctic'];
  
  // Time-based sky
  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 18;
  
  // Mountain terrain
  const mountainPoints = useRef([]);
  
  // Initialize clouds and stars
  useEffect(() => {
    if (isNight) {
      // Generate stars
      const starArray = [];
      for (let i = 0; i < 100; i++) {
        starArray.push({
          x: Math.random() * 800,
          y: Math.random() * 400,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 0.02 + 0.01,
        });
      }
      setStars(starArray);
    } else {
      // Generate clouds
      const cloudArray = [];
      for (let i = 0; i < 8; i++) {
        cloudArray.push({
          x: Math.random() * 900 - 100,
          y: Math.random() * 200 + 50,
          size: Math.random() * 80 + 60,
          speed: Math.random() * 0.05 + 0.02,
        });
      }
      setClouds(cloudArray);
    }
  }, [isNight]);
  
  // Animate clouds and stars
  useEffect(() => {
    const interval = setInterval(() => {
      if (isNight) {
        setStars(prev => prev.map(star => ({
          ...star,
          x: (star.x + wind * star.speed * 2 + 800) % 800,
        })));
      } else {
        setClouds(prev => prev.map(cloud => ({
          ...cloud,
          x: (cloud.x + wind * cloud.speed * 2 + 900) % 900 - 100,
        })));
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [isNight, wind]);
  
  // Initialize terrain
  useEffect(() => {
    const width = 800;
    const points = [];
    
    // Generate mountain range with more detail
    points.push({ x: 0, y: 500 });
    
    for (let x = 0; x <= width; x += 20) {
      const baseHeight = 450;
      const mainWave = Math.sin(x / 100) * 100;
      const detailWave = Math.cos(x / 40) * 30;
      const microDetail = Math.sin(x / 15) * 10;
      const randomness = (Math.sin(x * 0.1) * Math.cos(x * 0.05)) * 15;
      const y = baseHeight + mainWave + detailWave + microDetail + randomness;
      points.push({ x, y });
    }
    
    points.push({ x: width, y: 500 });
    mountainPoints.current = points;
  }, [currentScene]);
  
  // Get tank Y position based on terrain
  const getTankY = (x) => {
    for (let i = 0; i < mountainPoints.current.length - 1; i++) {
      const p1 = mountainPoints.current[i];
      const p2 = mountainPoints.current[i + 1];
      
      if (x >= p1.x && x <= p2.x) {
        const ratio = (x - p1.x) / (p2.x - p1.x);
        return p1.y + (p2.y - p1.y) * ratio;
      }
    }
    return 450;
  };
  
  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw sky based on time of day
      if (isNight) {
        // Night sky
        const nightGradient = ctx.createLinearGradient(0, 0, 0, height);
        nightGradient.addColorStop(0, '#0a0a1a');
        nightGradient.addColorStop(0.5, '#1a1a3e');
        nightGradient.addColorStop(1, '#2a2a4e');
        ctx.fillStyle = nightGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Draw stars
        stars.forEach(star => {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Moon
        ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
        ctx.shadowBlur = 30;
        ctx.shadowColor = 'rgba(255, 255, 200, 0.5)';
        ctx.beginPath();
        ctx.arc(700, 100, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // Day sky
        const dayGradient = ctx.createLinearGradient(0, 0, 0, height);
        dayGradient.addColorStop(0, '#87CEEB');
        dayGradient.addColorStop(0.7, '#B0D8F0');
        dayGradient.addColorStop(1, '#E0F6FF');
        ctx.fillStyle = dayGradient;
        ctx.fillRect(0, 0, width, height);
        
        // Sun
        ctx.fillStyle = 'rgba(255, 220, 100, 0.8)';
        ctx.shadowBlur = 40;
        ctx.shadowColor = 'rgba(255, 220, 100, 0.6)';
        ctx.beginPath();
        ctx.arc(150, 100, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Draw clouds
        clouds.forEach(cloud => {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
          
          // Cloud shape (multiple circles)
          ctx.beginPath();
          ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
          ctx.arc(cloud.x + cloud.size * 0.3, cloud.y - cloud.size * 0.1, cloud.size * 0.4, 0, Math.PI * 2);
          ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.45, 0, Math.PI * 2);
          ctx.arc(cloud.x + cloud.size * 0.9, cloud.y + cloud.size * 0.05, cloud.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }
      
      // Draw mountains with 3D effect
      // Back layer (darker)
      ctx.fillStyle = isNight ? '#1a2e24' : '#4a7c59';
      ctx.beginPath();
      ctx.moveTo(0, height);
      mountainPoints.current.forEach((point, i) => {
        if (i % 2 === 0) {
          ctx.lineTo(point.x, point.y - 40);
        }
      });
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      
      // Middle layer
      ctx.fillStyle = isNight ? '#2d4a3e' : '#5a9c6a';
      ctx.beginPath();
      ctx.moveTo(0, height);
      mountainPoints.current.forEach((point, i) => {
        ctx.lineTo(point.x, point.y - 20);
      });
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      
      // Front layer (main terrain)
      ctx.fillStyle = isNight ? '#2d4a3e' : '#6aac7a';
      ctx.strokeStyle = isNight ? '#1a2e24' : '#4a7c59';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      mountainPoints.current.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Add highlights and shadows for 3D effect
      ctx.strokeStyle = isNight ? 'rgba(100, 150, 100, 0.3)' : 'rgba(150, 220, 150, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      mountainPoints.current.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          // Highlight peaks
          const prevPoint = mountainPoints.current[i - 1];
          if (point.y < prevPoint.y) {
            ctx.lineTo(point.x, point.y - 2);
          }
        }
      });
      ctx.stroke();
      
      // Add shadow lines in valleys
      ctx.strokeStyle = isNight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      mountainPoints.current.forEach((point, i) => {
        if (i > 0) {
          const prevPoint = mountainPoints.current[i - 1];
          if (point.y > prevPoint.y) {
            ctx.moveTo(prevPoint.x, prevPoint.y);
            ctx.lineTo(point.x, point.y + 3);
          }
        }
      });
      ctx.stroke();
      
      // Draw Player 1 tank
      const p1Y = getTankY(player1.x);
      drawTank(ctx, player1.x, p1Y, player1.angle, '#00d4ff', currentPlayer === 1);
      
      // Draw Player 2 tank
      const p2Y = getTankY(player2.x);
      drawTank(ctx, player2.x, p2Y, player2.angle, '#ff4444', currentPlayer === 2);
      
      // Draw projectile if firing
      if (projectile) {
        ctx.fillStyle = '#ffaa00';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffaa00';
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Trail effect
        ctx.fillStyle = 'rgba(255, 170, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(projectile.x - projectile.vx * 2, projectile.y - projectile.vy * 2, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw explosion effect
      if (explosion) {
        const progress = (Date.now() - explosion.startTime) / explosion.duration;
        if (progress < 1) {
          const radius = explosion.maxRadius * progress;
          const alpha = 1 - progress;
          
          // Outer blast
          ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.6})`;
          ctx.shadowBlur = 30;
          ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
          ctx.beginPath();
          ctx.arc(explosion.x, explosion.y, radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Inner blast
          ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.8})`;
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(255, 200, 0, 0.9)';
          ctx.beginPath();
          ctx.arc(explosion.x, explosion.y, radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
          
          // Core
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(255, 255, 255, 1)';
          ctx.beginPath();
          ctx.arc(explosion.x, explosion.y, radius * 0.3, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.shadowBlur = 0;
        } else {
          setExplosion(null);
        }
      }
    };
    
    const drawTank = (ctx, x, y, angle, color, isActive) => {
      // Tank body
      ctx.fillStyle = color;
      if (isActive) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = color;
      }
      
      // Base
      ctx.fillRect(x - 20, y - 15, 40, 15);
      
      // Turret
      ctx.fillRect(x - 12, y - 25, 24, 12);
      
      // Draw barrel
      const barrelLength = 30;
      const angleRad = (angle - 90) * Math.PI / 180;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y - 19);
      ctx.lineTo(
        x + Math.cos(angleRad) * barrelLength,
        y - 19 + Math.sin(angleRad) * barrelLength
      );
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      // Tracks
      ctx.fillStyle = '#333';
      ctx.fillRect(x - 22, y, 44, 4);
      
      // Track details
      ctx.fillStyle = '#555';
      for (let i = -20; i <= 20; i += 8) {
        ctx.fillRect(x + i, y, 4, 4);
      }
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [player1, player2, projectile, currentPlayer, explosion, clouds, stars, isNight]);
  
  // Physics simulation for projectile
  useEffect(() => {
    if (!projectile || gamePhase !== 'firing') return;
    
    let animationId;
    let shouldStop = false;
    
    const animate = () => {
      if (shouldStop) return;
      
      setProjectile(prev => {
        if (!prev) return null;
        
        const newVx = prev.vx + wind * 0.02;
        const newVy = prev.vy + gravity * 0.3;
        const newX = prev.x + newVx;
        const newY = prev.y + newVy;
        
        // Check bounds
        if (newX < 0 || newX > 800 || newY > 600) {
          shouldStop = true;
          handleImpact(newX, Math.min(newY, 600), 'bounds');
          return null;
        }
        
        // Check terrain collision
        const terrainY = getTankY(newX);
        if (newY >= terrainY) {
          shouldStop = true;
          handleImpact(newX, terrainY, 'terrain');
          return null;
        }
        
        // Check tank collision
        const p1Y = getTankY(player1.x);
        const p2Y = getTankY(player2.x);
        
        if (Math.abs(newX - player1.x) < 20 && Math.abs(newY - p1Y) < 25) {
          shouldStop = true;
          handleImpact(newX, newY, 'tank1');
          return null;
        }
        
        if (Math.abs(newX - player2.x) < 20 && Math.abs(newY - p2Y) < 25) {
          shouldStop = true;
          handleImpact(newX, newY, 'tank2');
          return null;
        }
        
        return {
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy,
        };
      });
      
      if (!shouldStop) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    const handleImpact = (x, y, type) => {
      // Show explosion
      setExplosion({
        x,
        y,
        startTime: Date.now(),
        duration: 500,
        maxRadius: 50,
      });
      
      // Calculate damage
      if (type === 'terrain' || type === 'bounds') {
        const splashRadius = 40;
        const p1Y = getTankY(player1.x);
        const p2Y = getTankY(player2.x);
        
        const dist1 = Math.sqrt(Math.pow(x - player1.x, 2) + Math.pow(y - p1Y, 2));
        const dist2 = Math.sqrt(Math.pow(x - player2.x, 2) + Math.pow(y - p2Y, 2));
        
        if (dist1 < splashRadius) {
          const damage = Math.round(20 * (1 - dist1 / splashRadius));
          setPlayer1(p => ({ ...p, health: Math.max(0, p.health - damage) }));
        }
        
        if (dist2 < splashRadius) {
          const damage = Math.round(20 * (1 - dist2 / splashRadius));
          setPlayer2(p => ({ ...p, health: Math.max(0, p.health - damage) }));
        }
      } else if (type === 'tank1') {
        setPlayer1(p => ({ ...p, health: Math.max(0, p.health - 30) }));
      } else if (type === 'tank2') {
        setPlayer2(p => ({ ...p, health: Math.max(0, p.health - 30) }));
      }
      
      // End turn after explosion
      setTimeout(() => {
        setProjectile(null);
        setGamePhase('aiming');
        setCurrentPlayer(prev => {
          const nextPlayer = prev === 1 ? 2 : 1;
          if (nextPlayer === 1) {
            setPlayer1(p => ({ ...p, movesRemaining: 4 }));
          } else {
            setPlayer2(p => ({ ...p, movesRemaining: 4 }));
          }
          return nextPlayer;
        });
      }, 600);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => {
      shouldStop = true;
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [projectile, gamePhase]);
  
  const handleExplosion = (x, y) => {
    // Create explosion effect
    setExplosion({
      x,
      y,
      startTime: Date.now(),
      duration: 500,
      maxRadius: 50,
    });
    
    // Check splash damage for nearby tanks
    const splashRadius = 40;
    
    const p1Y = getTankY(player1.x);
    const p2Y = getTankY(player2.x);
    
    const dist1 = Math.sqrt(Math.pow(x - player1.x, 2) + Math.pow(y - p1Y, 2));
    const dist2 = Math.sqrt(Math.pow(x - player2.x, 2) + Math.pow(y - p2Y, 2));
    
    if (dist1 < splashRadius) {
      const damage = Math.round(20 * (1 - dist1 / splashRadius));
      setPlayer1(prev => ({ ...prev, health: Math.max(0, prev.health - damage) }));
    }
    
    if (dist2 < splashRadius) {
      const damage = Math.round(20 * (1 - dist2 / splashRadius));
      setPlayer2(prev => ({ ...prev, health: Math.max(0, prev.health - damage) }));
    }
    
    setTimeout(() => endTurn(), 600);
  };
  
  const handleHit = (playerNum, x, y) => {
    // Create explosion effect
    setExplosion({
      x,
      y,
      startTime: Date.now(),
      duration: 500,
      maxRadius: 50,
    });
    
    const damage = 30;
    
    if (playerNum === 1) {
      setPlayer1(prev => ({ ...prev, health: Math.max(0, prev.health - damage) }));
    } else {
      setPlayer2(prev => ({ ...prev, health: Math.max(0, prev.health - damage) }));
    }
    
    setTimeout(() => endTurn(), 600);
  };
  
  const endTurn = () => {
    setProjectile(null);
    setGamePhase('aiming');
    
    // Reset moves for the next player
    if (currentPlayer === 1) {
      setPlayer2(prev => ({ ...prev, movesRemaining: 4 }));
    } else {
      setPlayer1(prev => ({ ...prev, movesRemaining: 4 }));
    }
    
    setCurrentPlayer(prev => prev === 1 ? 2 : 1);
  };
  
  const fire = () => {
    if (gamePhase !== 'aiming') return;
    
    const player = currentPlayer === 1 ? player1 : player2;
    const tankY = getTankY(player.x);
    
    const angleRad = (player.angle - 90) * Math.PI / 180;
    const powerMultiplier = player.power / 100;
    const initialVelocity = 20 * powerMultiplier; // Increased base velocity for better range
    
    const vx = Math.cos(angleRad) * initialVelocity;
    const vy = Math.sin(angleRad) * initialVelocity;
    
    setProjectile({
      x: player.x + Math.cos(angleRad) * 30,
      y: tankY - 19 + Math.sin(angleRad) * 30,
      vx,
      vy,
    });
    
    setGamePhase('firing');
  };
  
  const moveLeft = () => {
    if (gamePhase !== 'aiming') return;
    
    if (currentPlayer === 1) {
      if (player1.movesRemaining <= 0) return;
      setPlayer1(prev => ({ 
        ...prev, 
        x: Math.max(50, prev.x - 20),
        movesRemaining: prev.movesRemaining - 1
      }));
    } else {
      if (player2.movesRemaining <= 0) return;
      setPlayer2(prev => ({ 
        ...prev, 
        x: Math.max(50, prev.x - 20),
        movesRemaining: prev.movesRemaining - 1
      }));
    }
  };
  
  const moveRight = () => {
    if (gamePhase !== 'aiming') return;
    
    if (currentPlayer === 1) {
      if (player1.movesRemaining <= 0) return;
      setPlayer1(prev => ({ 
        ...prev, 
        x: Math.min(750, prev.x + 20),
        movesRemaining: prev.movesRemaining - 1
      }));
    } else {
      if (player2.movesRemaining <= 0) return;
      setPlayer2(prev => ({ 
        ...prev, 
        x: Math.min(750, prev.x + 20),
        movesRemaining: prev.movesRemaining - 1
      }));
    }
  };
  
  const adjustAngle = (delta) => {
    if (gamePhase !== 'aiming') return;
    
    if (currentPlayer === 1) {
      setPlayer1(prev => ({ 
        ...prev, 
        angle: (prev.angle + delta + 360) % 360 
      }));
    } else {
      setPlayer2(prev => ({ 
        ...prev, 
        angle: (prev.angle + delta + 360) % 360 
      }));
    }
  };
  
  const adjustPower = (delta) => {
    if (gamePhase !== 'aiming') return;
    
    if (currentPlayer === 1) {
      setPlayer1(prev => ({ 
        ...prev, 
        power: Math.max(0, Math.min(100, prev.power + delta))
      }));
    } else {
      setPlayer2(prev => ({ 
        ...prev, 
        power: Math.max(0, Math.min(100, prev.power + delta))
      }));
    }
  };
  
  const currentPlayerData = currentPlayer === 1 ? player1 : player2;
  const isGameActive = player1.health > 0 && player2.health > 0;
  
  return (
    <div style={{
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
      fontFamily: 'Arial, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(90deg, #1a1a2e, #16213e)',
        padding: '16px',
        borderBottom: '2px solid #00d4ff',
      }}>
        <h1 style={{
          margin: 0,
          color: '#00d4ff',
          fontSize: '28px',
          textAlign: 'center',
          textShadow: '0 0 10px #00d4ff',
          fontWeight: 'bold',
        }}>
          ⚔️ TANKS ⚔️
        </h1>
      </div>
      
      {/* Player Status Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            color: currentPlayer === 1 ? '#00d4ff' : '#888',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '4px',
          }}>
            Player 1 {currentPlayer === 1 && '⭐'}
          </div>
          <div style={{
            background: '#333',
            height: '20px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: currentPlayer === 1 ? '2px solid #00d4ff' : '2px solid #555',
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #00d4ff, #0099cc)',
              height: '100%',
              width: `${player1.health}%`,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ color: '#00d4ff', fontSize: '12px', marginTop: '2px' }}>
            HP: {player1.health}%
          </div>
        </div>
        
        <div style={{ width: '40px' }} />
        
        <div style={{ flex: 1 }}>
          <div style={{
            color: currentPlayer === 2 ? '#ff4444' : '#888',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '4px',
            textAlign: 'right',
          }}>
            Player 2 {currentPlayer === 2 && '⭐'}
          </div>
          <div style={{
            background: '#333',
            height: '20px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: currentPlayer === 2 ? '2px solid #ff4444' : '2px solid #555',
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #ff4444, #cc0000)',
              height: '100%',
              width: `${player2.health}%`,
              transition: 'width 0.3s',
            }} />
          </div>
          <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '2px', textAlign: 'right' }}>
            HP: {player2.health}%
          </div>
        </div>
      </div>
      
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{
          width: '100%',
          display: 'block',
          background: '#000',
        }}
      />
      
      {/* Controls */}
      {isGameActive && (
        <div style={{
          padding: '12px',
          background: isNight 
            ? 'linear-gradient(to top, rgba(45, 74, 62, 0.85), rgba(45, 74, 62, 0.6))' 
            : 'linear-gradient(to top, rgba(106, 172, 122, 0.85), rgba(106, 172, 122, 0.6))',
          position: 'relative',
          height: '180px',
          backdropFilter: 'blur(5px)',
        }}>
          {/* Left Side - Movement & Weapon Dropdown */}
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '12px',
            width: '120px',
          }}>
            {/* Movement Controls */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                <button
                  onClick={moveLeft}
                  disabled={currentPlayerData.movesRemaining === 0 || gamePhase !== 'aiming'}
                  style={{
                    padding: '10px 14px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: currentPlayerData.movesRemaining > 0 && gamePhase === 'aiming' ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                    opacity: currentPlayerData.movesRemaining > 0 && gamePhase === 'aiming' ? 1 : 0.5,
                  }}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={moveRight}
                  disabled={currentPlayerData.movesRemaining === 0 || gamePhase !== 'aiming'}
                  style={{
                    padding: '10px 14px',
                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: currentPlayerData.movesRemaining > 0 && gamePhase === 'aiming' ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                    opacity: currentPlayerData.movesRemaining > 0 && gamePhase === 'aiming' ? 1 : 0.5,
                  }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            {/* Weapon Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setWeaponDropdownOpen(!weaponDropdownOpen)}
                disabled={gamePhase !== 'aiming'}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                  border: '2px solid #00f2fe',
                  borderRadius: '6px',
                  color: '#fff',
                  cursor: gamePhase === 'aiming' ? 'pointer' : 'not-allowed',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  opacity: gamePhase === 'aiming' ? 1 : 0.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>{currentPlayerData.selectedWeapon}</span>
                <span>{weaponDropdownOpen ? '▲' : '▼'}</span>
              </button>
              
              {/* Dropdown Menu */}
              {weaponDropdownOpen && gamePhase === 'aiming' && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  right: 0,
                  marginBottom: '4px',
                  background: 'rgba(20, 20, 40, 0.98)',
                  border: '2px solid #00f2fe',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  zIndex: 10,
                  boxShadow: '0 -4px 20px rgba(0, 242, 254, 0.3)',
                }}>
                  {weapons.map(weapon => (
                    <button
                      key={weapon}
                      onClick={() => {
                        if (currentPlayer === 1) {
                          setPlayer1(prev => ({ ...prev, selectedWeapon: weapon }));
                        } else {
                          setPlayer2(prev => ({ ...prev, selectedWeapon: weapon }));
                        }
                        setWeaponDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: currentPlayerData.selectedWeapon === weapon
                          ? 'rgba(0, 242, 254, 0.2)'
                          : 'transparent',
                        border: 'none',
                        borderBottom: weapon !== weapons[weapons.length - 1] ? '1px solid rgba(0, 242, 254, 0.2)' : 'none',
                        color: currentPlayerData.selectedWeapon === weapon ? '#00f2fe' : '#fff',
                        cursor: 'pointer',
                        fontSize: '11px',
                        textAlign: 'left',
                        fontWeight: currentPlayerData.selectedWeapon === weapon ? 'bold' : 'normal',
                      }}
                      onMouseEnter={(e) => {
                        if (currentPlayerData.selectedWeapon !== weapon) {
                          e.target.style.background = 'rgba(0, 242, 254, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPlayerData.selectedWeapon !== weapon) {
                          e.target.style.background = 'transparent';
                        }
                      }}
                    >
                      {weapon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Center - Rotary Angle Dial */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '16px',
            transform: 'translateX(-50%)',
            width: '120px',
          }}>
            {/* Rotary Dial */}
            <div 
              ref={(el) => {
                if (!el) return;
                
                const updateAngle = (clientX, clientY) => {
                  const rect = el.getBoundingClientRect();
                  const centerX = rect.left + rect.width / 2;
                  const centerY = rect.top + rect.height / 2;
                  const angle = Math.atan2(clientY - centerY, clientX - centerX);
                  const degrees = (angle * 180 / Math.PI + 90 + 360) % 360;
                  
                  if (currentPlayer === 1) {
                    setPlayer1(prev => ({ ...prev, angle: degrees }));
                  } else {
                    setPlayer2(prev => ({ ...prev, angle: degrees }));
                  }
                };
                
                const handleMouseDown = (e) => {
                  if (gamePhase !== 'aiming') return;
                  e.preventDefault();
                  
                  updateAngle(e.clientX, e.clientY);
                  
                  const handleMouseMove = (moveEvent) => {
                    updateAngle(moveEvent.clientX, moveEvent.clientY);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                };
                
                const handleTouchStart = (e) => {
                  if (gamePhase !== 'aiming') return;
                  e.preventDefault();
                  
                  const touch = e.touches[0];
                  updateAngle(touch.clientX, touch.clientY);
                  
                  const handleTouchMove = (moveEvent) => {
                    const moveTouch = moveEvent.touches[0];
                    updateAngle(moveTouch.clientX, moveTouch.clientY);
                  };
                  
                  const handleTouchEnd = () => {
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                  };
                  
                  document.addEventListener('touchmove', handleTouchMove, { passive: false });
                  document.addEventListener('touchend', handleTouchEnd);
                };
                
                el.addEventListener('mousedown', handleMouseDown);
                el.addEventListener('touchstart', handleTouchStart, { passive: false });
              }}
              style={{
                width: '100px',
                height: '100px',
                margin: '0 auto',
                position: 'relative',
                background: 'radial-gradient(circle, rgba(30,30,50,0.8), rgba(10,10,20,0.9))',
                borderRadius: '50%',
                border: '3px solid #f093fb',
                boxShadow: '0 0 20px rgba(240, 147, 251, 0.4), inset 0 0 20px rgba(0,0,0,0.5)',
                cursor: gamePhase === 'aiming' ? 'grab' : 'not-allowed',
                userSelect: 'none',
                touchAction: 'none',
              }}
            >
              {/* Degree markings */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => {
                const rad = (deg - 90) * Math.PI / 180;
                const x = 50 + Math.cos(rad) * 38;
                const y = 50 + Math.sin(rad) * 38;
                return (
                  <div
                    key={deg}
                    style={{
                      position: 'absolute',
                      left: `${x}px`,
                      top: `${y}px`,
                      width: '3px',
                      height: '3px',
                      background: '#888',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',
                    }}
                  />
                );
              })}
              
              {/* Center display */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#f093fb',
                fontSize: '18px',
                fontWeight: 'bold',
                textShadow: '0 0 10px #f093fb',
                pointerEvents: 'none',
              }}>
                {Math.round(currentPlayerData.angle)}°
              </div>
              
              {/* Pointer/Indicator */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '42px',
                  height: '3px',
                  background: 'linear-gradient(90deg, #f093fb, #f5576c)',
                  transformOrigin: 'left center',
                  transform: `translate(0, -50%) rotate(${currentPlayerData.angle - 90}deg)`,
                  borderRadius: '2px',
                  boxShadow: '0 0 10px rgba(245, 87, 108, 0.8)',
                  pointerEvents: 'none',
                }}
              >
                <div style={{
                  position: 'absolute',
                  right: '-5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '10px',
                  height: '10px',
                  background: '#f5576c',
                  borderRadius: '50%',
                  border: '2px solid #fff',
                  boxShadow: '0 0 10px rgba(245, 87, 108, 0.8)',
                }} />
              </div>
            </div>
          </div>
          
          {/* Right Side - Vertical Power Slider */}
          <div style={{
            position: 'absolute',
            right: '12px',
            top: '12px',
            width: '50px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            {/* Power Increase Button */}
            <button
              onClick={() => adjustPower(10)}
              disabled={gamePhase !== 'aiming'}
              style={{
                width: '40px',
                height: '32px',
                background: 'linear-gradient(135deg, #fa709a, #fee140)',
                border: 'none',
                borderRadius: '6px 6px 0 0',
                color: '#000',
                cursor: gamePhase === 'aiming' ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: gamePhase === 'aiming' ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +
            </button>
            
            {/* Vertical Power Bar */}
            <div style={{
              width: '40px',
              height: '80px',
              background: '#333',
              overflow: 'hidden',
              border: '2px solid #555',
              borderTop: 'none',
              borderBottom: 'none',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: `${currentPlayerData.power}%`,
                background: 'linear-gradient(0deg, #fa709a, #fee140)',
                transition: 'height 0.3s',
                boxShadow: '0 0 10px rgba(254, 225, 64, 0.5)',
              }} />
              
              {/* Power Value Display */}
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
                textShadow: '0 0 5px #000, 0 0 10px #000',
                pointerEvents: 'none',
              }}>
                {currentPlayerData.power}
              </div>
            </div>
            
            {/* Power Decrease Button */}
            <button
              onClick={() => adjustPower(-10)}
              disabled={gamePhase !== 'aiming'}
              style={{
                width: '40px',
                height: '32px',
                background: 'linear-gradient(135deg, #fa709a, #fee140)',
                border: 'none',
                borderRadius: '0 0 6px 6px',
                color: '#000',
                cursor: gamePhase === 'aiming' ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: 'bold',
                opacity: gamePhase === 'aiming' ? 1 : 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              -
            </button>
          </div>
          
          {/* Bottom Center - Fire Button */}
          <button
            onClick={fire}
            disabled={gamePhase !== 'aiming'}
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '160px',
              padding: '12px',
              background: gamePhase === 'aiming'
                ? 'linear-gradient(135deg, #f093fb, #f5576c)'
                : 'rgba(100,100,100,0.5)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: gamePhase === 'aiming' ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: gamePhase === 'aiming' ? '0 4px 20px rgba(245, 87, 108, 0.5)' : 'none',
            }}
          >
            <Zap size={20} />
            FIRE!
          </button>
        </div>
      )}
      
      {/* Game Over */}
      {!isGameActive && (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          background: 'rgba(0,0,0,0.8)',
        }}>
          <h2 style={{
            color: player1.health > 0 ? '#00d4ff' : '#ff4444',
            fontSize: '32px',
            marginBottom: '16px',
            textShadow: `0 0 20px ${player1.health > 0 ? '#00d4ff' : '#ff4444'}`,
          }}>
            {player1.health > 0 ? 'Player 1 Wins!' : 'Player 2 Wins!'}
          </h2>
          <button
            onClick={() => {
              setPlayer1({ x: 150, health: 100, angle: 45, power: 50, selectedWeapon: 'Standard', movesRemaining: 4 });
              setPlayer2({ x: 650, health: 100, angle: 135, power: 50, selectedWeapon: 'Standard', movesRemaining: 4 });
              setCurrentPlayer(1);
              setGamePhase('aiming');
              setProjectile(null);
              setExplosion(null);
            }}
            style={{
              padding: '12px 32px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default TanksGame;
