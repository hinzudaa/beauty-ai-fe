import Link from "next/link";

export const metadata = {
  title: "Нууцлалын бодлого — Looka",
  description: "Looka платформын нууцлалын бодлого",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f2f2f7]">


      <div className="max-w-[720px] mx-auto px-5 py-16 drop-shadow-2xl">

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #9333ea, transparent 70%)" }} />
          <div className="absolute -bottom-[200px] -right-[200px] w-[500px] h-[500px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, #7c3aed, transparent 70%)" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(ellipse, #c084fc, transparent 65%)" }} />
        </div>

        {/* Header */}
        <div className="mb-12">
          <p className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[#9333ea] mb-3">
            ✦ Looka AI
          </p>
          <h1 className="text-[2.2rem] font-extrabold tracking-[-0.03em] leading-[1.1] text-[#1c1c1e] mb-3">
            Нууцлалын бодлого
          </h1>
          <p className="text-[0.88rem] text-[#8e8e93]">
            Хүчин төгөлдөр болсон огноо: 2025 оны 1 дүгээр сарын 1
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.05)] space-y-8">

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">1. Ерөнхий мэдээлэл</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              Looka AI нь таны хувийн мэдээллийг хамгаалахыг эрхэмлэдэг. Энэхүү нууцлалын бодлого нь манай платформ ашиглах үед таны өгөгдлийг хэрхэн цуглуулж, ашиглаж, хамгаалах талаар тайлбарладаг.
            </p>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">2. Цуглуулдаг мэдээлэл</h2>
            <div className="space-y-3 text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              <p><span className="font-semibold text-[#1c1c1e]">Утасны дугаар:</span> Бүртгэл болон нэвтрэх зорилгоор SMS баталгаажуулалтад ашиглана.</p>
              <p><span className="font-semibold text-[#1c1c1e]">Зураг:</span> Та оруулсан зургийг AI шинжилгээнд ашиглана. Зургийг гуравдагч этгээдтэй хуваалцахгүй.</p>
              <p><span className="font-semibold text-[#1c1c1e]">Ашиглалтын мэдээлэл:</span> Платформ ашиглах хэмжээ, хандалтын цаг зэрэг техникийн мэдээллийг бүртгэнэ.</p>
              <p><span className="font-semibold text-[#1c1c1e]">Төлбөрийн мэдээлэл:</span> QPay-р дамжуулан хийсэн гүйлгээний мэдээллийг хадгална. Карт болон банкны дэлгэрэнгүй мэдээллийг бид шууд хадгалдаггүй.</p>
            </div>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">3. Мэдээллийг ашиглах зорилго</h2>
            <ul className="space-y-2 text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              {[
                "AI шинжилгээ болон look зураг үүсгэх",
                "Захиалгын удирдлага болон төлбөр боловсруулах",
                "Хэрэглэгчийн дэмжлэг үзүүлэх",
                "Платформын ажиллагааг сайжруулах",
                "Хуулийн үүрэг биелүүлэх",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[#9333ea] shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">4. Мэдээллийн хадгалалт ба аюулгүй байдал</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              Таны мэдээллийг бид аюулгүй хадгална. Бид SSL шифрлэлт, JWT баталгаажуулалт ашиглан хэрэглэгчийн мэдээллийг хамгаалдаг. Зургийг зөвхөн шинжилгээ хийх хугацаанд ашиглах бөгөөд хуваалцахгүй.
            </p>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">5. Гуравдагч этгээдтэй хуваалцах</h2>
            <div className="space-y-3 text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              <p>Бид таны хувийн мэдээллийг борлуулахгүй. Зөвхөн дараах тохиолдолд хуваалцана:</p>
              <ul className="space-y-2 pl-4">
                {[
                  "Үйлчилгээ үзүүлэгчид AI-ууд",
                  "QPay — төлбөр боловсруулах",
                  "OTP — SMS баталгаажуулалт",
                  "Хуулийн шаардлагаар",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-[#aeaeb2] shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">6. Хэрэглэгчийн эрх</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              Та өөрийн мэдээллийг үзэх, засах, устгах эрхтэй. Мэдээлэл устгах хүсэлтийг доорх холбоо барих хаягаар илгээнэ үү.
            </p>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">7. Холбоо барих</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              Нууцлалтай холбоотой асуулт байвал:{" "}
              <span className="font-semibold text-[#9333ea]">support@looka.beauty</span>
            </p>
          </section>

        </div>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-[0.85rem] font-semibold text-[#9333ea] hover:underline">
            ← Нүүр хуудас руу буцах
          </Link>
        </div>

      </div>
    </div>
  );
}
