'use client';

import React from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ShieldCheck } from 'lucide-react';

interface ClientItem {
  name: string;
  nameEn: string;
  logo: string;
  sectorAr: string;
  sectorEn: string;
}

const clientsRow1: ClientItem[] = [
  { name: 'البنك التجاري الدولي', nameEn: 'CIB Bank', logo: '/images/clients/cib.png', sectorAr: 'قطاع بنكي ومصرفي', sectorEn: 'Banking & Finance' },
  { name: 'البنك الأهلي المصري', nameEn: 'National Bank of Egypt', logo: '/images/clients/nbe.png', sectorAr: 'قطاع بنكي ومصرفي', sectorEn: 'Banking & Finance' },
  { name: 'بنك مصر', nameEn: 'Banque Misr', logo: '/images/clients/banque_misr.png', sectorAr: 'قطاع بنكي ومصرفي', sectorEn: 'Banking & Finance' },
  { name: 'أوراسكوم للإنشاءات', nameEn: 'Orascom Construction', logo: '/images/clients/orascom.png', sectorAr: 'إنشاءات وبنية تحتية', sectorEn: 'Construction & Infra' },
  { name: 'مجموعة طلعت مصطفى', nameEn: 'Talaat Moustafa Group', logo: '/images/clients/tmg.png', sectorAr: 'تطوير عقاري', sectorEn: 'Real Estate Development' },
  { name: 'حسن علام القابضة', nameEn: 'Hassan Allam Holding', logo: '/images/clients/hassan_allam.png', sectorAr: 'هندسة وإنشاءات', sectorEn: 'Engineering & Construction' },
  { name: 'بالم هيلز للتعمير', nameEn: 'Palm Hills Developments', logo: '/images/clients/palm_hills.png', sectorAr: 'تطوير عقاري', sectorEn: 'Real Estate' },
  { name: 'مصر إيطاليا العقارية', nameEn: 'Misr Italia Properties', logo: '/images/clients/misr_italia.png', sectorAr: 'تطوير عقاري', sectorEn: 'Real Estate' },
  { name: 'الأهلي صبور للتعليم الحديث', nameEn: 'Al Ahly Sabbour', logo: '/images/clients/ahly_sabbour.png', sectorAr: 'تطوير وتعليم', sectorEn: 'Education & Dev' },
  { name: 'حديد عز', nameEn: 'Ezz Steel', logo: '/images/clients/ezz_steel.png', sectorAr: 'صناعة ومعادن', sectorEn: 'Heavy Industry' },
];

const clientsRow2: ClientItem[] = [
  { name: 'مستشفى 57357 لعلاج سرطان الأطفال', nameEn: "Children's Cancer Hospital 57357", logo: '/images/clients/hospital_57357.png', sectorAr: 'رعاية صحية وطبية', sectorEn: 'Healthcare' },
  { name: 'ماكدونالدز', nameEn: "McDonald's", logo: '/images/clients/mcdonalds.png', sectorAr: 'سلاسل تجارية وتغذية', sectorEn: 'Food & Beverage' },
  { name: 'مجموعة بيل العالمية', nameEn: 'Bel Group', logo: '/images/clients/bel.png', sectorAr: 'صناعات غذائية كبرى', sectorEn: 'Multinational FMCG' },
  { name: 'حلواني العبد', nameEn: 'El Abd Patisserie', logo: '/images/clients/elabd.png', sectorAr: 'أغذية وتجارة تجزئة', sectorEn: 'Retail & Hospitality' },
  { name: 'الأكاديمية العربية للعلوم المالية والمصرفية', nameEn: 'Arab Academy for Banking Sciences', logo: '/images/clients/arab_academy.png', sectorAr: 'تعليم عالي وأكاديمي', sectorEn: 'Higher Education' },
  { name: 'مجموعة ألفا', nameEn: 'Alfa Medical Group', logo: '/images/clients/alfa.png', sectorAr: 'رعاية صحية وتشخيصية', sectorEn: 'Healthcare Group' },
  { name: 'مجموعة حمزة', nameEn: 'Hamza TS', logo: '/images/clients/hamza.png', sectorAr: 'حلول واستشارات', sectorEn: 'Solutions & Advisory' },
  { name: 'بنك عودة', nameEn: 'Bank Audi', logo: '/images/clients/bank_audi.png', sectorAr: 'قطاع بنكي ومصرفي', sectorEn: 'Banking' },
  { name: 'الأهلي للتمويل العقاري', nameEn: 'Al Ahly Mortgage Finance', logo: '/images/clients/ahly_mortgage.png', sectorAr: 'تمويل وائتمان', sectorEn: 'Mortgage Finance' },
];

