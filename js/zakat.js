/**
 * ============================================================================
 * ZAKAT CALCULATOR - PRODUCTION JAVASCRIPT
 * Fully client-side, privacy-first, zero external APIs, zero server dependencies.
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Safe localStorage Wrapper (always in try/catch)
  // --------------------------------------------------------------------------
  const safeStorage = {
    get: function (key, defaultValue = null) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const val = window.localStorage.getItem(key);
          return val !== null ? val : defaultValue;
        }
      } catch (err) {
        console.warn('Storage get failed safely:', err);
      }
      return defaultValue;
    },
    set: function (key, value) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch (err) {
        console.warn('Storage set failed safely:', err);
      }
    },
    remove: function (key) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch (err) {
        console.warn('Storage remove failed safely:', err);
      }
    }
  };

  // --------------------------------------------------------------------------
  // 2. Constants & Unit Conversions
  // --------------------------------------------------------------------------
  const GRAMS_PER_TOLA = 11.664; // 1 tola/vori = 11.664 grams
  const GOLD_NISAB_GRAMS = 87.48; // 7.5 tola * 11.664 = 87.48g
  const GOLD_NISAB_TOLA = 7.5;
  const SILVER_NISAB_GRAMS = 612.36; // 52.5 tola * 11.664 = 612.36g
  const SILVER_NISAB_TOLA = 52.5;

  const ZAKAT_RATE = 0.025; // 2.5%

  const PURITY_FACTORS = {
    '24k': 24 / 24, // 1.0
    '22k': 22 / 24, // 0.916666...
    '21k': 21 / 24, // 0.875
    '18k': 18 / 24  // 0.75
  };

  // --------------------------------------------------------------------------
  // 3. Internationalization (i18n) Translations
  // --------------------------------------------------------------------------
  const i18n = {
    bn: {
      siteTitle: 'যাকাত ক্যালকুলেটর | ইসলামিক সম্পদ ও যাকাত গণক',
      siteSubtitle: 'সহজ, নির্ভুল ও ১০০% গোপনীয় যাকাত ক্যালকুলেটর',
      langToggleText: 'English',
      privacyBanner: '🔒 ১০০% গোপনীয় ও সুরক্ষিত: আপনার কোনো তথ্য ইন্টারনেটে বা সার্ভারে পাঠানো হয় না। সমস্ত হিসাব শুধুমাত্র আপনার ব্রাউজারেই সম্পন্ন হয়।',
      
      // Step Nav
      step1Nav: '১. নিসাব',
      step2Nav: '২. সম্পদ',
      step3Nav: '৩. দায় ও ঋণ',
      step4Nav: '৪. ফলাফল',

      // Step 1: Nisab
      step1Badge: 'ধাপ ১',
      step1Title: 'নিসাব নির্ধারণ ও ধাতুর মূল্য',
      step1Subtitle: 'স্বর্ণ ও রৌপ্যের বর্তমান বাজারদর ও নিসাব পরিমাপের একক নির্বাচন করুন',
      unitLabel: 'পরিমাপের একক:',
      unitGram: 'গ্রাম (Gram)',
      unitTola: 'তোলা / ভরি (Tola - ১১.৬৬৪ গ্রাম)',
      goldPriceLabel: 'স্বর্ণের বর্তমান মূল্য (প্রতি একক):',
      silverPriceLabel: 'রৌপ্যের বর্তমান মূল্য (প্রতি একক):',
      goldWeightLabel: 'স্বর্ণের নিসাব পরিমাণ:',
      silverWeightLabel: 'রৌপ্যের নিসাব পরিমাণ:',
      basisLabel: 'নিসাব গণনার ভিত্তি নির্ধারণ:',
      basisSilver: 'রৌপ্য নিসাব (সুপারিশকৃত)',
      basisSilverDesc: 'অধিকাংশ আলেমদের মতে নগদ টাকা ও মিশ্র সম্পদের ক্ষেত্রে রৌপ্যের নিসাব উত্তম, যাতে দরিদ্ররা সর্বাধিক উপকৃত হন।',
      basisGold: 'স্বর্ণ নিসাব',
      basisGoldDesc: 'শুধুমাত্র স্বর্ণ থাকলে বা বিশেষ মাসয়ালা অনুযায়ী স্বর্ণের নিসাব প্রযোজ্য হয়।',
      nisabResultLabel: 'আপনার নির্ধারিত নিসাবের মূল্যমান:',
      nisabScholarNote: 'পরামর্শ: নিসাব নির্ধারণে ইসলামী ফকীহগণের মধ্যে দ্বিমত রয়েছে। নগদ টাকা ও মিশ্র সম্পদের ক্ষেত্রে রূপার নিসাব অনুসরণ করাই অধিক সতর্কতা ও দরিদ্রবান্ধব। ব্যক্তিগত সুনির্দিষ্ট পরিস্থিতিতে বিজ্ঞ আলেমের পরামর্শ নিন।',
      
      // Presets
      presetTitle: 'নমুনা পরীক্ষা:',
      sample1Btn: 'স্যাম্পল ১ (রৌপ্য নিসাব)',
      sample2Btn: 'স্যাম্পল ২ (যাকাত ফরজ)',
      sample3Btn: 'স্যাম্পল ৩ (নিসাবের নিচে)',
      sample4Btn: 'স্যাম্পল ৪ (১০ তোলা ২২ ক্যারেট)',

      // Step 2: Assets
      step2Badge: 'ধাপ ২',
      step2Title: 'যাকাতযোগ্য সম্পদসমূহ',
      step2Subtitle: 'যেসব সম্পদ আপনার মালিকানায় এক বছর ধরে রয়েছে তার পরিমাণ লিখুন (ঐচ্ছিক)',
      cashLabel: 'হাতে থাকা নগদ টাকা:',
      bankLabel: 'ব্যাংক ব্যালেন্স ও মোবাইল ব্যাংকিং (বিকাশ, নগদ ইত্যাদি):',
      goldAssetTitle: 'স্বর্ণালংকার ও স্বর্ণ সম্পদ:',
      goldWeightInputLabel: 'স্বর্ণের মোট ওজন:',
      goldUnitLabel: 'একক:',
      goldPurityLabel: 'স্বর্ণের ক্যারেট (বিশুদ্ধতা):',
      goldValueCalculated: 'হিসাবকৃত স্বর্ণমূল্য:',
      silverAssetTitle: 'রৌপ্যালংকার ও রূপা সম্পদ:',
      silverWeightInputLabel: 'রূপার মোট ওজন:',
      silverUnitLabel: 'একক:',
      silverValueCalculated: 'হিসাবকৃত রূপামূল্য:',
      businessLabel: 'ব্যবসায়িক পণ্যের বর্তমান বাজারমূল্য:',
      receivablesLabel: 'সহজে আদায়যোগ্য পাওনা টাকা (Good Debts):',
      investmentsLabel: 'শেয়ার, মিউচুয়াল ফান্ড ও ব্যবসায় বিনিয়োগ (যাকাতযোগ্য অংশ):',
      savingsLabel: 'সঞ্চয়পত্র, ডিপিএস বা প্রভিডেন্ট ফান্ড (উত্তোলনযোগ্য অংশ):',
      rentalLabel: 'বাড়ি বা দোকান ভাড়ার জমানো উদ্বৃত্ত ও অন্যান্য সম্পদ:',
      customAssetsTitle: 'অতিরিক্ত নিজস্ব সম্পদ (প্রয়োজনে যোগ করুন):',
      customAssetNamePlaceholder: 'সম্পদের বিবরণ (যেমন: ফিক্সড ডিপোজিট)',
      customAssetAmountPlaceholder: 'টাকার পরিমাণ',
      btnAddAsset: '+ নতুন সম্পদ যোগ করুন',
      totalAssetsLabel: 'মোট যাকাতযোগ্য সম্পদ:',

      // Step 3: Liabilities
      step3Badge: 'ধাপ ৩',
      step3Title: 'বাদযোগ্য ঋণ ও দেনা (Liabilities)',
      step3Subtitle: 'যেসব ঋণ ও পাওনা অবিলম্বে বা চলতি বছরে পরিশোধ করতে হবে',
      debtsImmediateLabel: 'তাৎক্ষণিক বকেয়া বিল ও নিকটবর্তী দেনা:',
      debtsInstallmentsLabel: 'চলতি এক বছরের মধ্যে প্রদেয় ঋণের কিস্তি:',
      debtsBusinessLabel: 'ব্যবসায়িক প্রদেয় দেনা (পাওনাদারদের পাওনা):',
      customLiabilitiesTitle: 'অতিরিক্ত অন্যান্য ঋণ/দেনা:',
      customLiabilityNamePlaceholder: 'দেনার বিবরণ (যেমন: ব্যক্তিগত ধার)',
      customLiabilityAmountPlaceholder: 'টাকার পরিমাণ',
      btnAddLiability: '+ নতুন দেনা যোগ করুন',
      totalLiabilitiesLabel: 'মোট বাদযোগ্য দেনা:',

      // Step 4: Result
      step4Badge: 'ধাপ ৪',
      step4Title: 'চূড়ান্ত যাকাত হিসাব ও বিবরণী',
      step4Subtitle: 'আপনার যাকাতযোগ্য নীট সম্পদ এবং প্রযোজ্য যাকাতের পরিমাণ',
      statusDue: 'যাকাত প্রদান ফরজ হয়েছে',
      statusNotDue: 'নিসাব পূরণ হয়নি, যাকাত আবশ্যক নয়',
      netWealthLabel: 'নীট যাকাতযোগ্য সম্পদ',
      nisabThresholdLabel: 'নিসাব সীমা (থ্রেশহোল্ড)',
      zakatRateText: 'যাকাতের হার: ২.৫% (১/৪০ অংশ)',
      zakatDueLabel: 'প্রদেয় যাকাত:',
      paidZakatLabel: 'চলতি বছর ইতোমধ্যে প্রদত্ত যাকাত (ঐচ্ছিক):',
      remainingZakatLabel: 'বাকি প্রদেয় যাকাত:',
      hawlReminder: 'স্মরণিকা: যাকাত ফরজ হওয়ার জন্য সম্পদ নিসাব পরিমাণ বা তার বেশিতে পৌঁছানোর পর এক পূর্ণ চান্দ্র বছর (হাওল / ৩৫৪ দিন) অতিবাহিত হতে হবে।',
      
      // Step-by-step
      calcExplanationTitle: 'হিসাবের পর্যায়ক্রমিক ব্যাখ্যা:',
      calcStep1: 'মোট যাকাতযোগ্য সম্পদ',
      calcStep2: 'মোট বাদযোগ্য দেনা ও ঋণ',
      calcStep3: 'নীট যাকাতযোগ্য সম্পদ (সম্পদ - দেনা)',
      calcStep4: 'নিসাব মানদণ্ড',
      calcStep5ConditionDue: 'যেহেতু নীট সম্পদ নিসাব সীমার সমান বা বেশি, তাই ২.৫% হারে যাকাত প্রযোজ্য।',
      calcStep5ConditionNotDue: 'যেহেতু নীট সম্পদ নিসাব সীমার নিচে, তাই কোনো যাকাত আবশ্যক নয়।',
      calcStep6Due: 'চূড়ান্ত যাকাত = নীট সম্পদ × ২.৫%',
      calcStep6NotDue: 'প্রদেয় যাকাত = ৳ ০',

      // Breakdown table
      breakdownCategory: 'খাত / উৎস',
      breakdownAmount: 'টাকার পরিমাণ',
      breakdownShare: 'শতকরা অনুপাত',
      itemCash: 'নগদ ও ব্যাংক ব্যালেন্স',
      itemGold: 'স্বর্ণালংকার ও স্বর্ণ',
      itemSilver: 'রৌপ্য সম্পদ',
      itemBusiness: 'ব্যবসায়িক পণ্য ও স্টক',
      itemReceivables: 'আদায়যোগ্য পাওনা টাকা',
      itemInvestments: 'বিনিয়োগ ও শেয়ার',
      itemSavings: 'সঞ্চয়পত্র ও ডিপিএস',
      itemRental: 'ভাড়ার উদ্বৃত্ত ও অন্যান্য',
      itemCustomAssets: 'অতিরিক্ত সম্পদসমূহ',
      itemLiabilities: 'মোট কর্তনযোগ্য ঋণ',
      itemNetWealth: 'নীট যাকাতযোগ্য সম্পদ',

      // Buttons
      btnCopy: 'হিসাব কপি করুন',
      btnPrint: 'প্রিন্ট / পিডিএফ সংরক্ষণ',
      btnReset: 'সব মুছুন (Reset)',
      copiedToast: 'হিসাবের সারসংক্ষেপ ক্লিপবোর্ডে কপি করা হয়েছে!',
      confirmResetTitle: 'আপনি কি নিশ্চিত?',
      confirmResetBody: 'সব ফিল্ডের মান প্রাথমিক অবস্থায় ফিরে যাবে এবং আপনার ইনপুট মুছে যাবে।',
      confirmYes: 'হ্যাঁ, মুছুন',
      confirmCancel: 'বাতিল',

      // Content Sections
      eduTitle: 'যাকাত বিষয়ক প্রয়োজনীয় নির্দেশিকা',
      eduSubtitle: 'পবিত্র কুরআন ও সুন্নাহর আলোকে যাকাতের বিধান ও নিয়মাবলী',
      whatIsZakatTitle: 'যাকাত কী?',
      whatIsZakatText: 'যাকাত ইসলামের অন্যতম মূল স্তম্ভ। নিসাব পরিমাণ সম্পদের অধিকারী প্রত্যেক প্রাপ্তবয়স্ক, সুস্থ মস্তিষ্কের মুসলিমের জন্য প্রতি চান্দ্র বছরান্তে উদ্বৃত্ত সম্পদের ২.৫% (১/৪০ অংশ) নির্ধারিত আটটি খাতে প্রদান করা আল্লাহর পক্ষ থেকে নির্ধারিত বাধ্যতামূলক আর্থিক ইবাদত।',
      whoMustPayTitle: 'কার উপর যাকাত ফরজ?',
      whoMustPayText: '১) মুসলিম হওয়া, ২) প্রাপ্তবয়স্ক ও সুস্থ মস্তিষ্কের অধিকারী হওয়া, ৩) স্বাধীন ব্যক্তি হওয়া, ৪) সম্পদের পূর্ণাঙ্গ মালিকানা থাকা, ৫) সম্পদ নিসাব পরিমাণ বা তার অধিক হওয়া, এবং ৬) নিসাব পরিমাণ সম্পদ এক চান্দ্র বছর (হাওল) পূর্ণ থাকা।',
      howNisabWorksTitle: 'নিসাব কীভাবে নির্ধারিত হয়?',
      howNisabWorksText: 'নিসাব হলো যাকাত ফরজ হওয়ার ন্যূনতম সম্পদের পরিমাণ। হাদিস শরীফ অনুযায়ী স্বর্ণের নিসাব সাড়ে সাত তোলা (৮৭.৪৮ গ্রাম) এবং রূপার নিসাব সাড়ে বায়ান্ন তোলা (৬১২.৩৬ গ্রাম)। নগদ টাকা, ব্যবসা পণ্য বা মিশ্র সম্পদ থাকলে সতর্কতামূলকভাবে রূপার নিসাব মূল্যকে ভিত্তি ধরা হয়।',
      recipientsTitle: 'যাকাতের ৮টি খাত (সূরা আত-তাওবাহ: ৬০)',
      recipientsSubtitle: 'পবিত্র কুরআনে আল্লাহ তাআলা যাকাতের অর্থ ব্যয়ের সুনির্দিষ্ট ৮টি খাত নির্ধারণ করে দিয়েছেন:',
      cat1Title: '১. ফকীর (দরিদ্র)',
      cat1Desc: 'যার কিছু সম্পদ আছে কিন্তু তা দৈনন্দিন জীবন নির্বাহের প্রয়োজনের তুলনায় অপ্রতুল।',
      cat2Title: '২. মিসকীন (অভাবী)',
      cat2Desc: 'যার কোনো সম্পদ নেই এবং কারো কাছে হাত পাততেও পারে না।',
      cat3Title: '৩. আমেলীন (কর্মকর্তা)',
      cat3Desc: 'যাকাত আদায়, হিসাব সংরক্ষণ ও বিতরণের কাজে রাষ্ট্রীয় বা প্রাতিষ্ঠানিকভাবে নিয়োজিত ব্যক্তি।',
      cat4Title: '৪. মুআল্লাফাতুল কুলুব',
      cat4Desc: 'ইসলামের প্রতি আকৃষ্ট করার জন্য বা ইসলামের সুরক্ষায় চিত্তাকর্ষক নবমুসলিমগণ।',
      cat5Title: '৫. দাসমুক্তি (রিকাব)',
      cat5Desc: 'বন্দিদশা বা দাসত্ব থেকে মুক্তির উদ্দেশ্যে অর্থ প্রদান (বর্তমান যুগে বৈধ বন্দি মুক্তি)।',
      cat6Title: '৬. গারেমীন (ঋণগ্রস্ত)',
      cat6Desc: 'যে ব্যক্তি বৈধ প্রয়োজনে ঋণগ্রস্ত এবং ঋণ পরিশোধে সম্পূর্ণ অক্ষম।',
      cat7Title: '৭. ফী সাবিলিল্লাহ',
      cat7Desc: 'আল্লাহর পথে জিহাদ বা ইসলামের প্রচার ও সুরক্ষায় নিয়োজিত নিঃস্ব ব্যক্তিবর্গ।',
      cat8Title: '৮. ইবনে সাবীল (মুসাফির)',
      cat8Desc: 'সফরে থাকা অবস্থায় বিপদে পড়ে নিঃস্ব হয়ে পড়া মুসাফির, নিজ দেশে ধনী হলেও।',

      // FAQs
      faqTitle: 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)',
      faq1Q: 'স্বর্ণ ও রৌপ্য নিসাবের মধ্যে কোনটি নির্বাচন করব?',
      faq1A: 'আপনার কাছে যদি শুধুমাত্র খাঁটি স্বর্ণ থাকে এবং কোনো নগদ টাকা বা ব্যবসায়িক পণ্য না থাকে, তবে স্বর্ণের নিসাব ধরা যায়। কিন্তু যদি নগদ টাকা, স্বর্ণ, রূপা বা ব্যবসায়িক পণ্য মিলিয়ে মিশ্র সম্পদ থাকে, তবে হানাফী ফিকহ সহ সংখ্যাগরিষ্ঠ আলেমদের মতে রূপার নিসাবকে ভিত্তি ধরা উত্তম, কারণ এতে গরীবের হক সর্বাধিক সংরক্ষিত হয়।',
      faq2Q: 'ব্যবহৃত স্বর্ণালংকারের উপর কি যাকাত দিতে হবে?',
      faq2A: 'হানাফী মাযহাব অনুযায়ী মহিলাদের ব্যবহৃত স্বর্ণ ও রৌপ্যের অলংকার নিসাব পরিমাণ হলে এবং এক বছর পূর্ণ হলে তার উপরও যাকাত দেওয়া আবশ্যক। অন্যান্য কিছু মাযহাবে ব্যবহৃত অলংকারকে নিত্যপ্রয়োজনীয় বিবেচনা করে যাকাত থেকে অব্যাহতি দেওয়া হয়েছে। তবে অধিক সতর্কতা হলো যাকাত প্রদান করা।',
      faq3Q: 'দীর্ঘমেয়াদী ঋণের কিস্তি কীভাবে হিসাব করব?',
      faq3A: 'বাড়ি নির্মাণ বা দীর্ঘমেয়াদী ঋণের ক্ষেত্রে পুরো ঋণ একসাথে বিয়োগ করা যাবে না। শুধুমাত্র চলতি এক বছরের মধ্যে যেসব কিস্তি প্রদেয় হবে, সেই পরিমাণ অংশ যাকাত হিসাবের সময় মোট সম্পদ থেকে বাদ দেওয়া যাবে।',
      faq4Q: 'বাড়ি কেনা বা বিয়ের জন্য জমানো টাকার যাকাত দিতে হবে?',
      faq4A: 'হ্যাঁ। টাকা ভবিষ্যতে যে মহৎ কাজের জন্যই জমানো হোক না কেন, তা যদি নিসাব পরিমাণ থাকে এবং এক চান্দ্র বছর পার হয়, তবে তার উপর ২.৫% যাকাত দেওয়া ফরজ। অর্থ খরচ না করা পর্যন্ত তা যাকাতযোগ্য সম্পদ হিসেবে গণ্য হবে।',
      faq5Q: 'যাকাত কখন এবং কীভাবে প্রদান করতে হয়?',
      faq5A: 'সম্পদ নিসাবে পৌঁছার পর প্রতি চান্দ্র বছর পূর্ণ হওয়ার তারিখে যাকাত হিসাব করে তাৎক্ষণিকভাবে হকদারদের মাঝে বিতরণ করা উচিত। কোনো বিলম্ব করা অনুচিত। নগদ টাকা বা খাদ্যসামগ্রী বা পুনর্বাসনের মাধ্যমে যাকাত দেওয়া যায়।',

      disclaimerText: 'সতর্কীকরণ ও ধর্মীয় দায়মুক্তি: এই ক্যালকুলেটরটি কেবল একটি হিসাব সহায়ক প্রযুক্তিগত টুল। এটি কোনো প্রাতিষ্ঠানিক ধর্মীয় ফতোয়া বা রুলিং নয়। জটিল অর্থনৈতিক সম্পদ, কোম্পানির শেয়ারের অভ্যন্তরীণ মূল্য ও পারিবারিক সুনির্দিষ্ট মাসয়ালার জন্য সর্বদা কোনো প্রাজ্ঞ ও বিশ্বস্ত ইসলামী ফকীহের পরামর্শ নিন।',
      invalidInputWarning: 'দয়া করে ধনাত্মক ও সঠিক সংখ্যা লিখুন।'
    },

    en: {
      siteTitle: 'Zakat Calculator | Islamic Wealth & Zakat Assessment',
      siteSubtitle: 'Accurate, Easy & 100% Private Zakat Calculator',
      langToggleText: 'বাংলা',
      privacyBanner: '🔒 100% Private & Secure: None of your data is ever transmitted to any server. All calculations run strictly in your web browser.',
      
      // Step Nav
      step1Nav: '1. Nisab',
      step2Nav: '2. Assets',
      step3Nav: '3. Liabilities',
      step4Nav: '4. Result',

      // Step 1: Nisab
      step1Badge: 'Step 1',
      step1Title: 'Nisab Settings & Metal Prices',
      step1Subtitle: 'Set current gold & silver prices and choose your calculation unit',
      unitLabel: 'Measurement Unit:',
      unitGram: 'Gram (g)',
      unitTola: 'Tola / Vori (1 Tola = 11.664 g)',
      goldPriceLabel: 'Current Gold Price (per unit):',
      silverPriceLabel: 'Current Silver Price (per unit):',
      goldWeightLabel: 'Gold Nisab Weight:',
      silverWeightLabel: 'Silver Nisab Weight:',
      basisLabel: 'Calculate Nisab Standard using:',
      basisSilver: 'Silver Nisab (Recommended)',
      basisSilverDesc: 'Most classical and contemporary scholars advise the silver standard for mixed assets (cash, gold, trade goods) to maximize benefit for the poor.',
      basisGold: 'Gold Nisab',
      basisGoldDesc: 'Applicable if your wealth is exclusively in gold or according to specific scholarly rulings.',
      nisabResultLabel: 'Resulting Nisab Threshold Value:',
      nisabScholarNote: 'Scholarly Note: Scholars differ on the nisab standard. For cash, commercial goods, and mixed wealth, following the silver nisab is generally considered safer and more benevolent towards the needy. Consult a qualified scholar for personal advice.',

      // Presets
      presetTitle: 'Quick Test Samples:',
      sample1Btn: 'Sample 1 (Silver Nisab)',
      sample2Btn: 'Sample 2 (Zakat Due)',
      sample3Btn: 'Sample 3 (Below Nisab)',
      sample4Btn: 'Sample 4 (10 Tola 22k Gold)',

      // Step 2: Assets
      step2Badge: 'Step 2',
      step2Title: 'Zakatable Assets',
      step2Subtitle: 'Enter the value of assets in your ownership held for one lunar year (optional)',
      cashLabel: 'Cash in Hand:',
      bankLabel: 'Bank & Mobile Banking Balances (bKash, Nagad, etc.):',
      goldAssetTitle: 'Gold Assets & Jewelry:',
      goldWeightInputLabel: 'Total Gold Weight:',
      goldUnitLabel: 'Unit:',
      goldPurityLabel: 'Gold Purity (Karat):',
      goldValueCalculated: 'Calculated Gold Value:',
      silverAssetTitle: 'Silver Assets & Jewelry:',
      silverWeightInputLabel: 'Total Silver Weight:',
      silverUnitLabel: 'Unit:',
      silverValueCalculated: 'Calculated Silver Value:',
      businessLabel: 'Business Inventory / Trade Goods (Current Market Value):',
      receivablesLabel: 'Money Owed to You (Good Debts expected to receive):',
      investmentsLabel: 'Shares, Mutual Funds & Investments (Zakatable portion):',
      savingsLabel: 'Savings Schemes, DPS, Provident Fund (Accessible portion):',
      rentalLabel: 'Rental Income Saved & Other Zakatable Assets:',
      customAssetsTitle: 'Additional Custom Assets (Optional):',
      customAssetNamePlaceholder: 'Asset description (e.g. Fixed Deposit)',
      customAssetAmountPlaceholder: 'Amount',
      btnAddAsset: '+ Add Custom Asset',
      totalAssetsLabel: 'Total Zakatable Assets:',

      // Step 3: Liabilities
      step3Badge: 'Step 3',
      step3Title: 'Deductible Liabilities & Debts',
      step3Subtitle: 'Debts and obligations due immediately or within the current lunar year',
      debtsImmediateLabel: 'Debts Due Immediately & Unpaid Bills:',
      debtsInstallmentsLabel: 'Loan Installments Due within the Lunar Year:',
      debtsBusinessLabel: 'Business Payables / Supplier Dues:',
      customLiabilitiesTitle: 'Additional Custom Liabilities:',
      customLiabilityNamePlaceholder: 'Debt description (e.g. Personal loan)',
      customLiabilityAmountPlaceholder: 'Amount',
      btnAddLiability: '+ Add Custom Liability',
      totalLiabilitiesLabel: 'Total Deductible Liabilities:',

      // Step 4: Result
      step4Badge: 'Step 4',
      step4Title: 'Final Assessment & Statement',
      step4Subtitle: 'Comprehensive summary of net zakatable wealth and payment obligation',
      statusDue: 'Zakat is Obligatory (Due)',
      statusNotDue: 'Below Nisab (Zakat Not Obligatory)',
      netWealthLabel: 'Net Zakatable Wealth',
      nisabThresholdLabel: 'Nisab Threshold Value',
      zakatRateText: 'Zakat Rate: 2.5% (1/40th)',
      zakatDueLabel: 'Zakat Due:',
      paidZakatLabel: 'Zakat Paid so Far this Year (Optional):',
      remainingZakatLabel: 'Remaining Zakat Due:',
      hawlReminder: 'Gentle Reminder: For zakat to become obligatory, your net wealth must equal or exceed the nisab threshold and remain so for one complete lunar year (hawl / ~354 days).',

      // Step-by-step
      calcExplanationTitle: 'Step-by-Step Calculation Breakdown:',
      calcStep1: 'Total Zakatable Assets',
      calcStep2: 'Total Deductible Liabilities',
      calcStep3: 'Net Zakatable Wealth (Assets - Liabilities)',
      calcStep4: 'Nisab Threshold Standard',
      calcStep5ConditionDue: 'Since Net Wealth exceeds the Nisab threshold, Zakat is obligatory at 2.5%.',
      calcStep5ConditionNotDue: 'Since Net Wealth is below the Nisab threshold, no Zakat is obligatory.',
      calcStep6Due: 'Final Zakat Obligation = Net Wealth × 2.5%',
      calcStep6NotDue: 'Total Zakat Due = ৳ 0',

      // Breakdown table
      breakdownCategory: 'Asset / Liability Category',
      breakdownAmount: 'Amount',
      breakdownShare: 'Share of Total',
      itemCash: 'Cash & Bank Balances',
      itemGold: 'Gold Assets',
      itemSilver: 'Silver Assets',
      itemBusiness: 'Business Inventory',
      itemReceivables: 'Money Owed to You',
      itemInvestments: 'Investments & Shares',
      itemSavings: 'Savings Schemes & DPS',
      itemRental: 'Rental Savings & Other',
      itemCustomAssets: 'Custom Assets',
      itemLiabilities: 'Deductible Liabilities',
      itemNetWealth: 'Net Zakatable Wealth',

      // Buttons
      btnCopy: 'Copy Calculation',
      btnPrint: 'Print / Save PDF',
      btnReset: 'Reset All',
      copiedToast: 'Calculation summary copied to clipboard!',
      confirmResetTitle: 'Reset Calculator?',
      confirmResetBody: 'This will reset all values to their default states and clear your input.',
      confirmYes: 'Yes, Reset',
      confirmCancel: 'Cancel',

      // Content Sections
      eduTitle: 'Essential Guide to Zakat in Islam',
      eduSubtitle: 'Fundamental principles according to the Holy Quran and authentic Sunnah',
      whatIsZakatTitle: 'What is Zakat?',
      whatIsZakatText: 'Zakat is the third pillar of Islam. It is a mandatory religious obligation for every adult, sane Muslim whose wealth reaches or exceeds the threshold of Nisab for one complete lunar year to pay 2.5% (one fortieth) of their surplus wealth to eight designated recipient categories.',
      whoMustPayTitle: 'Who Must Pay Zakat?',
      whoMustPayText: '1) Being Muslim, 2) Being of sound mind and adult (pubescent), 3) Free person, 4) Complete and unencumbered ownership of wealth, 5) Wealth equal to or exceeding the Nisab threshold, and 6) Wealth held for one full lunar year (hawl).',
      howNisabWorksTitle: 'How Nisab Works',
      howNisabWorksText: 'Nisab is the minimum threshold of net wealth that obligates a Muslim to pay zakat. Prophetic tradition specifies 7.5 tola (87.48 grams) of gold or 52.5 tola (612.36 grams) of silver. For currency, trade goods, or mixed assets, the silver threshold is conventionally utilized by most scholars to best support the poor.',
      recipientsTitle: 'The 8 Categories of Recipients (Surah At-Tawbah: 60)',
      recipientsSubtitle: 'The Quran explicitly specifies eight categories eligible to receive zakat:',
      cat1Title: '1. Al-Fuqara (The Poor)',
      cat1Desc: 'Those with minimal income or assets that do not meet their essential daily subsistence.',
      cat2Title: '2. Al-Masakin (The Destitute)',
      cat2Desc: 'Those with zero means of livelihood who are completely without basic provisions.',
      cat3Title: '3. Al-Amilina Alayha (Zakat Administrators)',
      cat3Desc: 'Workers officially tasked with collecting, auditing, and distributing zakat.',
      cat4Title: '4. Muallafat al-Qulub (Reconciliation of Hearts)',
      cat4Desc: 'New Muslims or those whose inclination towards Islam is fostered.',
      cat5Title: '5. Fir-Riqab (Freeing Captives)',
      cat5Desc: 'Historically freeing slaves; contemporarily assisting unjust captives or bonded laborers.',
      cat6Title: '6. Al-Gharimin (Debtors)',
      cat6Desc: 'Individuals burdened by unmanageable debt incurred for basic halal necessities.',
      cat7Title: '7. Fi Sabilillah (In the Cause of Allah)',
      cat7Desc: 'Those striving in defense of faith, humanitarian relief, and righteous public welfare.',
      cat8Title: '8. Ibn al-Sabil (The Wayfarer)',
      cat8Desc: 'Travelers stranded without funds, even if they possess wealth back in their home country.',

      // FAQs
      faqTitle: 'Frequently Asked Questions (FAQ)',
      faq1Q: 'Which Nisab should I calculate with: Gold or Silver?',
      faq1A: 'If your wealth consists solely of pure gold with no cash or other trade assets, the gold standard can be applied. However, if you possess mixed wealth (cash, gold, silver, business inventory), the vast majority of scholars recommend using the silver nisab because it sets a lower threshold, ensuring the needy receive crucial support.',
      faq2Q: 'Is Zakat due on personal jewelry worn by women?',
      faq2A: 'According to the Hanafi school of jurisprudence, zakat is due on all gold and silver jewelry above the nisab, regardless of whether it is worn or stored. Other schools exempt personal jewelry within customary limits. Paying zakat on it remains the safer and widely praised practice.',
      faq3Q: 'How do I deduct long-term home or car loans?',
      faq3A: 'You cannot deduct the entire multi-year principal balance of a loan at once. Only the specific installments due within the immediate 12 lunar months may be subtracted from your current zakatable assets.',
      faq4Q: 'Do I pay zakat on money saved for marriage, Hajj, or buying a home?',
      faq4A: 'Yes. Regardless of the intended future noble purpose, as long as the funds remain in your possession and exceed the nisab for one lunar year, zakat of 2.5% must be paid until the funds are actually spent.',
      faq5Q: 'When and how should Zakat be distributed?',
      faq5A: 'Once your wealth has reached nisab and completed one lunar year (hawl), zakat is due immediately. It should not be delayed without valid necessity. It can be distributed as direct cash, food, or sustainable rehabilitation for eligible recipients.',

      disclaimerText: 'Disclaimer & Scholarly Guidance: This calculator serves as an informational and computational tool. It does not constitute a formal Islamic legal ruling (fatwa). For complex financial instruments, partnership equities, and specialized circumstances, please consult a qualified and reputable Islamic scholar.',
      invalidInputWarning: 'Please enter a valid non-negative number.'
    }
  };

  // --------------------------------------------------------------------------
  // 4. Number Formatting Helpers
  // --------------------------------------------------------------------------
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

  function toBanglaDigits(str) {
    return String(str).replace(/[0-9]/g, function (d) {
      return bnDigits[parseInt(d, 10)];
    });
  }

  function formatCommas(num) {
    if (isNaN(num) || num === null) return '0';
    const rounded = Number(num).toFixed(2);
    const parts = rounded.split('.');
    // Add commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // If decimals are .00, omit them for cleaner currency display
    if (parts[1] === '00') {
      return parts[0];
    }
    // Remove trailing zero if e.g. .50 -> .5
    const trimmedDec = parts[1].replace(/0+$/, '');
    return trimmedDec.length > 0 ? parts[0] + '.' + trimmedDec : parts[0];
  }

  function formatCurrency(amount, lang) {
    const formatted = formatCommas(amount);
    if (lang === 'bn') {
      return '৳ ' + toBanglaDigits(formatted);
    }
    return '৳ ' + formatted;
  }

  function formatNumber(num, lang) {
    const formatted = formatCommas(num);
    return lang === 'bn' ? toBanglaDigits(formatted) : formatted;
  }

  function sanitizePositiveNumber(val) {
    if (val === undefined || val === null || val === '') return 0;
    const n = parseFloat(String(val).replace(/,/g, '').trim());
    if (isNaN(n) || n < 0) return 0;
    return n;
  }

  // --------------------------------------------------------------------------
  // 5. State Management
  // --------------------------------------------------------------------------
  const state = {
    lang: safeStorage.get('zakat_lang', 'bn'),
    theme: safeStorage.get('zakat_theme', window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    
    // Nisab settings
    nisabUnit: 'gram', // 'gram' or 'tola'
    nisabBasis: 'silver', // 'silver' or 'gold'
    goldPrice: 11500, // default BDT per gram (~134,136 BDT per tola)
    silverPrice: 100, // default BDT per gram (Sample 1 requirement: 100 BDT/g)
    goldNisabWeight: GOLD_NISAB_GRAMS,
    silverNisabWeight: SILVER_NISAB_GRAMS,

    // Assets
    cash: 0,
    bank: 0,
    goldWeight: 0,
    goldUnit: 'tola', // default tola for jewelry in Bangladesh
    goldPurity: '22k', // default 22k
    silverWeight: 0,
    silverUnit: 'tola',
    business: 0,
    receivables: 0,
    investments: 0,
    savings: 0,
    rental: 0,
    customAssets: [], // { id, name, amount }

    // Liabilities
    debtsImmediate: 0,
    debtsInstallments: 0,
    debtsBusiness: 0,
    customLiabilities: [], // { id, name, amount }

    // Paid zakat
    zakatPaid: 0
  };

  // --------------------------------------------------------------------------
  // 6. Core Mathematical Calculations
  // --------------------------------------------------------------------------
  function getEffectivePricePerGram(metal) {
    if (metal === 'gold') {
      return state.nisabUnit === 'gram'
        ? state.goldPrice
        : state.goldPrice / GRAMS_PER_TOLA;
    }
    // Silver
    return state.nisabUnit === 'gram'
      ? state.silverPrice
      : state.silverPrice / GRAMS_PER_TOLA;
  }

  function calculateNisabThreshold() {
    if (state.nisabBasis === 'gold') {
      return state.goldNisabWeight * state.goldPrice;
    }
    // Silver basis (default)
    return state.silverNisabWeight * state.silverPrice;
  }

  function calculateGoldAssetValue() {
    if (state.goldWeight <= 0) return 0;
    const pricePerGram = getEffectivePricePerGram('gold');
    const weightInGrams = state.goldUnit === 'tola'
      ? state.goldWeight * GRAMS_PER_TOLA
      : state.goldWeight;
    const purity = PURITY_FACTORS[state.goldPurity] || 1;
    return weightInGrams * pricePerGram * purity;
  }

  function calculateSilverAssetValue() {
    if (state.silverWeight <= 0) return 0;
    const pricePerGram = getEffectivePricePerGram('silver');
    const weightInGrams = state.silverUnit === 'tola'
      ? state.silverWeight * GRAMS_PER_TOLA
      : state.silverWeight;
    return weightInGrams * pricePerGram;
  }

  function calculateTotalAssets() {
    let total = 0;
    total += state.cash;
    total += state.bank;
    total += calculateGoldAssetValue();
    total += calculateSilverAssetValue();
    total += state.business;
    total += state.receivables;
    total += state.investments;
    total += state.savings;
    total += state.rental;

    state.customAssets.forEach(function (item) {
      total += sanitizePositiveNumber(item.amount);
    });

    return total;
  }

  function calculateTotalLiabilities() {
    let total = 0;
    total += state.debtsImmediate;
    total += state.debtsInstallments;
    total += state.debtsBusiness;

    state.customLiabilities.forEach(function (item) {
      total += sanitizePositiveNumber(item.amount);
    });

    return total;
  }

  function performFullCalculation() {
    const nisabValue = calculateNisabThreshold();
    const totalAssets = calculateTotalAssets();
    const totalLiabilities = calculateTotalLiabilities();
    const netWealth = Math.max(0, totalAssets - totalLiabilities);

    const isDue = netWealth >= nisabValue && nisabValue > 0;
    const zakatDue = isDue ? netWealth * ZAKAT_RATE : 0;
    const remainingZakat = Math.max(0, zakatDue - state.zakatPaid);

    return {
      nisabValue: nisabValue,
      totalAssets: totalAssets,
      totalLiabilities: totalLiabilities,
      netWealth: netWealth,
      isDue: isDue,
      zakatRate: ZAKAT_RATE,
      zakatDue: zakatDue,
      zakatPaid: state.zakatPaid,
      remainingZakat: remainingZakat,
      goldValue: calculateGoldAssetValue(),
      silverValue: calculateSilverAssetValue()
    };
  }

  // --------------------------------------------------------------------------
  // 7. UI Rendering & Synchronization
  // --------------------------------------------------------------------------
  function applyLanguage(lang) {
    state.lang = lang;
    safeStorage.set('zakat_lang', lang);
    document.documentElement.lang = lang;

    const t = i18n[lang];

    // Document metadata
    document.title = t.siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', t.siteSubtitle);

    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) {
        el.textContent = t[key];
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      const key = el.getAttribute('data-i18n-placeholder');
      if (t[key] !== undefined) {
        el.setAttribute('placeholder', t[key]);
      }
    });

    // Update language toggle text
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
      langBtn.innerHTML = (lang === 'bn' ? '🌐 English' : '🌐 বাংলা');
    }

    renderAll();
  }

  function applyTheme(theme) {
    state.theme = theme;
    safeStorage.set('zakat_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? '☀️ <span class="sr-only">Light</span>' : '🌙 <span class="sr-only">Dark</span>';
    }
  }

  function renderAll() {
    const calc = performFullCalculation();
    const t = i18n[state.lang];

    // 1. Nisab value banner
    const nisabAmountEl = document.getElementById('nisabCalculatedAmount');
    if (nisabAmountEl) {
      nisabAmountEl.textContent = formatCurrency(calc.nisabValue, state.lang);
    }

    // 2. Gold & Silver calculated value sub-badges
    const goldValBadge = document.getElementById('goldCalculatedValueBadge');
    if (goldValBadge) {
      goldValBadge.textContent = t.goldValueCalculated + ' ' + formatCurrency(calc.goldValue, state.lang);
    }
    const silverValBadge = document.getElementById('silverCalculatedValueBadge');
    if (silverValBadge) {
      silverValBadge.textContent = t.silverValueCalculated + ' ' + formatCurrency(calc.silverValue, state.lang);
    }

    // 3. Subtotals
    const totalAssetsBadge = document.getElementById('totalAssetsBadge');
    if (totalAssetsBadge) {
      totalAssetsBadge.textContent = formatCurrency(calc.totalAssets, state.lang);
    }
    const totalLiabilitiesBadge = document.getElementById('totalLiabilitiesBadge');
    if (totalLiabilitiesBadge) {
      totalLiabilitiesBadge.textContent = formatCurrency(calc.totalLiabilities, state.lang);
    }

    // 4. Hero Result & Status
    const resultHero = document.getElementById('resultHero');
    const resultStatusPill = document.getElementById('resultStatusPill');
    const resultZakatAmount = document.getElementById('resultZakatAmount');
    const statNetWealth = document.getElementById('statNetWealth');
    const statNisab = document.getElementById('statNisab');
    const statZakatDue = document.getElementById('statZakatDue');
    const statRemainingDue = document.getElementById('statRemainingDue');

    if (resultHero && resultStatusPill && resultZakatAmount) {
      if (calc.isDue) {
        resultHero.className = 'result-hero due';
        resultStatusPill.textContent = '✓ ' + t.statusDue;
        resultZakatAmount.textContent = formatCurrency(calc.zakatDue, state.lang);
      } else {
        resultHero.className = 'result-hero not-due';
        resultStatusPill.textContent = 'ℹ ' + t.statusNotDue;
        resultZakatAmount.textContent = formatCurrency(0, state.lang);
      }
    }

    if (statNetWealth) statNetWealth.textContent = formatCurrency(calc.netWealth, state.lang);
    if (statNisab) statNisab.textContent = formatCurrency(calc.nisabValue, state.lang);
    if (statZakatDue) statZakatDue.textContent = formatCurrency(calc.zakatDue, state.lang);
    if (statRemainingDue) statRemainingDue.textContent = formatCurrency(calc.remainingZakat, state.lang);

    // 5. Step-by-Step Explanation
    renderStepByStep(calc, t);

    // 6. Breakdown Table
    renderBreakdownTable(calc, t);

    // 7. Update Print Header Summary
    const printDate = document.getElementById('printDate');
    if (printDate) {
      const now = new Date();
      printDate.textContent = now.toLocaleDateString(state.lang === 'bn' ? 'bn-BD' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  function renderStepByStep(calc, t) {
    const listEl = document.getElementById('calcStepList');
    if (!listEl) return;

    const basisName = state.nisabBasis === 'gold' ? t.basisGold : t.basisSilver;
    const condText = calc.isDue ? t.calcStep5ConditionDue : t.calcStep5ConditionNotDue;
    const finalCalcText = calc.isDue
      ? t.calcStep6Due + ' (' + formatCurrency(calc.netWealth, state.lang) + ' × 0.025 = ' + formatCurrency(calc.zakatDue, state.lang) + ')'
      : t.calcStep6NotDue;

    listEl.innerHTML = `
      <div class="calc-step-item">
        <span class="calc-step-icon">1</span>
        <div><strong>${t.calcStep1}:</strong> ${formatCurrency(calc.totalAssets, state.lang)}</div>
      </div>
      <div class="calc-step-item">
        <span class="calc-step-icon">2</span>
        <div><strong>${t.calcStep2}:</strong> ${formatCurrency(calc.totalLiabilities, state.lang)}</div>
      </div>
      <div class="calc-step-item">
        <span class="calc-step-icon">3</span>
        <div><strong>${t.calcStep3}:</strong> ${formatCurrency(calc.netWealth, state.lang)}</div>
      </div>
      <div class="calc-step-item">
        <span class="calc-step-icon">4</span>
        <div><strong>${t.calcStep4} (${basisName}):</strong> ${formatCurrency(calc.nisabValue, state.lang)}</div>
      </div>
      <div class="calc-step-item">
        <span class="calc-step-icon">5</span>
        <div>${condText}</div>
      </div>
      <div class="calc-step-item">
        <span class="calc-step-icon">6</span>
        <div><strong>${finalCalcText}</strong></div>
      </div>
    `;
  }

  function renderBreakdownTable(calc, t) {
    const tbody = document.getElementById('breakdownTableBody');
    if (!tbody) return;

    let customAssetsTotal = 0;
    state.customAssets.forEach(function (item) {
      customAssetsTotal += sanitizePositiveNumber(item.amount);
    });

    const items = [
      { name: t.itemCash, amount: state.cash + state.bank },
      { name: t.itemGold, amount: calc.goldValue },
      { name: t.itemSilver, amount: calc.silverValue },
      { name: t.itemBusiness, amount: state.business },
      { name: t.itemReceivables, amount: state.receivables },
      { name: t.itemInvestments, amount: state.investments },
      { name: t.itemSavings, amount: state.savings },
      { name: t.itemRental, amount: state.rental },
      { name: t.itemCustomAssets, amount: customAssetsTotal }
    ];

    let html = '';
    const totalAssets = calc.totalAssets > 0 ? calc.totalAssets : 1;

    items.forEach(function (row) {
      if (row.amount > 0) {
        const share = ((row.amount / totalAssets) * 100).toFixed(1);
        const shareDisplay = state.lang === 'bn' ? toBanglaDigits(share) + '%' : share + '%';
        html += `
          <tr>
            <td>${row.name}</td>
            <td>${formatCurrency(row.amount, state.lang)}</td>
            <td>${shareDisplay}</td>
          </tr>
        `;
      }
    });

    // If no assets
    if (calc.totalAssets === 0) {
      html += `<tr><td colspan="3" style="text-align: center; color: var(--text-muted);">${state.lang === 'bn' ? 'কোনো সম্পদ অন্তর্ভুক্ত করা হয়নি' : 'No assets entered yet'}</td></tr>`;
    }

    // Liabilities row
    if (calc.totalLiabilities > 0) {
      html += `
        <tr style="color: var(--color-danger-text);">
          <td><strong>- ${t.itemLiabilities}</strong></td>
          <td><strong>- ${formatCurrency(calc.totalLiabilities, state.lang)}</strong></td>
          <td>—</td>
        </tr>
      `;
    }

    // Net Wealth row
    html += `
      <tr class="total-row">
        <td><strong>${t.itemNetWealth}</strong></td>
        <td><strong>${formatCurrency(calc.netWealth, state.lang)}</strong></td>
        <td>100%</td>
      </tr>
    `;

    tbody.innerHTML = html;
  }

  // --------------------------------------------------------------------------
  // 8. Custom Asset and Liability Dynamic Rows
  // --------------------------------------------------------------------------
  function renderCustomAssetsList() {
    const container = document.getElementById('customAssetsContainer');
    if (!container) return;
    const t = i18n[state.lang];

    container.innerHTML = '';
    state.customAssets.forEach(function (item, index) {
      const row = document.createElement('div');
      row.className = 'custom-row';
      row.innerHTML = `
        <input type="text" class="form-control" placeholder="${t.customAssetNamePlaceholder}" value="${escapeHtml(item.name)}" data-asset-name="${item.id}">
        <div class="input-group">
          <span class="input-prefix">৳</span>
          <input type="number" min="0" step="any" class="form-control" placeholder="${t.customAssetAmountPlaceholder}" value="${item.amount > 0 ? item.amount : ''}" data-asset-amount="${item.id}">
        </div>
        <button type="button" class="btn-remove" title="Remove" data-remove-asset="${item.id}">✕</button>
      `;
      container.appendChild(row);
    });
  }

  function renderCustomLiabilitiesList() {
    const container = document.getElementById('customLiabilitiesContainer');
    if (!container) return;
    const t = i18n[state.lang];

    container.innerHTML = '';
    state.customLiabilities.forEach(function (item, index) {
      const row = document.createElement('div');
      row.className = 'custom-row';
      row.innerHTML = `
        <input type="text" class="form-control" placeholder="${t.customLiabilityNamePlaceholder}" value="${escapeHtml(item.name)}" data-liability-name="${item.id}">
        <div class="input-group">
          <span class="input-prefix">৳</span>
          <input type="number" min="0" step="any" class="form-control" placeholder="${t.customLiabilityAmountPlaceholder}" value="${item.amount > 0 ? item.amount : ''}" data-liability-amount="${item.id}">
        </div>
        <button type="button" class="btn-remove" title="Remove" data-remove-liability="${item.id}">✕</button>
      `;
      container.appendChild(row);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --------------------------------------------------------------------------
  // 9. Toast Notification & Modal
  // --------------------------------------------------------------------------
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<span>✓</span> ' + message;
    container.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3200);
  }

  function openResetModal() {
    const modal = document.getElementById('resetModal');
    if (modal) modal.classList.add('open');
  }

  function closeResetModal() {
    const modal = document.getElementById('resetModal');
    if (modal) modal.classList.remove('open');
  }

  // --------------------------------------------------------------------------
  // 10. Sample Test Presets
  // --------------------------------------------------------------------------
  function loadPreset(sampleNum) {
    switch (sampleNum) {
      case 1:
        // Test 1: Silver nisab 612.36 g at 100 BDT/g gives nisab 61,236 BDT.
        state.nisabUnit = 'gram';
        state.nisabBasis = 'silver';
        state.silverPrice = 100;
        state.silverNisabWeight = SILVER_NISAB_GRAMS;
        state.goldPrice = 11500;
        state.goldNisabWeight = GOLD_NISAB_GRAMS;
        // Reset assets for clear test
        state.cash = 0;
        state.bank = 0;
        state.goldWeight = 0;
        state.silverWeight = 0;
        state.business = 0;
        state.receivables = 0;
        state.investments = 0;
        state.savings = 0;
        state.rental = 0;
        state.debtsImmediate = 0;
        state.debtsInstallments = 0;
        state.debtsBusiness = 0;
        state.zakatPaid = 0;
        state.customAssets = [];
        state.customLiabilities = [];
        syncInputsFromState();
        showToast(state.lang === 'bn' ? 'টেস্ট স্যাম্পল ১ লোড হয়েছে (নিসাব ৬১,২৩৬ ৳)' : 'Test Sample 1 loaded (Nisab ৳ 61,236)');
        break;

      case 2:
        // Test 2: Assets 400,000, liabilities 50,000, net 350,000, nisab 61,236 gives zakat 8,750
        state.nisabUnit = 'gram';
        state.nisabBasis = 'silver';
        state.silverPrice = 100;
        state.silverNisabWeight = SILVER_NISAB_GRAMS;
        state.cash = 400000;
        state.bank = 0;
        state.goldWeight = 0;
        state.silverWeight = 0;
        state.business = 0;
        state.receivables = 0;
        state.investments = 0;
        state.savings = 0;
        state.rental = 0;
        state.debtsImmediate = 50000;
        state.debtsInstallments = 0;
        state.debtsBusiness = 0;
        state.zakatPaid = 0;
        state.customAssets = [];
        state.customLiabilities = [];
        syncInputsFromState();
        showToast(state.lang === 'bn' ? 'টেস্ট স্যাম্পল ২ লোড হয়েছে (যাকাত ৮,৭৫০ ৳)' : 'Test Sample 2 loaded (Zakat ৳ 8,750)');
        break;

      case 3:
        // Test 3: Net wealth below nisab shows "not obligatory" with zakat 0
        state.nisabUnit = 'gram';
        state.nisabBasis = 'silver';
        state.silverPrice = 100;
        state.silverNisabWeight = SILVER_NISAB_GRAMS;
        state.cash = 45000;
        state.bank = 0;
        state.goldWeight = 0;
        state.silverWeight = 0;
        state.business = 0;
        state.receivables = 0;
        state.investments = 0;
        state.savings = 0;
        state.rental = 0;
        state.debtsImmediate = 10000;
        state.debtsInstallments = 0;
        state.debtsBusiness = 0;
        state.zakatPaid = 0;
        state.customAssets = [];
        state.customLiabilities = [];
        syncInputsFromState();
        showToast(state.lang === 'bn' ? 'টেস্ট স্যাম্পল ৩ লোড হয়েছে (নিসাবের নিচে, যাকাত ০ ৳)' : 'Test Sample 3 loaded (Below Nisab, Zakat ৳ 0)');
        break;

      case 4:
        // Test 4: 10 tola 22k gold at user price valued using 22/24 purity
        // Example: gold price = 120,000 BDT/tola (or ~10,288.06 BDT/g)
        // 10 tola * 120,000 * (22/24) = 1,100,000 BDT
        state.nisabUnit = 'tola';
        state.nisabBasis = 'silver';
        state.goldPrice = 120000;
        state.goldNisabWeight = GOLD_NISAB_TOLA;
        state.silverPrice = 1500;
        state.silverNisabWeight = SILVER_NISAB_TOLA;
        state.cash = 0;
        state.bank = 0;
        state.goldWeight = 10;
        state.goldUnit = 'tola';
        state.goldPurity = '22k';
        state.silverWeight = 0;
        state.business = 0;
        state.receivables = 0;
        state.investments = 0;
        state.savings = 0;
        state.rental = 0;
        state.debtsImmediate = 0;
        state.debtsInstallments = 0;
        state.debtsBusiness = 0;
        state.zakatPaid = 0;
        state.customAssets = [];
        state.customLiabilities = [];
        syncInputsFromState();
        showToast(state.lang === 'bn' ? 'টেস্ট স্যাম্পল ৪ লোড হয়েছে (১০ তোলা ২২k স্বর্ণ)' : 'Test Sample 4 loaded (10 Tola 22k Gold)');
        break;
    }
  }

  function syncInputsFromState() {
    // Nisab inputs
    const unitSelect = document.getElementById('nisabUnitSelect');
    if (unitSelect) unitSelect.value = state.nisabUnit;
    updateNisabUnitLabels();

    const goldPriceInput = document.getElementById('goldPriceInput');
    if (goldPriceInput) goldPriceInput.value = state.goldPrice;

    const silverPriceInput = document.getElementById('silverPriceInput');
    if (silverPriceInput) silverPriceInput.value = state.silverPrice;

    const goldNisabWeightInput = document.getElementById('goldNisabWeightInput');
    if (goldNisabWeightInput) goldNisabWeightInput.value = state.goldNisabWeight;

    const silverNisabWeightInput = document.getElementById('silverNisabWeightInput');
    if (silverNisabWeightInput) silverNisabWeightInput.value = state.silverNisabWeight;

    // Basis radio
    const radioSilver = document.getElementById('nisabBasisSilver');
    const radioGold = document.getElementById('nisabBasisGold');
    if (radioSilver && radioGold) {
      radioSilver.checked = state.nisabBasis === 'silver';
      radioGold.checked = state.nisabBasis === 'gold';
      updateBasisCardStyles();
    }

    // Assets inputs
    setInputValue('cashInput', state.cash);
    setInputValue('bankInput', state.bank);
    setInputValue('goldWeightInput', state.goldWeight);
    setSelectValue('goldUnitSelect', state.goldUnit);
    setSelectValue('goldPuritySelect', state.goldPurity);
    setInputValue('silverWeightInput', state.silverWeight);
    setSelectValue('silverUnitSelect', state.silverUnit);
    setInputValue('businessInput', state.business);
    setInputValue('receivablesInput', state.receivables);
    setInputValue('investmentsInput', state.investments);
    setInputValue('savingsInput', state.savings);
    setInputValue('rentalInput', state.rental);

    // Liabilities inputs
    setInputValue('debtsImmediateInput', state.debtsImmediate);
    setInputValue('debtsInstallmentsInput', state.debtsInstallments);
    setInputValue('debtsBusinessInput', state.debtsBusiness);
    setInputValue('zakatPaidInput', state.zakatPaid);

    renderCustomAssetsList();
    renderCustomLiabilitiesList();
    renderAll();
  }

  function setInputValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val > 0 ? val : '';
  }

  function setSelectValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  function updateBasisCardStyles() {
    const cardSilver = document.getElementById('nisabChoiceSilver');
    const cardGold = document.getElementById('nisabChoiceGold');
    if (cardSilver && cardGold) {
      if (state.nisabBasis === 'silver') {
        cardSilver.classList.add('selected');
        cardGold.classList.remove('selected');
      } else {
        cardGold.classList.add('selected');
        cardSilver.classList.remove('selected');
      }
    }
  }

  function updateNisabUnitLabels() {
    const isGram = state.nisabUnit === 'gram';
    const unitSuffix = isGram ? (state.lang === 'bn' ? 'গ্রাম' : 'g') : (state.lang === 'bn' ? 'তোলা' : 'tola');
    
    document.querySelectorAll('.nisab-unit-display').forEach(function (el) {
      el.textContent = unitSuffix;
    });
  }

  function handleUnitSwitch(newUnit) {
    if (newUnit === state.nisabUnit) return;

    if (newUnit === 'tola') {
      // Switched from gram to tola
      state.nisabUnit = 'tola';
      state.goldPrice = Math.round(state.goldPrice * GRAMS_PER_TOLA);
      state.silverPrice = Math.round(state.silverPrice * GRAMS_PER_TOLA);
      state.goldNisabWeight = GOLD_NISAB_TOLA;
      state.silverNisabWeight = SILVER_NISAB_TOLA;
    } else {
      // Switched from tola to gram
      state.nisabUnit = 'gram';
      state.goldPrice = Math.round(state.goldPrice / GRAMS_PER_TOLA);
      state.silverPrice = Math.round(state.silverPrice / GRAMS_PER_TOLA);
      state.goldNisabWeight = GOLD_NISAB_GRAMS;
      state.silverNisabWeight = SILVER_NISAB_GRAMS;
    }

    syncInputsFromState();
  }

  // --------------------------------------------------------------------------
  // 11. Copy to Clipboard
  // --------------------------------------------------------------------------
  function copySummaryToClipboard() {
    const calc = performFullCalculation();
    const t = i18n[state.lang];
    const isBn = state.lang === 'bn';

    const text = [
      '========================================',
      isBn ? 'যাকাত হিসাব বিবরণী' : 'Zakat Calculation Summary',
      '========================================',
      (isBn ? 'তারিখ: ' : 'Date: ') + new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US'),
      (isBn ? 'নিসাব মানদণ্ড: ' : 'Nisab Standard: ') + (state.nisabBasis === 'gold' ? t.basisGold : t.basisSilver),
      (isBn ? 'নিসাব সীমা: ' : 'Nisab Threshold: ') + formatCurrency(calc.nisabValue, state.lang),
      '----------------------------------------',
      (isBn ? 'মোট সম্পদ: ' : 'Total Assets: ') + formatCurrency(calc.totalAssets, state.lang),
      (isBn ? 'মোট দেনা: ' : 'Total Liabilities: ') + formatCurrency(calc.totalLiabilities, state.lang),
      (isBn ? 'নীট যাকাতযোগ্য সম্পদ: ' : 'Net Zakatable Wealth: ') + formatCurrency(calc.netWealth, state.lang),
      '----------------------------------------',
      (isBn ? 'অবস্থা: ' : 'Status: ') + (calc.isDue ? t.statusDue : t.statusNotDue),
      (isBn ? 'যাকাতের হার: ' : 'Zakat Rate: ') + '2.5%',
      (isBn ? 'প্রদেয় যাকাত: ' : 'Zakat Due: ') + formatCurrency(calc.zakatDue, state.lang),
      state.zakatPaid > 0 ? (isBn ? 'ইতোমধ্যে প্রদত্ত: ' : 'Paid so far: ') + formatCurrency(state.zakatPaid, state.lang) : '',
      state.zakatPaid > 0 ? (isBn ? 'অবশিষ্ট প্রদেয়: ' : 'Remaining Due: ') + formatCurrency(calc.remainingZakat, state.lang) : '',
      '========================================',
      isBn ? 'হিসাবকারী: যাকাত ক্যালকুলেটর (ব্যক্তিগত ও গোপনীয়)' : 'Calculated via Zakat Calculator (100% Private)'
    ].filter(Boolean).join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast(t.copiedToast);
      }).catch(function () {
        fallbackCopyText(text, t.copiedToast);
      });
    } else {
      fallbackCopyText(text, t.copiedToast);
    }
  }

  function fallbackCopyText(text, message) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      showToast(message);
    } catch (err) {
      console.warn('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  }

  // --------------------------------------------------------------------------
  // 12. Reset All Functionality
  // --------------------------------------------------------------------------
  function resetAll() {
    state.nisabUnit = 'gram';
    state.nisabBasis = 'silver';
    state.goldPrice = 11500;
    state.silverPrice = 100;
    state.goldNisabWeight = GOLD_NISAB_GRAMS;
    state.silverNisabWeight = SILVER_NISAB_GRAMS;

    state.cash = 0;
    state.bank = 0;
    state.goldWeight = 0;
    state.goldUnit = 'tola';
    state.goldPurity = '22k';
    state.silverWeight = 0;
    state.silverUnit = 'tola';
    state.business = 0;
    state.receivables = 0;
    state.investments = 0;
    state.savings = 0;
    state.rental = 0;
    state.customAssets = [];

    state.debtsImmediate = 0;
    state.debtsInstallments = 0;
    state.debtsBusiness = 0;
    state.customLiabilities = [];

    state.zakatPaid = 0;

    syncInputsFromState();
    closeResetModal();
    showToast(state.lang === 'bn' ? 'সব তথ্য সফলভাবে মোছা হয়েছে' : 'All inputs have been reset');
  }

  // --------------------------------------------------------------------------
  // 13. Event Listeners & Initialization
  // --------------------------------------------------------------------------
  function init() {
    // Apply initial theme and language
    applyTheme(state.theme);
    applyLanguage(state.lang);
    syncInputsFromState();

    // Language Toggle
    const langBtn = document.getElementById('langToggle');
    if (langBtn) {
      langBtn.addEventListener('click', function () {
        applyLanguage(state.lang === 'bn' ? 'en' : 'bn');
      });
    }

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      });
    }

    // Nisab Unit select
    const nisabUnitSelect = document.getElementById('nisabUnitSelect');
    if (nisabUnitSelect) {
      nisabUnitSelect.addEventListener('change', function (e) {
        handleUnitSwitch(e.target.value);
      });
    }

    // Nisab Basis Radio buttons
    const radioSilver = document.getElementById('nisabBasisSilver');
    const radioGold = document.getElementById('nisabBasisGold');
    if (radioSilver && radioGold) {
      radioSilver.addEventListener('change', function () {
        if (radioSilver.checked) {
          state.nisabBasis = 'silver';
          updateBasisCardStyles();
          renderAll();
        }
      });
      radioGold.addEventListener('change', function () {
        if (radioGold.checked) {
          state.nisabBasis = 'gold';
          updateBasisCardStyles();
          renderAll();
        }
      });
    }

    // Clickable choice cards for basis
    const cardSilver = document.getElementById('nisabChoiceSilver');
    const cardGold = document.getElementById('nisabChoiceGold');
    if (cardSilver && cardGold) {
      cardSilver.addEventListener('click', function () {
        if (radioSilver) {
          radioSilver.checked = true;
          state.nisabBasis = 'silver';
          updateBasisCardStyles();
          renderAll();
        }
      });
      cardGold.addEventListener('click', function () {
        if (radioGold) {
          radioGold.checked = true;
          state.nisabBasis = 'gold';
          updateBasisCardStyles();
          renderAll();
        }
      });
    }

    // Nisab inputs
    bindNumberInput('goldPriceInput', function (val) { state.goldPrice = val; });
    bindNumberInput('silverPriceInput', function (val) { state.silverPrice = val; });
    bindNumberInput('goldNisabWeightInput', function (val) { state.goldNisabWeight = val; });
    bindNumberInput('silverNisabWeightInput', function (val) { state.silverNisabWeight = val; });

    // Assets inputs
    bindNumberInput('cashInput', function (val) { state.cash = val; });
    bindNumberInput('bankInput', function (val) { state.bank = val; });
    bindNumberInput('goldWeightInput', function (val) { state.goldWeight = val; });
    bindNumberInput('silverWeightInput', function (val) { state.silverWeight = val; });
    bindNumberInput('businessInput', function (val) { state.business = val; });
    bindNumberInput('receivablesInput', function (val) { state.receivables = val; });
    bindNumberInput('investmentsInput', function (val) { state.investments = val; });
    bindNumberInput('savingsInput', function (val) { state.savings = val; });
    bindNumberInput('rentalInput', function (val) { state.rental = val; });

    // Gold unit & purity selects
    const goldUnitSelect = document.getElementById('goldUnitSelect');
    if (goldUnitSelect) {
      goldUnitSelect.addEventListener('change', function (e) {
        state.goldUnit = e.target.value;
        renderAll();
      });
    }
    const goldPuritySelect = document.getElementById('goldPuritySelect');
    if (goldPuritySelect) {
      goldPuritySelect.addEventListener('change', function (e) {
        state.goldPurity = e.target.value;
        renderAll();
      });
    }

    // Silver unit select
    const silverUnitSelect = document.getElementById('silverUnitSelect');
    if (silverUnitSelect) {
      silverUnitSelect.addEventListener('change', function (e) {
        state.silverUnit = e.target.value;
        renderAll();
      });
    }

    // Liabilities inputs
    bindNumberInput('debtsImmediateInput', function (val) { state.debtsImmediate = val; });
    bindNumberInput('debtsInstallmentsInput', function (val) { state.debtsInstallments = val; });
    bindNumberInput('debtsBusinessInput', function (val) { state.debtsBusiness = val; });
    bindNumberInput('zakatPaidInput', function (val) { state.zakatPaid = val; });

    // Add Custom Asset Button
    const btnAddAsset = document.getElementById('btnAddCustomAsset');
    if (btnAddAsset) {
      btnAddAsset.addEventListener('click', function () {
        state.customAssets.push({
          id: 'ca_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          name: '',
          amount: 0
        });
        renderCustomAssetsList();
        renderAll();
      });
    }

    // Add Custom Liability Button
    const btnAddLiability = document.getElementById('btnAddCustomLiability');
    if (btnAddLiability) {
      btnAddLiability.addEventListener('click', function () {
        state.customLiabilities.push({
          id: 'cl_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          name: '',
          amount: 0
        });
        renderCustomLiabilitiesList();
        renderAll();
      });
    }

    // Event Delegation for Custom Rows
    const customAssetsContainer = document.getElementById('customAssetsContainer');
    if (customAssetsContainer) {
      customAssetsContainer.addEventListener('input', function (e) {
        const nameId = e.target.getAttribute('data-asset-name');
        const amountId = e.target.getAttribute('data-asset-amount');
        if (nameId) {
          const item = state.customAssets.find(function (a) { return a.id === nameId; });
          if (item) item.name = e.target.value;
        } else if (amountId) {
          const item = state.customAssets.find(function (a) { return a.id === amountId; });
          if (item) item.amount = sanitizePositiveNumber(e.target.value);
          renderAll();
        }
      });

      customAssetsContainer.addEventListener('click', function (e) {
        const removeId = e.target.getAttribute('data-remove-asset');
        if (removeId) {
          state.customAssets = state.customAssets.filter(function (a) { return a.id !== removeId; });
          renderCustomAssetsList();
          renderAll();
        }
      });
    }

    const customLiabilitiesContainer = document.getElementById('customLiabilitiesContainer');
    if (customLiabilitiesContainer) {
      customLiabilitiesContainer.addEventListener('input', function (e) {
        const nameId = e.target.getAttribute('data-liability-name');
        const amountId = e.target.getAttribute('data-liability-amount');
        if (nameId) {
          const item = state.customLiabilities.find(function (l) { return l.id === nameId; });
          if (item) item.name = e.target.value;
        } else if (amountId) {
          const item = state.customLiabilities.find(function (l) { return l.id === amountId; });
          if (item) item.amount = sanitizePositiveNumber(e.target.value);
          renderAll();
        }
      });

      customLiabilitiesContainer.addEventListener('click', function (e) {
        const removeId = e.target.getAttribute('data-remove-liability');
        if (removeId) {
          state.customLiabilities = state.customLiabilities.filter(function (l) { return l.id !== removeId; });
          renderCustomLiabilitiesList();
          renderAll();
        }
      });
    }

    // Preset buttons
    document.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const sampleNum = parseInt(btn.getAttribute('data-preset'), 10);
        loadPreset(sampleNum);
      });
    });

    // Action Toolbar buttons
    const btnCopy = document.getElementById('btnCopyResult');
    if (btnCopy) btnCopy.addEventListener('click', copySummaryToClipboard);

    const btnPrint = document.getElementById('btnPrintResult');
    if (btnPrint) {
      btnPrint.addEventListener('click', function () {
        window.print();
      });
    }

    const btnReset = document.getElementById('btnResetAll');
    if (btnReset) btnReset.addEventListener('click', openResetModal);

    const btnConfirmYes = document.getElementById('btnConfirmResetYes');
    if (btnConfirmYes) btnConfirmYes.addEventListener('click', resetAll);

    const btnConfirmCancel = document.getElementById('btnConfirmResetCancel');
    if (btnConfirmCancel) btnConfirmCancel.addEventListener('click', closeResetModal);

    const resetModalOverlay = document.getElementById('resetModal');
    if (resetModalOverlay) {
      resetModalOverlay.addEventListener('click', function (e) {
        if (e.target === resetModalOverlay) closeResetModal();
      });
    }

    // FAQ Accordion
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const item = btn.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item').forEach(function (fi) {
          fi.classList.remove('open');
          const ans = fi.querySelector('.faq-answer');
          if (ans) ans.style.maxHeight = null;
        });

        if (!isOpen) {
          item.classList.add('open');
          const answer = item.querySelector('.faq-answer');
          if (answer) {
            answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
          }
        }
      });
    });

    // Step navigator active state on scroll
    initScrollSpy();
  }

  function bindNumberInput(id, updateFn) {
    const el = document.getElementById(id);
    if (!el) return;

    const errorEl = document.getElementById(id + 'Error');

    const handler = function () {
      const valStr = el.value.trim();
      if (valStr === '') {
        el.classList.remove('is-invalid');
        if (errorEl) errorEl.classList.remove('visible');
        updateFn(0);
        renderAll();
        return;
      }

      const num = parseFloat(valStr);
      if (isNaN(num) || num < 0) {
        el.classList.add('is-invalid');
        if (errorEl) {
          errorEl.textContent = i18n[state.lang].invalidInputWarning;
          errorEl.classList.add('visible');
        }
        updateFn(0);
      } else {
        el.classList.remove('is-invalid');
        if (errorEl) errorEl.classList.remove('visible');
        updateFn(num);
      }
      renderAll();
    };

    el.addEventListener('input', handler);
    el.addEventListener('change', handler);
  }

  function initScrollSpy() {
    const steps = ['step1Card', 'step2Card', 'step3Card', 'step4Card'];
    const navItems = document.querySelectorAll('.step-item');

    window.addEventListener('scroll', function () {
      const scrollPos = window.scrollY + 160;
      let currentStepIndex = 0;

      steps.forEach(function (id, idx) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= scrollPos) {
          currentStepIndex = idx;
        }
      });

      navItems.forEach(function (item, idx) {
        if (idx === currentStepIndex) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }, { passive: true });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
