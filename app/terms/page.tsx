import Link from "next/link";

export const metadata = {
  title: "Үйлчилгээний нөхцөл — Looka",
  description: "Looka платформын үйлчилгээний нөхцөл",
};

export default function TermsPage() {
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
            Үйлчилгээний нөхцөл
          </h1>
          <p className="text-[0.88rem] text-[#8e8e93]">
            Хүчин төгөлдөр болсон огноо: 2026 оны 1 дүгээр сарын 1
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.06)] border border-[rgba(0,0,0,0.05)] space-y-8">

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">1. Нөхцөлийг зөвшөөрөх</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              Looka AI платформыг ашигласнаар та энэхүү үйлчилгээний нөхцөлтэй бүрэн санал нийлж, зөвшөөрч байна гэж үзнэ. Нөхцөлийг зөвшөөрөхгүй тохиолдолд платформыг ашиглах боломжгүй.
            </p>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">2. Үйлчилгээний тодорхойлолт</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7] mb-3">
              Looka AI нь дараах үйлчилгээг санал болгодог:
            </p>
            <ul className="space-y-2 text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              {[
                "AI дээр суурилсан царайны шинжилгээ",
                "Hairstyle болон хувцасны зөвлөмж",
                "AI-ийн үүсгэсэн look зургууд",
                "Хувийн стилистийн чат (Pro захиалга)",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-[#9333ea] shrink-0 mt-0.5">✦</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">3. Захиалга ба төлбөр</h2>
            <div className="space-y-3 text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              <p><span className="font-semibold text-[#1c1c1e]">Сарын захиалга:</span> Basic, Standard, Pro гэсэн гурван төрлийн захиалга байна. Захиалга хийснээс хойш 30 хоногийн хугацаатай.</p>
              <p><span className="font-semibold text-[#1c1c1e]">Төлбөр:</span> QPay-р дамжуулан Монгол төгрөгөөр төлнө. Төлбөр амжилттай хийгдсэний дараа захиалга шууд идэвхждэг.</p>
              <p><span className="font-semibold text-[#1c1c1e]">Буцаалт:</span> Захиалга идэвхжсэний дараа буцааж олгохгүй. Техникийн асуудал гарсан тохиолдолд манай дэмжлэгтэй холбоо барина уу.</p>
              <p><span className="font-semibold text-[#1c1c1e]">Ашиглалтын хязгаар:</span> Basic: сард 5, Standard: сард 10, Pro: сард 10 шинжилгээ хийх боломжтой. Хязгаарт хүрсэн тохиолдолд дараа сард автоматаар шинэчлэгдэнэ.</p>
            </div>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">4. Хэрэглэгчийн үүрэг</h2>
            <div className="space-y-2 text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              <p>Та дараах зүйлийг хийхгүй байх үүрэгтэй:</p>
              <ul className="space-y-2 pl-4 mt-2">
                {[
                  "Бусдын зургийг зөвшөөрөлгүйгээр ашиглах",
                  "Платформыг хуурамч болон хортой зорилгоор ашиглах",
                  "Системийг хяналтгүйгээр ачаалах, хакердах",
                  "AI-ийн гаргасан үр дүнг буруу мэдээлэл байдлаар тараах",
                  "16 нас хүрээгүй хүний зургийг оруулах",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-red-400 shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">5. AI үр дүнгийн хязгаарлалт</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              Looka AI-ийн гаргасан шинжилгээ болон зөвлөмж нь зөвхөн лавлагааны зорилгоор бөгөөд мэргэжлийн гоо сайхны зөвлөлийг орлохгүй. AI-ийн үр дүнд тулгуурлан гаргасан шийдвэрийн хариуцлагыг бид хүлээхгүй.
            </p>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem font-bold text-[#1c1c1e] mb-3">6. Оюуны өмч</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              Looka AI платформын бүх контент, дизайн, логик нь манай өмч юм. AI-ийн үүсгэсэн зургийг хувийн зорилгоор ашиглах боломжтой боловч арилжааны зорилгоор ашиглахад зөвшөөрөл шаардлагатай.
            </p>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">7. Үйлчилгээ зогсоох</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              Дүрэм зөрчсөн тохиолдолд бид урьдчилан мэдэгдэлгүйгээр таны эрхийг зогсоох эрхтэй. Мөн бизнесийн шалтгаанаар үйлчилгээг зогсоох тохиолдолд 7 хоногийн өмнө мэдэгдэнэ.
            </p>
          </section>

          <div className="h-px bg-[rgba(0,0,0,0.05)]" />

          <section>
            <h2 className="text-[1.1rem] font-bold text-[#1c1c1e] mb-3">8. Холбоо барих</h2>
            <p className="text-[0.88rem] text-[#3a3a3c] leading-[1.7]">
              Асуулт, санал хүсэлт:{" "}
              <span className="font-semibold text-[#9333ea]">support@looka.beauty</span>
            </p>
          </section>

        </div>

        {/* Links */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/privacy" className="text-[0.85rem] font-semibold text-[#9333ea] hover:underline">
            Нууцлалын бодлого
          </Link>
          <span className="hidden sm:block text-[#c7c7cc]">·</span>
          <Link href="/" className="text-[0.85rem] font-semibold text-[#9333ea] hover:underline">
            ← Нүүр хуудас руу буцах
          </Link>
        </div>

      </div>
    </div>
  );
}