export const OurClientsSection: React.FC = () => {
  const { isRtl } = useStore();

  const marquee1 = [...clientsRow1, ...clientsRow1];
  const marquee2 = [...clientsRow2, ...clientsRow2];

  return (
    <section className="py-6 sm:py-8 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 border-y border-slate-200/70 overflow-hidden">
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-hub-blue text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isRtl ? 'ثقة كبرى الشركات والمؤسسات' : 'Trusted by Leading Enterprises'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {isRtl ? 'عملاؤنا' : 'Our Clients'}
          </h2>

          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            {isRtl
              ? 'نفخر بثقة نخبة من كبرى البنوك، شركات التطوير العقاري، المجموعات الصناعية، والمؤسسات الطبية والتعليمية في مصر لتجهيز بنيتها التحتية وأجهزتها التقنية.'
              : 'Proud to equip premier banks, developers, industrial conglomerates, and healthcare institutions across Egypt and the MENA region.'}
          </p>
        </div>

        {/* Marquee Row 1 (Sliding Left) */}
        <div
          dir="ltr"
          style={{ direction: 'ltr' }}
          className="relative w-full overflow-hidden mb-4 sm:mb-5 [mask-image:_linear-gradient(to_right,transparent_0,_black_40px,_black_calc(100%-40px),transparent_100%)]"
        >
          <div className="flex items-center gap-4 sm:gap-6 w-max animate-clients-marquee-1 hover:[animation-play-state:paused] py-1">
            {marquee1.map((client, idx) => (
              <div
                key={`r1-${client.nameEn}-${idx}`}
                title={isRtl ? `${client.name} - ${client.sectorAr}` : `${client.nameEn} - ${client.sectorEn}`}
                className="flex-shrink-0 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-md px-5 py-3 h-20 sm:h-24 w-44 sm:w-56 flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.03] group cursor-default"
              >
                <div className="relative w-full h-11 sm:h-13">
                  <Image
                    src={client.logo}
                    alt={isRtl ? client.name : client.nameEn}
                    fill
                    className="object-contain object-center filter grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-300"
                    sizes="220px"
                  />
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-hub-blue font-semibold mt-1 truncate max-w-full transition-colors">
                  {isRtl ? client.name : client.nameEn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Sliding Right) */}
        <div
          dir="ltr"
          style={{ direction: 'ltr' }}
          className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_40px,_black_calc(100%-40px),transparent_100%)]"
        >
          <div className="flex items-center gap-4 sm:gap-6 w-max animate-clients-marquee-2 hover:[animation-play-state:paused] py-1">
            {marquee2.map((client, idx) => (
              <div
                key={`r2-${client.nameEn}-${idx}`}
                title={isRtl ? `${client.name} - ${client.sectorAr}` : `${client.nameEn} - ${client.sectorEn}`}
                className="flex-shrink-0 bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-md px-5 py-3 h-20 sm:h-24 w-44 sm:w-56 flex flex-col items-center justify-center transition-all duration-300 hover:scale-[1.03] group cursor-default"
              >
                <div className="relative w-full h-11 sm:h-13">
                  <Image
                    src={client.logo}
                    alt={isRtl ? client.name : client.nameEn}
                    fill
                    className="object-contain object-center filter grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100 transition-all duration-300"
                    sizes="220px"
                  />
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-hub-blue font-semibold mt-1 truncate max-w-full transition-colors">
                  {isRtl ? client.name : client.nameEn}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes clientsMarquee1 {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes clientsMarquee2 {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-clients-marquee-1 {
          animation: clientsMarquee1 45s linear infinite;
        }
        .animate-clients-marquee-2 {
          animation: clientsMarquee2 45s linear infinite;
        }
      `}</style>
    </section>
  );
};
