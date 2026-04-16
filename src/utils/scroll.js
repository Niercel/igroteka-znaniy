// Кастомная плавная прокрутка
const smoothScrollToPosition = (targetPosition, duration) => {
  const startPosition = window.pageYOffset
  const distance = targetPosition - startPosition
  let startTime = null

  const animation = (currentTime) => {
    if (startTime === null) startTime = currentTime
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)

    const easeInOutCubic = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2

    window.scrollTo(0, startPosition + distance * easeInOutCubic)

    if (timeElapsed < duration) {
      requestAnimationFrame(animation)
    }
  }

  requestAnimationFrame(animation)
}

// Плавный скролл к элементу по ID
export const smoothScrollTo = (elementId, offset = 80) => {
  const element = document.getElementById(elementId)
  if (!element) return
  
  const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset
  smoothScrollToPosition(targetPosition, 800)
}

// Плавный скролл наверх
export const scrollToTop = () => {
  smoothScrollToPosition(0, 800)
}

// Автоматически включаем плавный скролл для всех якорных ссылок
export const initSmoothScroll = () => {
  // Переопределяем стандартный scrollTo для всего сайта
  const originalScrollTo = window.scrollTo
  window.scrollTo = function(options) {
    if (typeof options === 'object' && options.behavior === 'smooth') {
      smoothScrollToPosition(options.top || 0, 800)
    } else {
      originalScrollTo.apply(this, arguments)
    }
  }

  // Вешаем обработчик на все ссылки с хешем
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a')
    if (!link) return

    const href = link.getAttribute('href')
    if (href && href.startsWith('#')) {
      e.preventDefault()
      const id = href.slice(1)
      const element = document.getElementById(id)
      if (element) {
        const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80
        smoothScrollToPosition(targetPosition, 800)
      }
    }
  })
}