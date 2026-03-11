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

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      cardListeners.forEach(({ card, enter, leave }) => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
      });
    };
  }, []);

  return null;
}
