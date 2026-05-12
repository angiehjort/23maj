(function () {
  const ribbon = document.querySelector('.dresscode-ribbon');
  const track  = document.querySelector('.dresscode-track');
  if (!ribbon || !track) return;

  const DURATION = 160; // must match CSS animation duration (seconds)

  function halfWidth() { return track.offsetWidth / 2; }

  function currentX() {
    const m = new DOMMatrix(window.getComputedStyle(track).transform);
    return m.m41;
  }

  function pause() {
    const x = currentX();
    track.style.animation = 'none';
    track.style.transform = `translateX(${x}px)`;
  }

  function resumeFrom(x) {
    const hw = halfWidth();
    const clamped = Math.max(-hw, Math.min(0, x));
    const progress = hw > 0 ? clamped / -hw : 0;
    track.style.transform = '';
    track.style.animation = 'none';
    void track.offsetWidth; // force reflow
    track.style.animation = `ribbon-scroll ${DURATION}s ${-(progress * DURATION)}s linear infinite`;
  }

  // Hover
  let hovering = false;
  ribbon.addEventListener('mouseenter', () => { hovering = true;  pause(); });
  ribbon.addEventListener('mouseleave', () => { hovering = false; resumeFrom(currentX()); });

  // Drag
  let dragging = false, dragStartX = 0, dragOffset = 0;

  ribbon.addEventListener('mousedown', (e) => {
    dragging = true;
    dragStartX = e.clientX;
    dragOffset = currentX();
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const hw = halfWidth();
    const newX = Math.max(-hw, Math.min(0, dragOffset + (e.clientX - dragStartX)));
    track.style.transform = `translateX(${newX}px)`;
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    if (!hovering) resumeFrom(currentX());
  });

  // Wheel
  let wheelTimer;
  ribbon.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (track.style.animation !== 'none') pause();
    const hw = halfWidth();
    const newX = Math.max(-hw, Math.min(0, currentX() - e.deltaY));
    track.style.transform = `translateX(${newX}px)`;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { if (!hovering) resumeFrom(currentX()); }, 1500);
  }, { passive: false });

  // Touch
  let touchStartX = 0, touchOffset = 0;
  ribbon.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchOffset = currentX();
    if (track.style.animation !== 'none') pause();
  }, { passive: true });
  ribbon.addEventListener('touchmove', (e) => {
    const hw = halfWidth();
    const newX = Math.max(-hw, Math.min(0, touchOffset + (e.touches[0].clientX - touchStartX)));
    track.style.transform = `translateX(${newX}px)`;
  }, { passive: true });
  ribbon.addEventListener('touchend', () => { resumeFrom(currentX()); }, { passive: true });
})();
