/* ---------------------------------------------------------------------- */
/*  THIS IS THE SIDE NAVIGATION USED ON SWARM & QUEEN MANAGEMENT PAGES    */
/* ---------------------------------------------------------------------- */
   
   const sectionNavToggle = document.getElementById("sectionNavToggle");
    const sectionNavMobile = document.getElementById("sectionNavMobile");

    if (sectionNavToggle && sectionNavMobile) {
      sectionNavToggle.addEventListener("click", function () {
        const isOpen = sectionNavMobile.classList.toggle("open");
        sectionNavToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        sectionNavToggle.textContent = isOpen ? "Swarm & Queen Menu ▲" : "Swarm & Queen Menu ▼";
      });
    }
  