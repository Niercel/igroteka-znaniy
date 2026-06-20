import { Helmet } from 'react-helmet-async'
import AnimatedBackground from '../components/AnimatedBackground'
import Header from '../components/Header'
import Hero from '../components/Hero'
import Services from '../components/Services'
import HowItWorks from '../components/HowItWorks'
import Advantages from '../components/Advantages'
import Footer from '../components/Footer'
import ScrollToTop from '../components/ScrollToTop'

export default function HomePage() {
  const seoData = {
    title: 'Игротека знаний — подготовка к школе в игровой форме',
    description: 'Интерактивные тренажёры для детей 4–7 лет. Развиваем мышление, память и речь без скучных заданий. Более 10 000 родителей уже с нами!',
    keywords: 'подготовка к школе, развивающие игры для детей, интерактивный тренажёр, дошкольник, математика, чтение, логика, внимание, память',
    siteName: 'Игротека знаний',
    type: 'website'
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: seoData.siteName,
    description: seoData.description,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'All',
    url: seoData.url,
    image: seoData.image,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'RUB'
    },
    author: {
      '@type': 'Organization',
      name: 'Игротека знаний'
    }
  }

  return (
    <>
      <Helmet>
        {/* Базовые мета-теги */}
        <title>{seoData.title}</title>
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <link rel="canonical" href={seoData.url} />

        {/* Open Graph (для соцсетей) */}
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.image} />
        <meta property="og:url" content={seoData.url} />
        <meta property="og:site_name" content={seoData.siteName} />
        <meta property="og:type" content={seoData.type} />
        <meta property="og:locale" content="ru_RU" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoData.title} />
        <meta name="twitter:description" content={seoData.description} />
        <meta name="twitter:image" content={seoData.image} />

        {/* Структурированные данные (JSON-LD) */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>

      <div className="relative min-h-screen">
        <AnimatedBackground />
        <Header />
        <main className="relative z-10">
          <Hero />
          <Services />
          <HowItWorks />
          <Advantages />
        </main>
        <Footer />
        <ScrollToTop />
      </div>
    </>
  )
}