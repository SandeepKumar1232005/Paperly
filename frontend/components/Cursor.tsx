import { useEffect, useRef } from 'react'
import gsap from 'gsap'

const Cursor = () => {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const ringText = useRef<HTMLSpanElement>(null)
  const currentState = useRef('default')

  useEffect(() => {
    // Skip on touch devices
    if (window.matchMedia('(hover: none)').matches)
      return

    // ─── MOUSE MOVE ───────────────────
    const onMove = (e: MouseEvent) => {
      // Dot: instant
      gsap.set(dot.current, {
        x: e.clientX - 4,
        y: e.clientY - 4,
      })
      // Ring: smooth lag
      gsap.to(ring.current, {
        x: e.clientX - 20,
        y: e.clientY - 20,
        duration: 0.12,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    // ─── RESET TO DEFAULT ─────────────
    const resetCursor = () => {
      currentState.current = 'default'
      
      gsap.to(dot.current, {
        scale: 1,
        width: 8, height: 8,
        borderRadius: '50%',
        backgroundColor: 'white',
        duration: 0.35,
        ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto'
      })
      gsap.to(ring.current, {
        scale: 1,
        width: 40, height: 40,
        borderColor: 'rgba(255,255,255,0.3)',
        backgroundColor: 'transparent',
        rotation: 0,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto'
      })
      // Hide ring text
      if (ringText.current) {
        gsap.to(ringText.current, {
          opacity: 0, duration: 0.2
        })
      }
    }

    // ─── STATE 2: BUTTON HOVER ────────
    const onEnterBtn = () => {
      currentState.current = 'button'
      gsap.to(dot.current, {
        scale: 0,
        duration: 0.2,
        overwrite: 'auto'
      })
      gsap.to(ring.current, {
        scale: 1.8,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168,85,247,0.08)',
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      })
    }

    // ─── STATE 3: CARD HOVER ──────────
    const onEnterCard = () => {
      currentState.current = 'card'
      gsap.to(dot.current, {
        scale: 1.5,
        backgroundColor: '#a855f7',
        duration: 0.3,
        overwrite: 'auto'
      })
      gsap.to(ring.current, {
        scale: 1.4,
        borderColor: 'rgba(255,255,255,0.5)',
        rotation: 360,
        duration: 2,
        ease: 'none',
        repeat: -1,
        overwrite: 'auto'
      })
    }

    // ─── STATE 4: GALLERY HOVER ───────
    const onEnterGallery = () => {
      currentState.current = 'gallery'
      gsap.to(dot.current, {
        scale: 0,
        duration: 0.2,
        overwrite: 'auto'
      })
      gsap.to(ring.current, {
        scale: 2.2,
        borderColor: 'rgba(255,255,255,0.6)',
        backgroundColor: 'rgba(0,0,0,0.3)',
        duration: 0.4,
        ease: 'power2.out',
        overwrite: 'auto'
      })
      if (ringText.current) {
        ringText.current.textContent = 'VIEW'
        gsap.to(ringText.current, {
          opacity: 1, duration: 0.3
        })
      }
    }

    // ─── STATE 5: TEXT HOVER ──────────
    const onEnterText = () => {
      currentState.current = 'text'
      gsap.to(dot.current, {
        width: 2,
        height: 18,
        borderRadius: 2,
        duration: 0.2,
        overwrite: 'auto'
      })
      gsap.to(ring.current, {
        scale: 0,
        duration: 0.2,
        overwrite: 'auto'
      })
    }

    // ─── STATE 6: CLICK ───────────────
    const onMouseDown = () => {
      gsap.to([dot.current, ring.current], {
        scale: 0.6,
        duration: 0.1,
        overwrite: 'auto'
      })
    }
    const onMouseUp = () => {
      gsap.to([dot.current, ring.current], {
        scale: currentState.current === 
          'button' ? 0 : 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto'
      })
    }

    // ─── ATTACH EVENTS ────────────────
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)

    const attachEvents = () => {
      // Buttons and links
      document.querySelectorAll(
        'button, a, [role="button"], ' +
        '.magnetic-btn, .glow-btn'
      ).forEach(el => {
        el.addEventListener('mouseenter', onEnterBtn)
        el.addEventListener('mouseleave', resetCursor)
      })

      // Cards
      document.querySelectorAll(
        '.glass-card, .feature-card, ' + 
        '.tilt-card, [class*="card"]'
      ).forEach(el => {
        el.addEventListener('mouseenter', onEnterCard)
        el.addEventListener('mouseleave', resetCursor)
      })

      // Gallery / images
      document.querySelectorAll(
        '.gallery-drag, .writer-card, ' +
        '.handwriting-sample, img'
      ).forEach(el => {
        el.addEventListener(
          'mouseenter', onEnterGallery
        )
        el.addEventListener('mouseleave', resetCursor)
      })

      // Text elements
      document.querySelectorAll(
        'p, h1, h2, h3, h4, label'
      ).forEach(el => {
        el.addEventListener('mouseenter', onEnterText)
        el.addEventListener('mouseleave', resetCursor)
      })
    }

    attachEvents()

    // Re-attach when DOM changes
    const observer = new MutationObserver(
      attachEvents
    )
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })

    // Cursor leave/enter window
    document.addEventListener(
      'mouseleave', () => {
        gsap.to([dot.current, ring.current], {
          opacity: 0, duration: 0.3
        })
      }
    )
    document.addEventListener(
      'mouseenter', () => {
        gsap.to([dot.current, ring.current], {
          opacity: 1, duration: 0.3
        })
      }
    )

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      observer.disconnect()
    }
  }, [])

  // Don't render on touch devices
  if (typeof window !== 'undefined' &&
    window.matchMedia('(hover: none)').matches) {
    return null
  }

  return (
    <>
      {/* Small dot */}
      <div
        ref={dot}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 8, height: 8,
          backgroundColor: 'white',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999999,
          mixBlendMode: 'difference',
          willChange: 'transform',
        }}
      />

      {/* Large ring */}
      <div
        ref={ring}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: 40, height: 40,
          border: '1.5px solid rgba(255,255,255,0.3)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 999998,
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Ring inner text (VIEW / DRAG) */}
        <span
          ref={ringText}
          style={{
            opacity: 0,
            fontSize: 9,
            color: 'white',
            letterSpacing: '0.15em',
            fontWeight: 600,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        />
      </div>
    </>
  )
}

export default Cursor
