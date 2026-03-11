"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Drop this anywhere on the page — it renders nothing but wires up all
 * GSAP + ScrollTrigger entrance animations for the home page.
 */
export default function GsapAnimations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // ── Hero entrance: staggered fade-up ──────────────────────────────────
    const heroEls = gsap.utils.toArray<Element>(".animate-fade-up");
    gsap.set(heroEls, { opacity: 0, y: 28 });
    gsap.to(heroEls, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.13,
    });

    // ── Scroll-reveal: individual headings / paragraphs ───────────────────
    gsap.utils.toArray<Element>(".gsap-reveal").forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
          },
        }
      );
    });

    // ── Scroll-reveal: staggered card grids ───────────────────────────────
    gsap.utils.toArray<Element>(".gsap-stagger-parent").forEach((parent) => {
      const children = Array.from(
        parent.querySelectorAll<Element>(".gsap-stagger-child")
      );
      gsap.fromTo(
        children,
        { opacity: 0, y: 44 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: parent,
            start: "top 82%",
          },
        }
      );
    });

    // ── CTA banner: scale-in ──────────────────────────────────────────────
    const ctaBanner = document.querySelector<Element>(".gsap-cta-banner");
    if (ctaBanner) {
      gsap.fromTo(
        ctaBanner,
        { opacity: 0, scale: 0.94, y: 24 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ctaBanner,
            start: "top 88%",
          },
        }
      );
    }

    // ── Footer: fade in ───────────────────────────────────────────────────
    const footer = document.querySelector<Element>(".gsap-footer");
    if (footer) {
      gsap.fromTo(
        footer,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 95%",
          },
        }
      );
    }

    // ── Card hover: lift + glow via GSAP quickTo ─────────────────────────
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(".gsap-card-hover")
    );

    type CardListeners = { card: HTMLElement; enter: () => void; leave: () => void };
    const cardListeners: CardListeners[] = cards.map((card) => {
      const quickY = gsap.quickTo(card, "y", { duration: 0.35, ease: "power2.out" });

      const enter = () => {
        quickY(-4);
        gsap.to(card, {
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          borderColor: "rgba(255,255,255,0.14)",
          duration: 0.35,
          ease: "power2.out",
        });
      };
      const leave = () => {
        quickY(0);
        gsap.to(card, {
          boxShadow: "0 0px 0px rgba(0,0,0,0)",
          borderColor: "rgba(255,255,255,0.08)",
          duration: 0.35,
          ease: "power2.out",
        });
      };
      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);
      return { card, enter, leave };
    });

    // ── CTA buttons: replay section animations on every click ─────────────
    // Delay (ms) to allow CSS smooth-scroll to finish before re-animating
    const SCROLL_ANIMATION_DELAY = 500;

    const heroCtas = document.querySelector<HTMLElement>(".hero-ctas");
    const editorCta = heroCtas?.querySelector<HTMLElement>('a[href="#editor"]') ?? null;
    const packsCta = heroCtas?.querySelector<HTMLElement>('a[href="#packs"]') ?? null;

    const animateBtnPress = (btn: HTMLElement) => {
      gsap.fromTo(btn, { scale: 0.95 }, { scale: 1, duration: 0.35, ease: "back.out(2)" });
    };

    // After smooth-scroll completes, re-run the editor panel entrance animation
    const handleEditorCtaClick = () => {
      if (editorCta) animateBtnPress(editorCta);
      setTimeout(() => {
        const panel = document.querySelector<HTMLElement>(".gsap-editor-panel");
        if (panel) {
          gsap.fromTo(panel, { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" });
        }
      }, SCROLL_ANIMATION_DELAY);
    };

    // After smooth-scroll completes, re-run the packs section entrance animations
    const handlePacksCtaClick = () => {
      if (packsCta) animateBtnPress(packsCta);
      setTimeout(() => {
        const reveal = document.querySelector<Element>("#packs .gsap-reveal");
        const staggerChildren = Array.from(
          document.querySelectorAll<Element>("#packs .gsap-stagger-child")
        );
        if (reveal) {
          gsap.fromTo(reveal, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" });
        }
        if (staggerChildren.length) {
          gsap.fromTo(staggerChildren, { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.75, ease: "power3.out", stagger: 0.06, delay: 0.1 });
        }
      }, SCROLL_ANIMATION_DELAY);
    };

    editorCta?.addEventListener("click", handleEditorCtaClick);
    packsCta?.addEventListener("click", handlePacksCtaClick);

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      cardListeners.forEach(({ card, enter, leave }) => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
      });
      editorCta?.removeEventListener("click", handleEditorCtaClick);
      packsCta?.removeEventListener("click", handlePacksCtaClick);
    };
  }, []);

  return null;
}
