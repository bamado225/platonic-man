/* FRIENDZONE RUN — vanilla-canvas side-scrolling runner (used on /games/).
   The hero stays put on the left, obstacles (the "friends") spawn on the right
   and close in. Jump to dodge them; speed ramps up over time. No libraries, no
   persistence — the high score only lives for this page session. */
(function initFriendzoneRun() {
    const game = {
        heroImg: "/assets/img/runner-hero.png",
        obstacleImgs: [
            "/assets/img/runner-girl-1.png",
            "/assets/img/runner-girl-2.png",
            "/assets/img/runner-girl-3.png",
            "/assets/img/runner-girl-4.png",
            "/assets/img/runner-girl-5.png",
            "/assets/img/runner-girl-6.png",
            "/assets/img/runner-girl-7.png"
        ],
        gameOverPhrases: [
            "YOU GOT FRIENDZONED!",
            "\"You're like a brother to me\"",
            "\"I love you... like a friend\"",
            "\"I don't want to ruin our friendship\""
        ]
    };

        const canvas = document.getElementById('runner-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
    
        const GROUND_MARGIN = 30;
        const GRAVITY = 1300;        // px/s^2
        const JUMP_VELOCITY = -650;  // px/s
        const BASE_SPEED = 180;      // px/s (slower start — easier)
        const SPEED_RAMP = 3;        // px/s gained per second survived (gentler ramp)
        const PLAYER_SIZE = 44;
        const OBSTACLE_SIZE = 40;
        const PLAYER_X = 50;
    
        // Hero sprite: try to load the configured image; fall back to emoji
        // if the config is null or if the file fails to load.
        let heroImgReady = false;
        const heroImg = new Image();
        if (game.heroImg) {
            heroImg.onload = () => { heroImgReady = true; };
            heroImg.onerror = () => { heroImgReady = false; };
            heroImg.src = game.heroImg;
        }
    
        // Obstacle sprite pool: one entry per configured image. Each entry
        // tracks its own load state, so if one image fails to load only
        // obstacles that randomly picked it fall back to the emoji — the
        // other loaded images keep working normally.
        const obstacleSprites = (game.obstacleImgs || []).map(src => {
            const sprite = { img: new Image(), ready: false };
            sprite.img.onload = () => { sprite.ready = true; };
            sprite.img.onerror = () => { sprite.ready = false; };
            sprite.img.src = src;
            return sprite;
        });
    
        const HERO_EMOJI = '🏃';
        const OBSTACLE_EMOJI = '💁‍♀️';
    
        const scoreEl = document.getElementById('game-score');
        const highScoreEl = document.getElementById('game-highscore');
        const playButton = document.getElementById('game-play-button');
        const retryButton = document.getElementById('game-retry-button');
        const gameOverScreen = document.getElementById('game-over-screen');
        const gameOverPhraseEl = document.getElementById('game-over-phrase');
        const gameOverScoreEl = document.getElementById('game-over-score');
    
        let highScore = 0;
        let player, obstacles, score, speed, elapsed, spawnTimer, running, lastTimestamp, rafId;
    
        function resizeCanvas() {
            const displayWidth = canvas.clientWidth;
            if (displayWidth > 0 && canvas.width !== displayWidth) {
                canvas.width = displayWidth;
            }
        }
        window.addEventListener('resize', resizeCanvas);
    
        function groundY() {
            return canvas.height - GROUND_MARGIN;
        }
    
        function resetState() {
            resizeCanvas();
            player = { y: groundY() - PLAYER_SIZE, vy: 0, grounded: true };
            obstacles = [];
            score = 0;
            speed = BASE_SPEED;
            elapsed = 0;
            spawnTimer = 1;
            running = true;
            lastTimestamp = null;
            updateScoreDisplay();
        }
    
        function updateScoreDisplay() {
            if (scoreEl) scoreEl.textContent = `SCORE: ${score}`;
            if (highScoreEl) highScoreEl.textContent = `BEST: ${highScore}`;
        }
    
        function jump() {
            if (!running) return;
            if (player.grounded) {
                player.vy = JUMP_VELOCITY;
                player.grounded = false;
            }
        }
    
        function spawnObstacle() {
            const sprite = obstacleSprites.length
                ? obstacleSprites[Math.floor(Math.random() * obstacleSprites.length)]
                : null;
            obstacles.push({
                x: canvas.width,
                y: groundY() - OBSTACLE_SIZE,
                scored: false,
                sprite
            });
        }
    
        function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
            return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
        }
    
        function drawSprite(img, ready, emoji, x, y, size) {
            if (ready) {
                // Real sprites keep their natural aspect ratio instead of
                // being squashed into the (square) hitbox — drawn at a
                // fixed height, bottom-anchored and centered over the box.
                const drawHeight = 110;
                const ratio = (img.naturalWidth && img.naturalHeight) ? img.naturalWidth / img.naturalHeight : 1;
                const drawWidth = drawHeight * ratio;
                const drawX = x + size / 2 - drawWidth / 2;
                const drawY = y + size - drawHeight;
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            } else {
                ctx.font = `${size}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(emoji, x + size / 2, y + size / 2 + 2);
            }
        }
    
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
    
            // Ground line
            ctx.strokeStyle = '#1b1b1b';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, groundY() + PLAYER_SIZE);
            ctx.lineTo(canvas.width, groundY() + PLAYER_SIZE);
            ctx.stroke();
    
            drawSprite(heroImg, heroImgReady, HERO_EMOJI, PLAYER_X, player.y, PLAYER_SIZE);
            obstacles.forEach(o => {
                const ready = !!(o.sprite && o.sprite.ready);
                const img = o.sprite ? o.sprite.img : null;
                drawSprite(img, ready, OBSTACLE_EMOJI, o.x, o.y, OBSTACLE_SIZE);
            });
        }
    
        function endGame() {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
            highScore = Math.max(highScore, score);
            updateScoreDisplay();
            const phrases = game.gameOverPhrases;
            if (gameOverPhraseEl) {
                gameOverPhraseEl.textContent = phrases[Math.floor(Math.random() * phrases.length)];
            }
            if (gameOverScoreEl) gameOverScoreEl.textContent = `Score: ${score}`;
            if (gameOverScreen) gameOverScreen.classList.remove('hidden');
            if (window.PM && PM.track) PM.track('game_over', { score: score });
        }
    
        function loop(timestamp) {
            if (!running) return;
            if (lastTimestamp === null) lastTimestamp = timestamp;
            const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
            lastTimestamp = timestamp;
            elapsed += dt;
            speed = BASE_SPEED + elapsed * SPEED_RAMP;
    
            // Player physics
            player.vy += GRAVITY * dt;
            player.y += player.vy * dt;
            if (player.y >= groundY() - PLAYER_SIZE) {
                player.y = groundY() - PLAYER_SIZE;
                player.vy = 0;
                player.grounded = true;
            }
    
            // Spawn + move obstacles — only one is ever on screen at a time.
            // While one is active it just moves; a fresh random gap starts
            // counting down only once it has fully left the canvas.
            if (obstacles.length === 0) {
                spawnTimer -= dt;
                if (spawnTimer <= 0) {
                    spawnObstacle();
                }
            } else {
                obstacles.forEach(o => { o.x -= speed * dt; });
                const stillVisible = obstacles.filter(o => o.x + OBSTACLE_SIZE > 0);
                if (stillVisible.length === 0) {
                    const minInterval = 0.9;
                    const maxInterval = Math.max(minInterval, 1.8 - elapsed * 0.015);
                    spawnTimer = minInterval + Math.random() * (maxInterval - minInterval);
                }
                obstacles = stillVisible;
            }
    
            // Scoring + collision
            for (const o of obstacles) {
                if (!o.scored && o.x + OBSTACLE_SIZE < PLAYER_X) {
                    o.scored = true;
                    score += 1;
                    updateScoreDisplay();
                }
                if (rectsOverlap(PLAYER_X, player.y, PLAYER_SIZE, PLAYER_SIZE, o.x, o.y, OBSTACLE_SIZE, OBSTACLE_SIZE)) {
                    draw();
                    endGame();
                    return;
                }
            }
    
            draw();
            rafId = requestAnimationFrame(loop);
        }
    
        function startGame() {
            if (gameOverScreen) gameOverScreen.classList.add('hidden');
            resetState();
            if (window.PM && PM.track) PM.track('game_start');
            draw();
            rafId = requestAnimationFrame(loop);
        }
    
        if (playButton) playButton.addEventListener('click', startGame);
        if (retryButton) retryButton.addEventListener('click', startGame);
    
        document.addEventListener('keydown', (e) => {
            // Only hijack Space/Up while a run is active, so the page still scrolls normally.
            if (running && (e.code === 'Space' || e.code === 'ArrowUp')) {
                e.preventDefault();
                jump();
            }
        });
        canvas.addEventListener('mousedown', jump);
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            jump();
        }, { passive: false });
    
        // Draw an idle frame so the canvas isn't blank before the first play.
        resizeCanvas();
        player = { y: groundY() - PLAYER_SIZE, vy: 0, grounded: true };
        obstacles = [];
        draw();
})();
