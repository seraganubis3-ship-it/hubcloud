export interface Governorate {
  id: string;
  nameAr: string;
  nameEn: string;
  cities: { nameAr: string; nameEn: string }[];
}

export const EGYPT_GOVERNORATES: Governorate[] = [
  {
    id: 'cairo',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    cities: [
      { nameAr: 'مدينة نصر', nameEn: 'Nasr City' },
      { nameAr: 'مصر الجديدة', nameEn: 'Heliopolis' },
      { nameAr: 'التجمع الخامس (القاهرة الجديدة)', nameEn: 'New Cairo (5th Settlement)' },
      { nameAr: 'التجمع الأول', nameEn: '1st Settlement' },
      { nameAr: 'المعادي', nameEn: 'Maadi' },
      { nameAr: 'الزمالك', nameEn: 'Zamalek' },
      { nameAr: 'وسط البلد', nameEn: 'Downtown' },
      { nameAr: 'شبرا', nameEn: 'Shubra' },
      { nameAr: 'المقطم', nameEn: 'Mokattam' },
      { nameAr: 'الشروق', nameEn: 'El Shorouk' },
      { nameAr: 'مدينتي', nameEn: 'Madinaty' },
      { nameAr: 'الرحاب', nameEn: 'Al Rehab' },
      { nameAr: 'بدر', nameEn: 'Badr City' },
      { nameAr: 'حلوان', nameEn: 'Helwan' },
      { nameAr: 'عين شمس', nameEn: 'Ain Shams' },
      { nameAr: 'المرج', nameEn: 'El Marg' },
      { nameAr: 'الزيتون', nameEn: 'Zeitoun' },
      { nameAr: 'حدائق القبة', nameEn: 'Hadayek El Kobba' },
      { nameAr: 'العباسية', nameEn: 'Abbassia' },
      { nameAr: 'العاصمة الإدارية الجديدة', nameEn: 'New Administrative Capital' },
    ]
  },
  {
    id: 'giza',
    nameAr: 'الجيزة',
    nameEn: 'Giza',
    cities: [
      { nameAr: 'الدقي', nameEn: 'Dokki' },
      { nameAr: 'المهندسين', nameEn: 'Mohandessin' },
      { nameAr: 'الشيخ زايد', nameEn: 'Sheikh Zayed' },
      { nameAr: 'مدينة 6 أكتوبر', nameEn: '6th of October' },
      { nameAr: 'الهرم', nameEn: 'Haram' },
      { nameAr: 'فيصل', nameEn: 'Faisal' },
      { nameAr: 'حدائق الأهرام', nameEn: 'Hadayek Al Ahram' },
      { nameAr: 'العجوزة', nameEn: 'Agouza' },
      { nameAr: 'العمرانية', nameEn: 'Omraneya' },
      { nameAr: 'البدرشين', nameEn: 'Badrasheen' },
      { nameAr: 'الحوامدية', nameEn: 'Hawamdia' },
      { nameAr: 'أوسيم', nameEn: 'Oseem' },
      { nameAr: 'كرداسة', nameEn: 'Kerdasa' },
      { nameAr: 'الصف', nameEn: 'El Saff' },
      { nameAr: 'أطفيح', nameEn: 'Atfeeh' },
    ]
  },
  {
    id: 'alexandria',
    nameAr: 'الإسكندرية',
    nameEn: 'Alexandria',
    cities: [
      { nameAr: 'سموحة', nameEn: 'Smouha' },
      { nameAr: 'سيدي جابر', nameEn: 'Sidi Gaber' },
      { nameAr: 'ميامي', nameEn: 'Miami' },
      { nameAr: 'سيدي بشر', nameEn: 'Sidi Bishr' },
      { nameAr: 'المنتزه', nameEn: 'Montazah' },
      { nameAr: 'لوران', nameEn: 'Loran' },
      { nameAr: 'كفر عبده', nameEn: 'Kafr Abdo' },
      { nameAr: 'محطة الرمل', nameEn: 'Raml Station' },
      { nameAr: 'العجمي', nameEn: 'Agami' },
      { nameAr: 'الإبراهيمية', nameEn: 'Ibrahimia' },
      { nameAr: 'بحري والأنفوشي', nameEn: 'Bahary & Anfoushi' },
      { nameAr: 'برج العرب', nameEn: 'Borg El Arab' },
      { nameAr: 'العامرية', nameEn: 'Amreya' },
    ]
  },
  {
    id: 'monufia',
    nameAr: 'المنوفية',
    nameEn: 'Monufia',
    cities: [
      { nameAr: 'شبين الكوم', nameEn: 'Shibin El Kom' },
      { nameAr: 'تلا', nameEn: 'Tala' },
      { nameAr: 'قويسنا', nameEn: 'Quesna' },
      { nameAr: 'بركة السبع', nameEn: 'Berket El Saba' },
      { nameAr: 'منوف', nameEn: 'Menouf' },
      { nameAr: 'أشمون', nameEn: 'Ashmoun' },
      { nameAr: 'الباجور', nameEn: 'El Bagour' },
      { nameAr: 'الشهداء', nameEn: 'El Shohada' },
      { nameAr: 'سرس الليان', nameEn: 'Sers El Lyan' },
      { nameAr: 'مدينة السادات', nameEn: 'Sadat City' },
    ]
  },
  {
    id: 'qalyubia',
    nameAr: 'القليوبية',
    nameEn: 'Qalyubia',
    cities: [
      { nameAr: 'بنها', nameEn: 'Banha' },
      { nameAr: 'شبرا الخيمة', nameEn: 'Shubra El Kheima' },
      { nameAr: 'مدينة العبور', nameEn: 'Obour City' },
      { nameAr: 'قليوب', nameEn: 'Qalyub' },
      { nameAr: 'الخانكة', nameEn: 'Khanka' },
      { nameAr: 'طوخ', nameEn: 'Toukh' },
      { nameAr: 'القناطر الخيرية', nameEn: 'Qanater' },
      { nameAr: 'كفر شكر', nameEn: 'Kafr Shukr' },
      { nameAr: 'شبين القناطر', nameEn: 'Shibin El Qanater' },
    ]
  },
  {
    id: 'gharbia',
    nameAr: 'الغربية',
    nameEn: 'Gharbia',
    cities: [
      { nameAr: 'طنطا', nameEn: 'Tanta' },
      { nameAr: 'المحلة الكبرى', nameEn: 'El Mahalla El Kubra' },
      { nameAr: 'كفر الزيات', nameEn: 'Kafr El Zayat' },
      { nameAr: 'زفتى', nameEn: 'Zefta' },
      { nameAr: 'السنطة', nameEn: 'El Santa' },
      { nameAr: 'سمنود', nameEn: 'Samanoud' },
      { nameAr: 'بسيون', nameEn: 'Basyoun' },
      { nameAr: 'قطور', nameEn: 'Qotour' },
    ]
  },
  {
    id: 'sharqia',
    nameAr: 'الشرقية',
    nameEn: 'Sharqia',
    cities: [
      { nameAr: 'الزقازيق', nameEn: 'Zagazig' },
      { nameAr: 'مدينة العاشر من رمضان', nameEn: '10th of Ramadan' },
      { nameAr: 'بلبيس', nameEn: 'Belbeis' },
      { nameAr: 'فاقوس', nameEn: 'Faqous' },
      { nameAr: 'أبو حماد', nameEn: 'Abu Hammad' },
      { nameAr: 'منيا القمح', nameEn: 'Minya El Qamh' },
      { nameAr: 'ديرب نجم', nameEn: 'Diyarb Negm' },
      { nameAr: 'أبو كبير', nameEn: 'Abu Kebir' },
      { nameAr: 'كفر صقر', nameEn: 'Kafr Saqr' },
      { nameAr: 'الحسينية', nameEn: 'Husseiniya' },
      { nameAr: 'مدينة الصالحية الجديدة', nameEn: 'New Salhia' },
    ]
  },
  {
    id: 'dakahlia',
    nameAr: 'الدقهلية',
    nameEn: 'Dakahlia',
    cities: [
      { nameAr: 'المنصورة', nameEn: 'Mansoura' },
      { nameAr: 'طلخا', nameEn: 'Talkha' },
      { nameAr: 'ميت غمر', nameEn: 'Mit Ghamr' },
      { nameAr: 'السنبلاوين', nameEn: 'Sinbillawin' },
      { nameAr: 'دكرنس', nameEn: 'Dikirnis' },
      { nameAr: 'بلقاس', nameEn: 'Belqas' },
      { nameAr: 'شربين', nameEn: 'Sherbin' },
      { nameAr: 'أجا', nameEn: 'Aga' },
      { nameAr: 'المنزلة', nameEn: 'Manzala' },
      { nameAr: 'منية النصر', nameEn: 'Minyat El Nasr' },
      { nameAr: 'جمصة', nameEn: 'Gamasa' },
    ]
  },
  {
    id: 'beheira',
    nameAr: 'البحيرة',
    nameEn: 'Beheira',
    cities: [
      { nameAr: 'دمنهور', nameEn: 'Damanhour' },
      { nameAr: 'كفر الدوار', nameEn: 'Kafr El Dawar' },
      { nameAr: 'إيتاي البارود', nameEn: 'Itay El Barud' },
      { nameAr: 'كوم حمادة', nameEn: 'Kom Hamada' },
      { nameAr: 'أبو حمص', nameEn: 'Abu Hummus' },
      { nameAr: 'رشيد', nameEn: 'Rashid' },
      { nameAr: 'المحمودية', nameEn: 'Mahmoudia' },
      { nameAr: 'الدلنجات', nameEn: 'Delengat' },
      { nameAr: 'حوش عيسى', nameEn: 'Hosh Essa' },
      { nameAr: 'وادي النطرون', nameEn: 'Wadi El Natrun' },
      { nameAr: 'مدينة النوبارية الجديدة', nameEn: 'New Nubaria' },
    ]
  },
  {
    id: 'kafr_el_sheikh',
    nameAr: 'كفر الشيخ',
    nameEn: 'Kafr El Sheikh',
    cities: [
      { nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh' },
      { nameAr: 'دسوق', nameEn: 'Desouk' },
      { nameAr: 'فوه', nameEn: 'Fouh' },
      { nameAr: 'مطوبس', nameEn: 'Metobas' },
      { nameAr: 'بيلا', nameEn: 'Biela' },
      { nameAr: 'الحامول', nameEn: 'Hamoul' },
      { nameAr: 'سيدي سالم', nameEn: 'Sidi Salem' },
      { nameAr: 'بلطيم', nameEn: 'Baltim' },
      { nameAr: 'الرياض', nameEn: 'Riyadh' },
      { nameAr: 'قلين', nameEn: 'Qellin' },
    ]
  },
  {
    id: 'damietta',
    nameAr: 'دمياط',
    nameEn: 'Damietta',
    cities: [
      { nameAr: 'دمياط', nameEn: 'Damietta' },
      { nameAr: 'دمياط الجديدة', nameEn: 'New Damietta' },
      { nameAr: 'رأس البر', nameEn: 'Ras El Bar' },
      { nameAr: 'فارسكور', nameEn: 'Faraskour' },
      { nameAr: 'كفر سعد', nameEn: 'Kafr Saad' },
      { nameAr: 'الزرقا', nameEn: 'Zarqa' },
    ]
  },
  {
    id: 'port_said',
    nameAr: 'بورسعيد',
    nameEn: 'Port Said',
    cities: [
      { nameAr: 'حي الشرق', nameEn: 'Sharq District' },
      { nameAr: 'حي العرب', nameEn: 'Arab District' },
      { nameAr: 'حي المناخ', nameEn: 'Manakh District' },
      { nameAr: 'حي الضواحي', nameEn: 'Dawahy District' },
      { nameAr: 'حي الزهور', nameEn: 'Zohour District' },
      { nameAr: 'بورفؤاد', nameEn: 'Port Fouad' },
    ]
  },
  {
    id: 'ismailia',
    nameAr: 'الإسماعيلية',
    nameEn: 'Ismailia',
    cities: [
      { nameAr: 'مدينة الإسماعيلية', nameEn: 'Ismailia City' },
      { nameAr: 'فايد', nameEn: 'Fayed' },
      { nameAr: 'القنطرة شرق', nameEn: 'Qantara Sharq' },
      { nameAr: 'القنطرة غرب', nameEn: 'Qantara Gharb' },
      { nameAr: 'التل الكبير', nameEn: 'El Tal El Kebir' },
      { nameAr: 'القصاصين', nameEn: 'El Qasaseen' },
      { nameAr: 'أبو صوير', nameEn: 'Abu Sweir' },
    ]
  },
  {
    id: 'suez',
    nameAr: 'السويس',
    nameEn: 'Suez',
    cities: [
      { nameAr: 'مدينة السويس', nameEn: 'Suez City' },
      { nameAr: 'الأربعين', nameEn: 'Arbaeen' },
      { nameAr: 'حي فيصل', nameEn: 'Faisal District' },
      { nameAr: 'حي الجناين', nameEn: 'Ganayen' },
      { nameAr: 'حي عتاقة', nameEn: 'Attaka' },
      { nameAr: 'العين السخنة', nameEn: 'Ain Sokhna' },
    ]
  },
  {
    id: 'fayoum',
    nameAr: 'الفيوم',
    nameEn: 'Fayoum',
    cities: [
      { nameAr: 'مدينة الفيوم', nameEn: 'Fayoum City' },
      { nameAr: 'الفيوم الجديدة', nameEn: 'New Fayoum' },
      { nameAr: 'سنورس', nameEn: 'Sinnuris' },
      { nameAr: 'إطسا', nameEn: 'Itsa' },
      { nameAr: 'طامية', nameEn: 'Tamiya' },
      { nameAr: 'أبشواي', nameEn: 'Ebshaway' },
      { nameAr: 'يوسف الصديق', nameEn: 'Youssef El Seddik' },
    ]
  },
  {
    id: 'beni_suef',
    nameAr: 'بني سويف',
    nameEn: 'Beni Suef',
    cities: [
      { nameAr: 'مدينة بني سويف', nameEn: 'Beni Suef City' },
      { nameAr: 'بني سويف الجديدة', nameEn: 'New Beni Suef' },
      { nameAr: 'الواسطى', nameEn: 'El Wasta' },
      { nameAr: 'ناصر (بوش)', nameEn: 'Nasser (Boush)' },
      { nameAr: 'إهناسيا', nameEn: 'Ihnasiya' },
      { nameAr: 'ببا', nameEn: 'Biba' },
      { nameAr: 'الفشن', nameEn: 'El Fashn' },
      { nameAr: 'سمسطا', nameEn: 'Sumusta' },
    ]
  },
  {
    id: 'minya',
    nameAr: 'المنيا',
    nameEn: 'Minya',
    cities: [
      { nameAr: 'مدينة المنيا', nameEn: 'Minya City' },
      { nameAr: 'المنيا الجديدة', nameEn: 'New Minya' },
      { nameAr: 'ملوي', nameEn: 'Mallawi' },
      { nameAr: 'بني مزار', nameEn: 'Beni Mazar' },
      { nameAr: 'مغاغة', nameEn: 'Maghagha' },
      { nameAr: 'سمالوط', nameEn: 'Samalut' },
      { nameAr: 'أبو قرقاص', nameEn: 'Abu Qurqas' },
      { nameAr: 'مطاي', nameEn: 'Matay' },
      { nameAr: 'دير مواس', nameEn: 'Deir Mawas' },
      { nameAr: 'العدوة', nameEn: 'El Idwa' },
    ]
  },
  {
    id: 'asyut',
    nameAr: 'أسيوط',
    nameEn: 'Asyut',
    cities: [
      { nameAr: 'مدينة أسيوط', nameEn: 'Asyut City' },
      { nameAr: 'أسيوط الجديدة', nameEn: 'New Asyut' },
      { nameAr: 'ديروط', nameEn: 'Dairut' },
      { nameAr: 'القوصية', nameEn: 'El Qusiya' },
      { nameAr: 'منفلوط', nameEn: 'Manfalut' },
      { nameAr: 'أبنوب', nameEn: 'Abnoub' },
      { nameAr: 'الفتح', nameEn: 'El Fateh' },
      { nameAr: 'أبو تيج', nameEn: 'Abu Tig' },
      { nameAr: 'الغنايم', nameEn: 'El Ghanayem' },
      { nameAr: 'ساحل سليم', nameEn: 'Sahel Selim' },
      { nameAr: 'البداري', nameEn: 'El Badari' },
      { nameAr: 'صدفا', nameEn: 'Sedfa' },
    ]
  },
  {
    id: 'sohag',
    nameAr: 'سوهاج',
    nameEn: 'Sohag',
    cities: [
      { nameAr: 'مدينة سوهاج', nameEn: 'Sohag City' },
      { nameAr: 'سوهاج الجديدة', nameEn: 'New Sohag' },
      { nameAr: 'أخميم', nameEn: 'Akhmim' },
      { nameAr: 'طهطا', nameEn: 'Tahta' },
      { nameAr: 'جرجا', nameEn: 'Girga' },
      { nameAr: 'المراغة', nameEn: 'Maragha' },
      { nameAr: 'البلينا', nameEn: 'Balyana' },
      { nameAr: 'المنشأة', nameEn: 'Monshaah' },
      { nameAr: 'جهينة', nameEn: 'Guhayna' },
      { nameAr: 'ساقلتة', nameEn: 'Saqalta' },
      { nameAr: 'دار السلام', nameEn: 'Dar El Salam' },
    ]
  },
  {
    id: 'qena',
    nameAr: 'قنا',
    nameEn: 'Qena',
    cities: [
      { nameAr: 'مدينة قنا', nameEn: 'Qena City' },
      { nameAr: 'قنا الجديدة', nameEn: 'New Qena' },
      { nameAr: 'نجع حمادي', nameEn: 'Nag Hammadi' },
      { nameAr: 'دشنا', nameEn: 'Dishna' },
      { nameAr: 'قوص', nameEn: 'Qus' },
      { nameAr: 'أبو تشت', nameEn: 'Abu Tesht' },
      { nameAr: 'فرشوط', nameEn: 'Farshout' },
      { nameAr: 'قفط', nameEn: 'Qift' },
      { nameAr: 'نقادة', nameEn: 'Naqada' },
      { nameAr: 'الوقف', nameEn: 'El Waqf' },
    ]
  },
  {
    id: 'luxor',
    nameAr: 'الأقصر',
    nameEn: 'Luxor',
    cities: [
      { nameAr: 'مدينة الأقصر', nameEn: 'Luxor City' },
      { nameAr: 'الأقصر الجديدة', nameEn: 'New Luxor' },
      { nameAr: 'طيبة الجديدة', nameEn: 'New Tiba' },
      { nameAr: 'إسنا', nameEn: 'Esna' },
      { nameAr: 'أرمنت', nameEn: 'Armant' },
      { nameAr: 'البياضية', nameEn: 'Bayadiya' },
      { nameAr: 'القرنة', nameEn: 'Qurna' },
      { nameAr: 'الزينية', nameEn: 'Zayniya' },
    ]
  },
  {
    id: 'aswan',
    nameAr: 'أسوان',
    nameEn: 'Aswan',
    cities: [
      { nameAr: 'مدينة أسوان', nameEn: 'Aswan City' },
      { nameAr: 'أسوان الجديدة', nameEn: 'New Aswan' },
      { nameAr: 'كوم أمبو', nameEn: 'Kom Ombo' },
      { nameAr: 'إدفو', nameEn: 'Edfu' },
      { nameAr: 'نصر النوبة', nameEn: 'Nasr El Nuba' },
      { nameAr: 'دراو', nameEn: 'Daraw' },
      { nameAr: 'أبو سمبل', nameEn: 'Abu Simbel' },
    ]
  },
  {
    id: 'red_sea',
    nameAr: 'البحر الأحمر',
    nameEn: 'Red Sea',
    cities: [
      { nameAr: 'الغردقة', nameEn: 'Hurghada' },
      { nameAr: 'الجونة', nameEn: 'El Gouna' },
      { nameAr: 'سفاجا', nameEn: 'Safaga' },
      { nameAr: 'القصير', nameEn: 'Quseir' },
      { nameAr: 'مرسى علم', nameEn: 'Marsa Alam' },
      { nameAr: 'رأس غارب', nameEn: 'Ras Ghareb' },
      { nameAr: 'شلاتين', nameEn: 'Shalatin' },
      { nameAr: 'حلايب', nameEn: 'Halaib' },
    ]
  },
  {
    id: 'matrouh',
    nameAr: 'مطروح',
    nameEn: 'Matrouh',
    cities: [
      { nameAr: 'مرسى مطروح', nameEn: 'Marsa Matrouh' },
      { nameAr: 'الساحل الشمالي', nameEn: 'North Coast' },
      { nameAr: 'العلمين', nameEn: 'Alamein' },
      { nameAr: 'العلمين الجديدة', nameEn: 'New Alamein' },
      { nameAr: 'سيدي عبد الرحمن', nameEn: 'Sidi Abdel Rahman' },
      { nameAr: 'الحمام', nameEn: 'Hammam' },
      { nameAr: 'الضبعة', nameEn: 'Dabaa' },
      { nameAr: 'سيوة', nameEn: 'Siwa' },
    ]
  },
  {
    id: 'new_valley',
    nameAr: 'الوادي الجديد',
    nameEn: 'New Valley',
    cities: [
      { nameAr: 'الخارجة', nameEn: 'Kharga' },
      { nameAr: 'الداخلة', nameEn: 'Dakhla' },
      { nameAr: 'الفرافرة', nameEn: 'Farafra' },
      { nameAr: 'بلاط', nameEn: 'Balat' },
      { nameAr: 'باريس', nameEn: 'Baris' },
    ]
  },
  {
    id: 'north_sinai',
    nameAr: 'شمال سيناء',
    nameEn: 'North Sinai',
    cities: [
      { nameAr: 'العريش', nameEn: 'Arish' },
      { nameAr: 'بئر العبد', nameEn: 'Bir El Abd' },
      { nameAr: 'الشيخ زويد', nameEn: 'Sheikh Zuweid' },
      { nameAr: 'رفح', nameEn: 'Rafah' },
    ]
  },
  {
    id: 'south_sinai',
    nameAr: 'جنوب سيناء',
    nameEn: 'South Sinai',
    cities: [
      { nameAr: 'شرم الشيخ', nameEn: 'Sharm El Sheikh' },
      { nameAr: 'دهب', nameEn: 'Dahab' },
      { nameAr: 'نويبع', nameEn: 'Nuweiba' },
      { nameAr: 'طابا', nameEn: 'Taba' },
      { nameAr: 'طور سيناء', nameEn: 'Tor Sinai' },
      { nameAr: 'رأس سدر', nameEn: 'Ras Sudr' },
      { nameAr: 'سانت كاترين', nameEn: 'Saint Catherine' },
    ]
  },
];
