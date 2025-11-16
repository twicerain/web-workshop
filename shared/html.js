/**
 * shared HTML template utilities that work in both server and browser contexts
 *
 * moving HTML generating functions to a shared context allowed me to ensure that
 * my server and the browser are rendering identical pages in CSR or SSR modes
 * to ensure the pedagogical purpose of implementing an app that can switch modes
 * isn't obfuscated by layout/design shifts
 */

/**
 * @param {TemplateStringsArray} strings
 * @param {...any} values
 * @returns {string}
 */
export const html = (strings, ...values) =>
  String.raw({ raw: strings }, ...values)

export const js = html

export const icons = {
  chevronLeft: html`
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  `,
  chevronRight: html`
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  `,
  chevronDown: html`
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
    >
      <path d="M1 1L6 6L11 1" stroke-linecap="round" />
    </svg>
  `,
  spinner: html`
    <svg viewbox="0 0 20 20" id="spinner">
      <style>
      #rect {
        animation: smoosh 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9)
          infinite;
        transform-origin: 50% 50%;
      }

      @keyframes smoosh {
        25% {
          transform: rotateX(180deg) rotateY(0);
        }

        50% {
          transform: rotateX(180deg) rotateY(180deg);
        }

        75% {
          transform: rotateX(0) rotateY(180deg);
        }

        100% {
          transform: rotateX(0) rotateY(0);
        }
      }
      </style>
      <rect width="20" height="20" fill="currentColor" id="rect" />
    </svg>
  `,
  laser: html`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 512 512"
    >
      <!-- Icon from Game Icons by GameIcons - https://github.com/game-icons/icons/blob/master/license.txt -->
      <path
        fill="currentColor"
        d="M61 16L16 61l195 180l195 165l-165-195zm314.97 240a120.85 120.85 0 0 0-60.876 16.656l45.406 45.406c10.03-2.64 20.587-2.446 30.594.157l45.75-45.75v-.064c-18.757-11.03-39.81-16.472-60.875-16.406zm-103.314 59.156c-22.027 37.48-22.31 84.238-.25 121.75l45.75-45.75c-2.56-10.002-2.73-20.594-.094-30.625zm206.938 0l-45.75 45.75c2.556 10.007 2.73 20.565.094 30.594l45.406 45.406c22.03-37.48 22.312-84.24.25-121.75M360.906 433.844l-45.75 45.75c37.514 22.06 84.27 21.788 121.75-.25L391.5 433.938V434c-10.03 2.64-20.592 2.45-30.594-.156"
      />
    </svg>
  `,
  copy: html`
    <svg
      class="copy-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 2H3C2.44772 2 2 2.44772 2 3V13C2 13.5523 2.44772 14 3 14H10C10.5523 14 11 13.5523 11 13V11"
        stroke="currentColor"
        stroke-width="2"
      />
      <rect
        x="6"
        y="2"
        width="8"
        height="8"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
      />
    </svg>
  `,
  check: html`
    <svg
      class="check-icon"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 8L6 12L14 4"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="square"
      />
    </svg>
  `,
}

/**
 * @param {number} current
 * @param {number} total
 * @returns {string}
 */
export function slideCounter(current, total) {
  return `${current + 1}/${total}`
}

/**
 * @param {string} pageSlug
 * @param {import("types").Slide[]} slides
 * @param {number} [currentSlide] - The current slide index
 * @returns {string}
 */
export function slideNav(pageSlug, slides, currentSlide) {
  return html`
    <nav class="slide-nav">
      <ul>
        ${slides
          .map(({ title, depth }, idx) =>
            html`
              <li style="padding-left: ${depth - 1}rem">
                <a href="/${pageSlug}${idx
                  ? `/${idx}`
                  : ''}" ${idx === currentSlide
                  ? ' aria-current="page"'
                  : ''}>${title}</a>
              </li>
            `
          )
          .join('')}
      </ul>
    </nav>
  `
}

/**
 * @param {'prev' | 'next'} dir
 * @param {number} idx
 * @returns {string}
 */
export function prevNextBtn(dir, idx) {
  return html`
    <a href="/slide/${idx}" aria-label="${dir === 'prev'
      ? 'Previous slide'
      : 'Next slide'}">${dir === 'prev'
      ? icons.chevronLeft
      : icons.chevronRight}</a>
  `
}

/**
 * @param {import('types').HTTPStatus} httpStatus
 * @returns {string}
 */
export function errorContent(httpStatus) {
  const { status, statusText } = httpStatus
  return html`
    <h1>${status} ${statusText}</h1>
    <a href="/">return home</a>
  `
}

/**
 * @param {Object} options
 * @param {string} options.slug
 * @param {string} options.title
 * @param {number} [options.index]
 * @param {boolean} options.isSlides
 * @param {import("types").Slide[]} [options.slides]
 * @returns {string}
 */
export function breadcrumbs({ slug, title, index, isSlides, slides }) {
  if (slug === 'index' || slug === '/') {
    return html`
      <div class="breadcrumbs">
        <a href="/">/</a>
      </div>
    `
  }

  if (!isSlides) {
    return html`
      <div class="breadcrumbs">
        <a href="/">/</a>
        <a href="/${slug}">${title}</a>
      </div>
    `
  }

  const pageTitle = slides?.[0]?.title || slug

  if (index === 0) {
    return html`
      <div class="breadcrumbs">
        <a href="/">/</a>
        <a href="/${slug}">${pageTitle}</a>
      </div>
    `
  }

  return html`
    <div class="breadcrumbs">
      <a href="/">/</a>
      <a href="/${slug}">${pageTitle}</a>
      <a href="/${slug}/${index}">${title}</a>
    </div>
  `
}

/**
 * @param {string} slug
 * @param {number} index
 * @param {number} totalSlides
 * @returns {string}
 */
export function slideFooter(slug, index, totalSlides) {
  const prevHref = index > 1
    ? `/${slug}/${index - 1}`
    : index === 1
    ? `/${slug}`
    : '#'
  const nextHref = index < totalSlides - 1 ? `/${slug}/${index + 1}` : '#'

  return html`
    <a href="${prevHref}" aria-label="Previous slide" ${index === 0
      ? 'style="opacity: 0.3; pointer-events: none;" aria-disabled="true"'
      : ''}>${icons.chevronLeft}</a>
    <span id="current-slide">${index + 1}/${totalSlides}</span>
    <a href="${nextHref}" aria-label="Next slide" ${index === totalSlides - 1
      ? 'style="opacity: 0.3; pointer-events: none;" aria-disabled="true"'
      : ''}>${icons.chevronRight}</a>
  `
}

/**
 * @param {string} title
 * @returns {string}
 */
export function pageTitle(title) {
  return html`
    ${`${title ? `${title} |` : ''} Web workshop`}
  `.trim()
}
