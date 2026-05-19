export default function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    name: "إذاعة الجمهورية اليمنية",
    alternateName: "Yemen Radio",
    url: "https://www.sanaaradio.org",
    logo: "https://www.sanaaradio.org/logo.png",
    image: "https://www.sanaaradio.org/og.jpg",
    description:
      "إذاعة الجمهورية اليمنية — البرنامج العام، الصوت الرسمي من صنعاء.",
    areaServed: "YE",
    inLanguage: "ar",
    broadcastDisplayName: "البرنامج العام",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}
