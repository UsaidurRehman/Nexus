import { Helmet } from 'react-helmet-async';
import { BRAND, ENV, SITE } from '../../config.js';

/** Per-route meta + OpenGraph so WhatsApp/LinkedIn shares render a card. */
export default function Seo({
  title,
  description,
  image,
  path = '/',
  type = 'website',
  noIndex = false,
}) {
  const fullTitle = SITE.TITLE_TEMPLATE(title);
  const desc = description || SITE.DEFAULT_DESCRIPTION;
  const url = ENV.SITE_URL ? `${ENV.SITE_URL}${path}` : path;
  const banner = image || BRAND.HERO_BANNER;
  const absoluteImage =
    ENV.SITE_URL && banner.startsWith('/') ? `${ENV.SITE_URL}${banner}` : banner;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      {noIndex ? <meta name="robots" content="noindex, nofollow" /> : null}

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={BRAND.FULL_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={SITE.LOCALE} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={absoluteImage} />
    </Helmet>
  );
}
