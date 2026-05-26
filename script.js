// ======= Intro entrance animation =======
document.addEventListener("DOMContentLoaded", () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.getElementById("intro")?.classList.add("intro-ready");
    });
  });
});

// ======= Scroll Fade-In Effect =======
function animateSections() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".fade-in").forEach(section => observer.observe(section));
}
window.addEventListener("load", animateSections);
