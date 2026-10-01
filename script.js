/* =========================================================
   JAVASCRIPT PRINCIPAL
   Proyecto: Página de documentación - Videojuego Zombie VR
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* =======================================================
     1. MENÚ HAMBURGUESA EN MÓVIL
     ======================================================= */

  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const navLinks = document.querySelectorAll(".nav-link");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");

      menuToggle.classList.toggle("is-open", isOpen);

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );
    });
  }

  /*
    Cuando el usuario toca una opción del menú en celular,
    cerramos automáticamente el menú.
  */
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("is-open");
      menuToggle?.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
    });
  });


  /* =======================================================
     2. ANIMACIONES AL HACER SCROLL
     ======================================================= */

  const revealElements = document.querySelectorAll(".reveal");

  /*
    Detectamos si el usuario pidió reducir animaciones
    desde el sistema operativo o navegador.
  */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    /*
      Si el usuario no quiere animaciones,
      mostramos directamente todos los elementos.
    */
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  } else if ("IntersectionObserver" in window) {

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {

            entry.target.classList.add("is-visible");

            /*
              Una vez visible, dejamos de observarlo
              para que la animación ocurra una sola vez.
            */
            observer.unobserve(entry.target);
          }

        });

      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });

  } else {

    /*
      Fallback para navegadores antiguos que no soporten
      IntersectionObserver.
    */
    revealElements.forEach((element) => {
      element.classList.add("is-visible");
    });

  }


  /* =======================================================
     3. LIGHTBOX PARA IMÁGENES DE LA LÍNEA DE TIEMPO
     ======================================================= */

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");

  const lightboxTriggers = document.querySelectorAll(
    ".lightbox-trigger"
  );

  /*
    Guardamos el elemento que abrió el lightbox.
    Esto mejora la accesibilidad porque al cerrar
    podemos devolverle el foco.
  */
  let lastFocusedElement = null;


  function openLightbox(imageElement) {

    if (
      !lightbox ||
      !lightboxImage ||
      !lightboxCaption
    ) {
      return;
    }

    lastFocusedElement = imageElement;

    lightboxImage.src = imageElement.src;
    lightboxImage.alt = imageElement.alt;

    lightboxCaption.textContent =
      imageElement.alt || "Imagen ampliada";

    lightbox.classList.add("is-open");

    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow = "hidden";

    /*
      Movemos el foco al botón de cerrar
      para que también sea cómodo usando teclado.
    */
    lightboxClose?.focus();
  }


  function closeLightbox() {

    if (!lightbox) {
      return;
    }

    lightbox.classList.remove("is-open");

    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow = "";

    /*
      Limpiamos la imagen después de cerrar.
    */
    if (lightboxImage) {
      lightboxImage.src = "";
      lightboxImage.alt = "";
    }

    if (lightboxCaption) {
      lightboxCaption.textContent = "";
    }

    /*
      Regresamos el foco a la imagen
      desde la que se abrió el lightbox.
    */
    lastFocusedElement?.focus();
  }


  lightboxTriggers.forEach((image) => {

    /*
      Abrir haciendo clic.
    */
    image.addEventListener("click", () => {
      openLightbox(image);
    });


    /*
      Abrir también con Enter o barra espaciadora.
      Esto mejora la accesibilidad.
    */
    image.addEventListener("keydown", (event) => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        openLightbox(image);
      }

    });

  });


  /*
    Cerrar con el botón X.
  */
  lightboxClose?.addEventListener("click", () => {
    closeLightbox();
  });


  /*
    Cerrar haciendo clic fuera de la imagen.
  */
  lightbox?.addEventListener("click", (event) => {

    if (event.target === lightbox) {
      closeLightbox();
    }

  });


  /*
    Cerrar usando Escape.
  */
  document.addEventListener("keydown", (event) => {

    if (
      event.key === "Escape" &&
      lightbox?.classList.contains("is-open")
    ) {

      closeLightbox();
    }

  });


  /* =======================================================
     4. RESALTAR EN EL MENÚ LA SECCIÓN ACTIVA
     ======================================================= */

  const sections = document.querySelectorAll(
    "main section[id]"
  );

  if ("IntersectionObserver" in window) {

    const sectionObserver = new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (!entry.isIntersecting) {
            return;
          }

          const currentSectionId = entry.target.id;

          navLinks.forEach((link) => {

            const linkTarget =
              link.getAttribute("href");

            link.classList.toggle(
              "active",
              linkTarget === `#${currentSectionId}`
            );

          });

        });

      },
      {
        /*
          Consideramos activa principalmente
          la sección que ocupa la zona central
          de la pantalla.
        */
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
      }
    );

    sections.forEach((section) => {
      sectionObserver.observe(section);
    });

  }


  /* =======================================================
     5. MANEJO DE IMÁGENES FALTANTES
     ======================================================= */

  const allImages = document.querySelectorAll("img");

  allImages.forEach((image) => {

    /*
      Si una imagen no existe o está dañada,
      la ocultamos y dejamos visible el fondo oscuro
      definido en CSS.

      Así la página no se ve rota mientras
      todavía estás agregando las imágenes reales.
    */
    image.addEventListener("error", () => {

      image.classList.add("image-error");

      /*
        Si es una imagen de la línea de tiempo,
        eliminamos la interacción del lightbox.
      */
      if (image.classList.contains("lightbox-trigger")) {

        image.removeAttribute("tabindex");

        image.style.cursor = "default";
      }

    });

  });


  /* =======================================================
     6. CERRAR MENÚ MÓVIL AL CAMBIAR A PANTALLA GRANDE
     ======================================================= */

  window.addEventListener("resize", () => {

    if (window.innerWidth > 820) {

      navMenu?.classList.remove("is-open");

      menuToggle?.classList.remove("is-open");

      menuToggle?.setAttribute(
        "aria-expanded",
        "false"
      );

    }

  });

});