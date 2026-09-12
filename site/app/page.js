"use client";

import { useEffect, useRef } from "react";

const CTA_URL = "https://oryxdesertsalt.co.za";
const CTA_LABEL = "Shop refills";

export default function Page() {
  const pageRef = useRef(null);
  const heroCopyRef = useRef(null);
  const progressBarRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- hero video ----------
    const video = videoRef.current;
    let vidIo;
    let onTouch;
    let onClick;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      const tryPlay = () => {
        const p = video.play();
        if (p && p.catch) p.catch(() => {});
      };
      const onPlaying = () => video.classList.add("is-playing");
      video.addEventListener("playing", onPlaying);
      tryPlay();
      onTouch = () => tryPlay();
      onClick = () => tryPlay();
      document.addEventListener("touchstart", onTouch, { once: true, passive: true });
      document.addEventListener("click", onClick, { once: true });

      vidIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) tryPlay();
            else video.pause();
          });
        },
        { threshold: 0.05 }
      );
      vidIo.observe(video);
    }

    // ---------- counters ----------
    function countUp(el) {
      if (el.dataset.counted) return;
      el.dataset.counted = "1";
      const to = parseFloat(el.getAttribute("data-count-to"));
      const suffix = el.getAttribute("data-count-suffix") || "";
      const group = el.getAttribute("data-count-group");
      const fmt = (v) => {
        const n =
          group === "space"
            ? Math.round(v).toLocaleString("en-US").replace(/,/g, " ")
            : String(Math.round(v));
        return n + suffix;
      };
      if (reducedMotion) {
        el.textContent = fmt(to);
        return;
      }
      const dur = 1400;
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(to * e);
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = fmt(0);
      requestAnimationFrame(step);
    }

    // ---------- scroll reveals ----------
    const items = Array.from(root.querySelectorAll("[data-reveal]"));

    function targetOf(el) {
      return el.getAttribute("data-reveal") === "line" ? el.parentElement : el;
    }

    function show(el) {
      if (el.classList.contains("is-visible")) return;
      const delay = parseInt(el.getAttribute("data-delay") || "0", 10);
      el.style.transitionDelay = delay + "ms";
      el.classList.add("is-visible");
      if (el.hasAttribute("data-count-to")) countUp(el);
      el.querySelectorAll("[data-count-to]").forEach(countUp);
    }

    let io;
    if (reducedMotion) {
      items.forEach((el) => {
        el.classList.add("is-visible");
        if (el.hasAttribute("data-count-to")) countUp(el);
        el.querySelectorAll("[data-count-to]").forEach(countUp);
      });
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              show(entry.target.__revealEl || entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
      );

      const observed = new Set();
      items.forEach((el) => {
        const t = targetOf(el);
        t.__revealEl =
          el.getAttribute("data-reveal") === "line"
            ? t.querySelector('[data-reveal="line"]') || el
            : el;
        if (!observed.has(t)) {
          observed.add(t);
          io.observe(t);
        }
      });

      requestAnimationFrame(() => {
        items.forEach((el) => {
          const t = targetOf(el);
          const r = t.getBoundingClientRect();
          if (r.top < window.innerHeight * 0.9) {
            show(el);
            io.unobserve(t);
          }
        });
      });
    }

    // ---------- parallax + hero fade + progress bar ----------
    const parallaxEls = Array.from(root.querySelectorAll("[data-parallax]"));
    const heroCopy = heroCopyRef.current;
    const progressBar = progressBarRef.current;
    let ticking = false;

    function frame() {
      ticking = false;
      const vh = window.innerHeight;

      if (!reducedMotion) {
        parallaxEls.forEach((img) => {
          const parent = img.parentElement;
          const r = parent.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const p = (vh - r.top) / (vh + r.height) - 0.5;
          const strength = parseFloat(img.getAttribute("data-parallax")) || 60;
          img.style.transform = `translate3d(0,${(-p * strength).toFixed(2)}px,0) scale(1.16)`;
        });
      }

      if (heroCopy && !reducedMotion) {
        const y = window.scrollY || window.pageYOffset;
        const t = Math.min(1, Math.max(0, (y - vh * 0.18) / (vh * 0.72)));
        heroCopy.style.opacity = String(1 - t * 0.9);
        heroCopy.style.transform = `translate3d(0,${(t * 26).toFixed(1)}px,0)`;
      }

      if (progressBar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressBar.style.width =
          (max > 0 ? Math.min(100, ((window.scrollY || 0) / max) * 100) : 0) + "%";
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(frame);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    frame();

    return () => {
      if (vidIo) vidIo.disconnect();
      if (io) io.disconnect();
      if (onTouch) document.removeEventListener("touchstart", onTouch);
      if (onClick) document.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="page" ref={pageRef}>
      <div className="progress-track">
        <div className="progress-bar" ref={progressBarRef}></div>
      </div>

      <section className="hero">
        <div className="hero-media">
          <img src="/assets/oryx-hero.png" alt="" />
          <video
            ref={videoRef}
            poster="/assets/oryx-hero.png"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          >
            <source src="/assets/oryx-hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="hero-scrim-1"></div>
        <div className="hero-scrim-2"></div>
        <div className="hero-scrim-3"></div>

        <div className="hero-ripples">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="hero-header">
          <img src="/assets/logo-white.png" alt="Oryx Desert Salt" />
          <div className="tapped-badge">
            <span className="tapped-dot"></span>
            Tapped
          </div>
        </div>

        <div className="hero-copy" ref={heroCopyRef}>
          <div className="hero-eyebrow-wrap">
            <div className="hero-eyebrow">From the Kalahari</div>
          </div>
          <h1>
            <span className="line-mask">
              <span>Salt Within</span>
            </span>
            <span className="line-mask">
              <span>Reach</span>
            </span>
          </h1>
          <div className="hero-sub-wrap">
            <p className="hero-sub">More than meets the grind.</p>
          </div>
          <p className="hero-desc">
            You just tapped a grinder that has travelled 15 000 km from a salt pan in the
            middle of nowhere. Here is the rest of the story.
          </p>
          <div className="scroll-cue">
            <span className="rule"></span>Scroll
          </div>
        </div>
      </section>

      <section className="section story-section">
        <div className="eyebrow" data-reveal="up">
          The story
        </div>
        <h2 className="story-title" data-reveal="mask">
          One woman, 34 tons of salt, and a dining room table.
        </h2>
        <p className="body-copy" data-reveal="up">
          Fifteen years ago Samantha Skyring sold her house and bought 34 tons of salt. A
          single mother, packing bags at her dining room table while caring for her young
          son. No factory, no investors &mdash; just a conviction that the cleanest salt on
          earth was sitting untouched under a desert.
        </p>
        <p className="body-copy" data-reveal="up">
          Today Oryx Desert Salt reaches 23 countries and a team of 35 from communities
          south of Cape Town. Same salt. Same pan. Same belief.
        </p>
      </section>

      <figure className="photo photo--tall">
        <img data-parallax="70" src="/assets/saltpan-1.png" alt="The Kalahari salt pan" />
        <figcaption className="photo-caption" data-reveal="up">
          5 000 hectares &middot; 155 miles from the nearest town
        </figcaption>
      </figure>

      <section className="section">
        <div className="eyebrow" data-reveal="up">
          01 &mdash; The source
        </div>
        <h3 className="story-title source-title" data-reveal="mask">
          Three hundred million years in the making
        </h3>
        <p className="body-copy" data-reveal="up">
          Beneath the pan lies a 55 million ton salt aquifer. Three subterranean streams
          move through Dwyka rock strata laid down 300 million years ago, replenishing the
          brine year after year. We spread it across the pan, the African sun does the rest
          &mdash; four weeks at 120&deg;F, and the crystals are ready.
        </p>
        <div className="stat-grid">
          <div data-reveal="up">
            <div className="stat-num" data-count-to="55" data-count-suffix="M">
              55M
            </div>
            <div className="stat-label">tons of underground salt</div>
          </div>
          <div data-reveal="up">
            <div className="stat-num" data-count-to="80" data-count-suffix="+">
              80+
            </div>
            <div className="stat-label">minerals &amp; trace elements</div>
          </div>
          <div data-reveal="up">
            <div className="stat-num">0</div>
            <div className="stat-label">additives, chemicals, microplastics</div>
          </div>
        </div>
      </section>

      <div className="ticker">
        <div className="ticker-track">
          <span>Mineral, Not Minimal</span>
          <span className="dot">&#9670;</span>
          <span>Don&rsquo;t Panic, It&rsquo;s Ceramic</span>
          <span className="dot">&#9670;</span>
          <span>Refill Not Landfill</span>
          <span className="dot">&#9670;</span>
          <span>More Than Meets The Grind</span>
          <span className="dot">&#9670;</span>
          <span>Mineral, Not Minimal</span>
          <span className="dot">&#9670;</span>
          <span>Don&rsquo;t Panic, It&rsquo;s Ceramic</span>
          <span className="dot">&#9670;</span>
          <span>Refill Not Landfill</span>
          <span className="dot">&#9670;</span>
          <span>More Than Meets The Grind</span>
          <span className="dot">&#9670;</span>
        </div>
      </div>

      <section className="section section--dark">
        <div className="eyebrow" data-reveal="up">
          02 &mdash; What is inside
        </div>
        <h3 className="line-heading inside-heading">
          <span className="line-mask">
            <span data-reveal="line">Mineral,</span>
          </span>
          <span className="line-mask">
            <span data-reveal="line" data-delay="110">
              Not Minimal.
            </span>
          </span>
        </h3>
        <p className="body-copy" data-reveal="up">
          Table salt is stripped of the 80+ elements that make salt worth eating, then
          topped up with anti-caking agents. Ours is sun-dried and left alone. Nothing
          added, nothing taken away &mdash; a natural source of electrolytes and the trace
          minerals your body actually runs on.
        </p>
        <p className="body-copy" data-reveal="up">
          Gentle, full-bodied flavour that lifts a dish instead of flattening it. The
          smallest ingredient in the meal, making the biggest difference.
        </p>
      </section>

      <figure className="photo photo--hands">
        <img data-parallax="60" src="/assets/hands-bw.png" alt="Hands holding Kalahari salt" />
      </figure>

      <section className="section section--dark">
        <div className="eyebrow" data-reveal="up">
          03 &mdash; The grinder
        </div>
        <h3 className="line-heading grinder-heading">
          <span className="line-mask">
            <span data-reveal="line">Don&rsquo;t Panic,</span>
          </span>
          <span className="line-mask">
            <span data-reveal="line" data-delay="110">
              It&rsquo;s Ceramic.
            </span>
          </span>
        </h3>
        <p className="body-copy" data-reveal="up">
          Every other grinder head on the shelf is plastic &mdash; and every turn shaves a
          little of it into your food. Ours is ceramic: harder, sharper, and good for 20
          refills and more. Oryx spearheaded the ceramic mechanism so the grinder in your
          hand is a thing you keep, not a thing you finish.
        </p>
        <div className="nfc-callout" data-reveal="up">
          <img src="/assets/nfc-tag.png" alt="" />
          <p>
            The tag you just touched lives in that same base. Tap it any time &mdash; for
            the story, or to reorder a refill in two taps.
          </p>
        </div>
      </section>

      <figure className="photo photo--med">
        <img
          data-parallax="80"
          src="/assets/hands-grinder-bw.png"
          alt="Ceramic Oryx grinder in hand"
        />
      </figure>

      <section className="section">
        <div className="eyebrow" data-reveal="up">
          04 &mdash; The pan renews itself
        </div>
        <h3 className="renew-title" data-reveal="mask">
          Salt for a flavourable tomorrow.
        </h3>
        <p className="body-copy" data-reveal="up">
          Himalayan salt is blasted out with dynamite and never comes back. Sea salt now
          carries what we have poured into the ocean. Our aquifer is refilled by the same
          three streams that have fed it for millennia &mdash; we take only what the desert
          gives back, in step with the rainfall.
        </p>
        <p className="body-copy" data-reveal="up">
          Renewable at the source, refillable in your kitchen, and a percentage of every
          sale going to the &#801;Khomani San and Mier communities of the Kalahari.
        </p>
      </section>

      <figure className="photo photo--short">
        <img
          data-parallax="70"
          src="/assets/saltpan-3.png"
          alt="Kalahari salt pan at harvest"
        />
        <figcaption className="photo-caption" data-reveal="up">
          Sun-dried &middot; unrefined &middot; renewable
        </figcaption>
      </figure>

      <section className="section section--grey name-section">
        <img data-reveal="pop" src="/assets/oryx-head.png" alt="" />
        <div>
          <div className="eyebrow" data-reveal="up">
            05 &mdash; The name
          </div>
          <h3 className="name-title" data-reveal="mask">
            The animal that cannot live without salt
          </h3>
          <p className="body-copy" data-reveal="up">
            In July 2000 Samantha walked 75 miles across the Namib over seven days and met
            the Oryx gazelle face to face. It can go years without water but not weeks
            without salt, drinking the night dew straight through its hair. Strength and
            perseverance in the harshest place on earth &mdash; that is where the logo on
            your grinder came from.
          </p>
        </div>
      </section>

      <section className="section section--dark ask-section">
        <div className="eyebrow" data-reveal="up">
          The ask
        </div>
        <h2 className="ask-title">
          <span className="line-mask">
            <span data-reveal="line">Refillable,</span>
          </span>
          <span className="line-mask">
            <span data-reveal="line" data-delay="110">
              not replaceable.
            </span>
          </span>
        </h2>
        <p className="body-copy ask-copy" data-reveal="up">
          When the salt runs out, the grinder does not. Keep the glass, keep the ceramic
          mechanism, top it up from a refill box and start again. Twenty times over, and
          then some.
        </p>
        <div className="ask-stats">
          <div className="ask-stat" data-reveal="up">
            <span className="ask-stat-num" data-count-to="800000" data-count-group="space">
              800 000
            </span>
            <span className="ask-stat-label">grinders kept out of landfill in 2023 alone</span>
          </div>
          <div className="ask-stat" data-reveal="up">
            <span className="ask-stat-num" data-count-to="3" data-count-suffix="M+">
              3M+
            </span>
            <span className="ask-stat-label">bottles and grinder heads saved over five years</span>
          </div>
          <div className="ask-stat" data-reveal="up">
            <span className="ask-stat-num" data-count-to="20" data-count-suffix="&times;">
              20&times;
            </span>
            <span className="ask-stat-label">refills per ceramic grinder, minimum</span>
          </div>
        </div>
        <div className="shimmer-line" data-reveal="up">
          Refill Not Landfill.
        </div>
      </section>

      <figure className="refill-figure">
        <img data-reveal="pop" src="/assets/grinder-refill-box.png" alt="Oryx grinder and refill box" />
      </figure>

      <section className="section">
        <div className="eyebrow" data-reveal="up">
          How the refill works
        </div>
        <div className="refill-steps">
          <div className="refill-step" data-reveal="up">
            <span className="refill-step-num">1</span>
            <div>
              <div className="refill-step-title">Tap the grinder</div>
              <div className="refill-step-desc">
                The NFC tag in the base opens this page. No app, no QR code, no typing.
              </div>
            </div>
          </div>
          <div className="refill-step" data-reveal="up" data-delay="90">
            <span className="refill-step-num">2</span>
            <div>
              <div className="refill-step-title">Order your refill</div>
              <div className="refill-step-desc">
                Salt, chilli salt or Madagascan pepper &mdash; delivered, or find your
                nearest stockist.
              </div>
            </div>
          </div>
          <div className="refill-step" data-reveal="up" data-delay="180">
            <span className="refill-step-num">3</span>
            <div>
              <div className="refill-step-title">Keep grinding</div>
              <div className="refill-step-desc">
                Top up, twist the ceramic head back on, and the same grinder carries on for
                years.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="final-section section--dark">
        <img className="photo-bg" data-parallax="50" src="/assets/saltpan-final.png" alt="" />
        <div className="final-scrim"></div>
        <div className="final-content">
          <h2 className="final-title">
            <span className="line-mask">
              <span data-reveal="line">Keep the grinder.</span>
            </span>
            <span className="line-mask">
              <span data-reveal="line" data-delay="110">
                Refill the salt.
              </span>
            </span>
          </h2>
          <p className="final-copy" data-reveal="up">
            Order refills, meet the people behind the pan, and see the full range.
          </p>
          <a
            className="cta-link"
            data-reveal="up"
            href={CTA_URL}
            target="_blank"
            rel="noopener"
          >
            <span>{CTA_LABEL}</span>
            <span className="cta-arrow">&rarr;</span>
          </a>
          <div className="final-footer">
            <img src="/assets/logo-white.png" alt="Oryx Desert Salt" />
            <div className="final-footer-label">Oryx Desert Salt &middot; From the Kalahari</div>
          </div>
        </div>
      </section>
    </div>
  );
}
