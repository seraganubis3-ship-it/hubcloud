export interface SiteContent {
  about: {
    heroTitle: string;
    heroTitleAr: string;
    heroSubtitle: string;
    heroSubtitleAr: string;
    whoAreWe: string;
    whoAreWeAr: string;
    ourVision: string;
    ourVisionAr: string;
    experienceYears: number;
    completedProjects: string;
    clientSatisfaction: string;
    services: Array<{
      id: string;
      title: string;
      titleAr: string;
      description: string;
      descriptionAr: string;
      icon: string;
    }>;
    clients: Array<{
      name: string;
      nameAr: string;
      sector: string;
    }>;
    partners: Array<{
      name: string;
      tier: string;
    }>;
  };
  warranty: {
    title: string;
    titleAr: string;
    subtitle: string;
    subtitleAr: string;
    sections: Array<{
      heading: string;
      headingAr: string;
      content: string;
      contentAr: string;
    }>;
  };
  returns: {
    title: string;
    titleAr: string;
    subtitle: string;
    subtitleAr: string;
    sections: Array<{
      heading: string;
      headingAr: string;
      content: string;
      contentAr: string;
    }>;
  };
  shipping: {
    title: string;
    titleAr: string;
    subtitle: string;
    subtitleAr: string;
    cairoDelivery: string;
    cairoDeliveryAr: string;
    governoratesDelivery: string;
    governoratesDeliveryAr: string;
    standardFee: number;
    freeShippingMin: number;
    notes: string;
    notesAr: string;
  };
  faq: {
    title: string;
    titleAr: string;
    subtitle: string;
    subtitleAr: string;
    items: Array<{
      id: string;
      question: string;
      questionAr: string;
      answer: string;
      answerAr: string;
      category: string;
    }>;
  };
  contact: {
    address: string;
    addressAr: string;
    phone: string;
    email: string;
    workingHours: string;
    workingHoursAr: string;
    googleMapsEmbedUrl?: string;
  };
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  about: {
    heroTitle: 'Enterprise IT Solutions & Security Infrastructure',
    heroTitleAr: 'حلول تكنولوجيا المعلومات المتكاملة والأنظمة الأمنية المتقدمة',
    heroSubtitle: 'Hub Cloud is your certified hardware and enterprise infrastructure partner with over a decade of hands-on engineering excellence.',
    heroSubtitleAr: 'شريكك التكنولوجي المعتمد في مصر لتجهيز البنية التحتية وحلول العتاد المتقدم بأنظمة أمان معتمدة ودعم فني متخصص.',
    whoAreWe: 'Hub Cloud is a professional team working in IT Solutions. We specialize in security and protection devices, servers, networks, and advanced technology infrastructure. We have experts and certified engineers with more than 10 years of experience in the field "IT Solutions".',
    whoAreWeAr: 'هاب كلاود (Hub Cloud) فريق عمل محترف متخصص في حلول تكنولوجيا المعلومات والاتصالات المتكاملة (IT Solutions). نتخصص في أجهزة الحماية والأمان المتقدمة، السيرفرات، الشبكات وتجهيز البنى التحتية التكنولوجية للمؤسسات. نمتلك نخبة من الخبراء والمهندسين المعتمدين بخبرة تفوق 10 سنوات في السوق المصري والإقليمي.',
    ourVision: 'Technology has become the language of the times and a vital part of all fields. We strive to provide secure, rock-solid systems that safeguard enterprise operations. With precision security systems of the highest quality, lowest total cost of ownership, and in record deployment time. We equip institutions with all technical tools including surveillance cameras, high-speed networks, enterprise servers, and premium computing workstations.',
    ourVisionAr: 'أصبحت التكنولوجيا لغة العصر وجزءاً جوهرياً في كافة القطاعات. نسعى جاهدين لتقديم أنظمة تكنولوجية وأمنية فائقة الأمان تحمي مصالح واستمرارية أعمال الشركات والمؤسسات، بأعلى معايير الجودة والدقة، وأقل تكلفة تشغيلية ممكنة، وفي وقت قياسي. نقوم بتجهيز المؤسسات بكافة الحلول من كاميرات المراقبة، شبكات البيانات والألياف، الخوادم ومحطات العمل وملحقاتها.',
    experienceYears: 10,
    completedProjects: '2,500+',
    clientSatisfaction: '99.4%',
    services: [
      {
        id: 'servers-storage',
        title: 'Servers & Storage',
        titleAr: 'الخوادم ووحدات التخزين السحابي',
        description: 'Enterprise rack & tower servers, high-density NAS/SAN storage arrays with redundancy.',
        descriptionAr: 'خوادم الراك والتاور الفائقة، ومصفوفات التخزين المركزية NAS/SAN بحلول نسخ احتياطي واستمرارية أعمال.',
        icon: 'Server',
      },
      {
        id: 'cctv-camera',
        title: 'CCTV Cameras',
        titleAr: 'كاميرات المراقبة والأنظمة الأمنية',
        description: 'AI-driven IP surveillance cameras, NVR recording units, and 24/7 security monitoring centers.',
        descriptionAr: 'كاميرات مراقبة IP ذكية مدعومة بالذكاء الاصطناعي، وحدات تسجيل NVR، وغرف مراقبة أمنية متكاملة.',
        icon: 'Video',
      },
      {
        id: 'data-network-wireless',
        title: 'Data Network & Wireless',
        titleAr: 'شبكات البيانات والربط اللاسلكي',
        description: 'Enterprise managed switches, core routers, firewall gateways, and robust Wi-Fi 6 coverage.',
        descriptionAr: 'سويتشات مدارة، روترات وبوابات جدار الحماية، وتغطية شبكات لاسلكية Wi-Fi 6 فائقة الاستقرار.',
        icon: 'Network',
      },
      {
        id: 'pc-laptops',
        title: 'PC & Laptops',
        titleAr: 'أجهزة الكمبيوتر واللابتوبات',
        description: 'Business-grade desktop PCs, mobile workstations, and executive enterprise laptops.',
        descriptionAr: 'أجهزة كمبيوتر مكتبية للأعمال، ومحطات العمل المتنقلة، ولابتوبات الشركات بضمان معتمد.',
        icon: 'Monitor',
      },
      {
        id: 'security',
        title: 'Cyber & Physical Security',
        titleAr: 'حلول الحماية والأمن المتكامل',
        description: 'Next-generation firewalls, intrusion detection, endpoint protection, and infrastructure shielding.',
        descriptionAr: 'جدران الحماية المتقدمة NGFW، أنظمة كشف التسلل، حماية النقاط الطرفية، وتأمين البنية التحتية.',
        icon: 'ShieldCheck',
      },
      {
        id: 'access-control',
        title: 'Access Control',
        titleAr: 'أنظمة التحكم في الدخول والبصمة',
        description: 'Biometric fingerprint, face recognition, smart card access control, and time attendance.',
        descriptionAr: 'أجهزة البصمة، التعرف على الوجه، الكروت الذكية، وأنظمة الحضور والانصراف وإدارة البوابات.',
        icon: 'Fingerprint',
      },
      {
        id: 'cabling',
        title: 'Structured Cabling',
        titleAr: 'تمديدات الشبكات والكابلات المنظمة',
        description: 'Certified Cat6/Cat6A copper infrastructure, fiber optic splicing, and rack patching solutions.',
        descriptionAr: 'تمديدات شبكات الكابلات المعتمدة Cat6/Cat6A، لحام الألياف الضوئية، وترتيب كبائن السيرفرات.',
        icon: 'Cpu',
      },
      {
        id: 'backup-data',
        title: 'Data Backup & Recovery',
        titleAr: 'النسخ الاحتياطي واستعادة البيانات',
        description: 'Automated disaster recovery systems, onsite/offsite replication, and zero data-loss pipelines.',
        descriptionAr: 'أنظمة النسخ الاحتياطي التلقائي، والتعافي من الكوارث، وحفظ البيانات من التلف أو الفقدان.',
        icon: 'Database',
      },
      {
        id: 'printers',
        title: 'Enterprise Printers & Scanners',
        titleAr: 'الطابعات والماسحات الضوئية للمؤسسات',
        description: 'High-speed multifunction network printers, heavy-duty document scanners, and document management.',
        descriptionAr: 'طابعات شبكية متعددة الوظائف، وماسحات ضوئية للمستندات والوثائق مخصصة للمؤسسات الكبرى.',
        icon: 'Printer',
      },
      {
        id: 'unified-communications',
        title: 'Unified Communications',
        titleAr: 'الاتصالات الموحدة والسنترالات IP-PBX',
        description: 'VoIP business telephone systems, video conferencing hardware, and corporate collaboration hubs.',
        descriptionAr: 'سنترالات IP الهاتفية، غرف الاجتماعات المرئية الذكية، وحلول الاتصال المؤسسي المتكامل.',
        icon: 'PhoneCall',
      },
      {
        id: 'public-address',
        title: 'Public Address & Audio Systems',
        titleAr: 'أنظمة النداء الصوتي والإذاعة الداخلية',
        description: 'Commercial PA audio systems, zoned background music, and emergency announcement amplifiers.',
        descriptionAr: 'أنظمة الصوتيات والنداء العام الموزع، مكبرات الصوت للمباني، وأنظمة الإخلاء والطوارئ.',
        icon: 'Volume2',
      },
      {
        id: 'iptv',
        title: 'Commercial IPTV Systems',
        titleAr: 'أنظمة البث التلفزيوني IPTV',
        description: 'Hospitality & corporate IPTV distribution, digital signage displays, and central media streaming.',
        descriptionAr: 'شبكات البث التلفزيوني التفاعلي للفنادق والمقرات الإدارية، وشاشات العرض الإعلانية الرقمية.',
        icon: 'Tv',
      },
    ],
    clients: [
      { name: "57357 Children's Cancer Hospital", nameAr: 'مستشفى سرطان الأطفال 57357', sector: 'Healthcare' },
      { name: 'National Bank of Egypt (NBE)', nameAr: 'البنك الأهلي المصري', sector: 'Banking' },
      { name: 'Banque Misr', nameAr: 'بنك مصر', sector: 'Banking' },
      { name: 'Commercial International Bank (CIB)', nameAr: 'البنك التجاري الدولي CIB', sector: 'Banking' },
      { name: 'Bank Audi', nameAr: 'بنك عودة', sector: 'Banking' },
      { name: "McDonald's Egypt", nameAr: 'ماكدونالدز مصر', sector: 'Retail & F&B' },
      { name: 'El Abd Patisserie', nameAr: 'حلواني العبد', sector: 'Retail & F&B' },
      { name: 'Bel for all for good', nameAr: 'شركة بيل مصر', sector: 'FMCG' },
      { name: 'Palm Hills Developments', nameAr: 'بالم هيلز للتعمير', sector: 'Real Estate' },
      { name: 'Ezz Steel', nameAr: 'حديد عز', sector: 'Industrial' },
      { name: 'Hassan Allam Holding', nameAr: 'حسن علام القابضة', sector: 'Construction' },
      { name: 'Talaat Moustafa Group (TMG)', nameAr: 'مجموعة طلعت مصطفى', sector: 'Real Estate' },
      { name: 'Orascom Construction', nameAr: 'أوراسكوم للإنشاءات', sector: 'Construction' },
      { name: 'Al Ahly Sabbour', nameAr: 'الأهلي صبور للتنمية', sector: 'Real Estate' },
      { name: 'Misr Italia Properties', nameAr: 'مصر إيطاليا العقارية', sector: 'Real Estate' },
      { name: 'Al Ahly Mortgage Finance', nameAr: 'الأهلي للتمويل العقاري', sector: 'Finance' },
      { name: 'Arab Academy (AASTMT)', nameAr: 'الأكاديمية العربية للعلوم والتكنولوجيا', sector: 'Education' },
      { name: 'Hamza TS', nameAr: 'حمزة للخدمات الفنية', sector: 'Services' },
      { name: 'Alfa Group', nameAr: 'مجموعة ألفا', sector: 'Corporate' },
    ],
    partners: [
      { name: 'Apple', tier: 'Authorized Business Reseller' },
      { name: 'Samsung', tier: 'Enterprise Partner' },
      { name: 'Microsoft', tier: 'Cloud & Volume Licensing' },
      { name: 'Dell Technologies', tier: 'Certified Infrastructure Partner' },
      { name: 'Intel', tier: 'Technology Provider' },
      { name: 'Lenovo', tier: 'Data Center & PC Partner' },
      { name: 'HP Enterprise', tier: 'Enterprise Solutions Partner' },
      { name: 'Hikvision', tier: 'Gold Certified Security Partner' },
      { name: 'Kaspersky', tier: 'Security Certified Partner' },
      { name: 'QNAP', tier: 'Storage Solution Provider' },
      { name: 'APC by Schneider', tier: 'Power & Cooling Specialist' },
      { name: 'Crucial by Micron', tier: 'Memory & Storage Partner' },
      { name: 'Fortinet', tier: 'Network Security Partner' },
    ],
  },
  warranty: {
    title: 'Official Local Hardware Warranty',
    titleAr: 'سياسة الضمان المحلي المعتمد',
    subtitle: 'All equipment supplied by HUB CLOUD comes with full authorized local agency warranty and certified repair coverage.',
    subtitleAr: 'كافة الأجهزة والمعدات المقدمة من HUB CLOUD مشمولة بضمان محلي معتمد وإيصال استلام رسمي لتوفير أقصى درجات الثقة.',
    sections: [
      {
        heading: 'Warranty Duration & Coverage',
        headingAr: 'مدة ونطاق تغطية الضمان',
        content: 'All brand new servers, workstations, PCs, laptops, and networking appliances are backed by a minimum 12-month up to 36-month official hardware warranty against manufacturing defects.',
        contentAr: 'تخضع كافة أجهزة السيرفرات، محطات العمل، أجهزة الكمبيوتر، اللابتوبات ومعدات الشبكات لضمان محلي معتمد يتراوح بين 12 إلى 36 شهراً ضد أي عيوب تصنيع.',
      },
      {
        heading: 'Replacement & Repair Protocol',
        headingAr: 'بروتوكول الصيانة والاستبدال',
        content: 'In the event of any hardware malfunction, our engineering team inspects the hardware within 24 to 48 hours. If a defect is confirmed within the initial period, immediate hardware replacement is fulfilled.',
        contentAr: 'في حال حدوث أي عطل فني في العتاد، يقوم فريق المهندسين بفحص الجهاز خلال 24 إلى 48 ساعة، ويتم توفير قطع الغيار الأصلية أو استبدال الجهاز وفق سياسة الوكيل المعتمد.',
      },
      {
        heading: 'What Is Excluded',
        headingAr: 'استثناءات الضمان',
        content: 'Damage resulting from physical drops, liquid spillage, severe electrical surges outside operational specs, or unauthorized third-party tampering is not covered by the standard warranty.',
        contentAr: 'لا يغطي الضمان الأعطال الناتجة عن الكسر، سوء الاستخدام، انسكاب السوائل، تذبذب التيار الكهربائي الخارج عن المواصفات، أو فتح الجهاز وصيانته خارج المراكز المعتمدة.',
      },
    ],
  },
  returns: {
    title: 'Returns & Exchange Policy',
    titleAr: 'سياسة الاستبدال والاسترجاع',
    subtitle: 'Transparent and compliant return rights in accordance with Egyptian Consumer Protection laws.',
    subtitleAr: 'حقوق إرجاع واستبدال واضحة وعادلة مطابقة لقانون حماية المستهلك المصري.',
    sections: [
      {
        heading: '14-Day Return Right',
        headingAr: 'حق الإرجاع والاستبدال خلال 14 يوماً',
        content: 'Customers have the right to request a return or exchange within 14 days from delivery, provided the hardware remains in its original factory-sealed condition with all accessories and original packaging.',
        contentAr: 'يحق للعميل طلب إرجاع أو استبدال المنتج خلال 14 يوماً من تاريخ الاستلام، بشرط أن يكون المنتج بحالته الأصلية تماماً، بغلاف المصنع وكافة الملحقات والكتيبات المرفقة.',
      },
      {
        heading: 'Defective Product Exchange',
        headingAr: 'استبدال العيوب المصنعية الفورية',
        content: 'If any product arrives with an out-of-the-box hardware defect, HUB CLOUD arranges an immediate replacement courier at zero shipping fee to the customer.',
        contentAr: 'في حالة استلام أي منتج به عيب مصنعي أولي، تلتزم HUB CLOUD باستبدال الجهاز فوراً بجهاز جديد دون تحميل العميل أي مصاريف شحن.',
      },
      {
        heading: 'Refund Methods',
        headingAr: 'طرق استرداد المبالغ المالية',
        content: 'Refunds are issued using the original payment channel (InstaPay, Vodafone Cash, Bank Transfer, or Cash) within 3-5 business days following technical inspection.',
        contentAr: 'يتم رد المبالغ المالية بنفس وسيلة الدفع التي تمت بها العملية (إنستاباي، فودافون كاش، تحويل بنكي) خلال 3 إلى 5 أيام عمل بعد فحص المنتج والتأكد من سلامته.',
      },
    ],
  },
  shipping: {
    title: 'Nationwide Delivery & Shipping Policy',
    titleAr: 'سياسة الشحن والتوصيل لجميع المحافظات',
    subtitle: 'Fast, secure, and insured courier transit directly to your home or office.',
    subtitleAr: 'شحن سريع ومؤمّن بالكامل ليصلك إلى باب المقر أو المنزل في كافة محافظات مصر.',
    cairoDelivery: 'Same-day or next-day delivery (within 24 hours)',
    cairoDeliveryAr: 'خلال 24 ساعة (نفس اليوم أو اليوم التالي للقاهرة الكبرى والجيزة)',
    governoratesDelivery: '24 to 48 hours to all Egyptian Governorates (Alexandria, Delta, Canal & Upper Egypt)',
    governoratesDeliveryAr: 'خلال 24 إلى 48 ساعة لجميع المحافظات (الإسكندرية، الدلتا، القناة، والصعيد)',
    standardFee: 75,
    freeShippingMin: 5000,
    notes: 'All parcels are dispatched with high-grade tamper-proof security packaging and transit insurance.',
    notesAr: 'يتم تغليف وفحص جميع الشحنات بمواد حماية ضد الصدمات مع إتاحة فحص الشحنة ظاهرياً مع مندوب الشحن قبل الاستلام.',
  },
  faq: {
    title: 'Frequently Asked Questions',
    titleAr: 'الأسئلة الشائعة والأكثر تكراراً',
    subtitle: 'Answers to the most common questions about ordering, hardware warranties, and delivery.',
    subtitleAr: 'إجابات وافية على أهم استفسارات عملائنا حول الطلبات، الضمان، وطرق الدفع والتوصيل.',
    items: [
      {
        id: 'faq-1',
        category: 'Ordering',
        question: 'Are all products displayed on HUB CLOUD genuine?',
        questionAr: 'هل كافة الأجهزة والمنتجات المعروضة في المتجر أصلية؟',
        answer: 'Yes, 100% of our hardware and IT appliances are genuine, sourced directly from authorized vendor distributors with official local warranties.',
        answerAr: 'نعم بكل تأكيد، كافة منتجاتنا أصلية 100% ومستوردة عبر الوكلاء والموزعين الرسميين في مصر مع إيصال استلام رسمي وضمان محلي معتمد.',
      },
      {
        id: 'faq-2',
        category: 'Payment',
        question: 'What payment methods are supported?',
        questionAr: 'ما هي وسائل وطرق الدفع المتاحة في المتجر؟',
        answer: 'We support Cash on Delivery (COD), instant bank transfers via InstaPay, and mobile wallets (Vodafone Cash, Orange, Etisalat, WE).',
        answerAr: 'نوفر الدفع عند الاستلام نقداً (COD)، والتحويل اللحظي عبر شبكة المدفوعات اللحظية إنستاباي (InstaPay)، والمحافظ الإلكترونية (فودافون كاش وغيرها).',
      },
      {
        id: 'faq-3',
        category: 'Delivery',
        question: 'How fast will my order arrive?',
        questionAr: 'كم من الوقت يستغرق توصيل الشحنة؟',
        answer: 'Orders within Cairo and Giza are delivered within 24 hours. Shipments to Alexandria and other governorates arrive within 24 to 48 hours.',
        answerAr: 'يصلك الطلب داخل القاهرة والجيزة خلال 24 ساعة، وخلال 24 إلى 48 ساعة لباقي محافظات الجمهورية.',
      },
      {
        id: 'faq-4',
        category: 'Warranty',
        question: 'How does the hardware warranty work?',
        questionAr: 'كيف يعمل الضمان في حال حدوث أي عطل بالجهاز؟',
        answer: 'Keep your order receipt number. If any issue arises, contact our support team at +20 010 60 777 895 or via WhatsApp for immediate diagnostics and service.',
        answerAr: 'احتفظ برقم إيصال الطلب أو الهاتف المسجل به، وعند حدوث أي عطل يمكنك التواصل فوراً مع الدعم الفني عبر الهاتف أو واتساب (+20 010 60 777 895) لبدء الصيانة فوراً.',
      },
      {
        id: 'faq-5',
        category: 'Bulk Orders',
        question: 'Can I request a custom hardware quotation for my company?',
        questionAr: 'هل يمكنني طلب عرض أسعار مخصص لتجهيز شركة أو معمل؟',
        answer: 'Yes! Our enterprise engineering team offers custom project configuration for servers, networks, and bulk workstations with volume discounts.',
        answerAr: 'نعم بالتأكيد! يمكنك التواصل معنا عبر صفحة اتصل بنا أو مراسلتنا على sales@hubcloud.info وسيقوم مهندس مبيعات الشركات بإعداد عرض سعر فني ومالي متكامل.',
      },
    ],
  },
  contact: {
    address: '181 Al Sudan street - 9th floor - Mohandseen, Giza, Egypt',
    addressAr: '181 شارع السودان - الدور التاسع - المهندسين، الجيزة، جمهورية مصر العربية',
    phone: '+20 010 60 777 895',
    email: 'sales@hubcloud.info',
    workingHours: 'Saturday - Thursday: 9:00 AM - 9:00 PM',
    workingHoursAr: 'السبت - الخميس: 9:00 صباحاً - 9:00 مساءً (الجمعة عطلة أسبوعية)',
  },
};
