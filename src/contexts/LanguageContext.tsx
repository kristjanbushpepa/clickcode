import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'sq';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.features': 'Features',
    'nav.pricing': 'Pricing',
    'nav.contact': 'Contact Us',
    
    // Hero Section
    'hero.welcome': 'Welcome to',
    'hero.description': 'Transform your restaurant with our cutting-edge digital menu platform. Create stunning QR code menus, manage your profile with ease, and boost your online presence with our powerful admin panel.',
    'hero.restaurant_login': 'Restaurant Login',
    
    // Features Section
    'features.title': 'Powerful Features for Modern Restaurants',
    'features.subtitle': 'Everything you need to create, customize, and manage your digital presence',
    'features.admin_panel': 'Admin Panel',
    'features.admin_panel_desc': 'Comprehensive dashboard to manage all your restaurants, analytics, and system settings in one place.',
    'features.customization': 'Customization',
    'features.customization_desc': 'Personalize your menu\'s appearance with custom themes, colors, and layouts that match your brand.',
    'features.profile_management': 'Profile Management',
    'features.profile_management_desc': 'Easily update restaurant information, hours, contact details, and social media links.',
    'features.review_popups': 'Review Popups',
    'features.review_popups_desc': 'Smart popup system to encourage customer reviews and increase your online ratings automatically.',
    'features.social_growth': 'Social Growth',
    'features.social_growth_desc': 'Boost your social media followers with integrated campaigns and engagement tools.',
    'features.qr_code_menus': 'QR Code Menus',
    'features.qr_code_menus_desc': 'Generate beautiful QR codes for contactless menu access with real-time updates and analytics.',
    
    // Restaurants Section
    'restaurants.title': 'Our Partner Restaurants',
    'restaurants.subtitle': 'Click on any restaurant to view their digital menu',
    'restaurants.online': 'Online',
    'restaurants.owner': 'Owner:',
    'restaurants.since': 'Since',
    'restaurants.view_menu': 'View Menu',
    'restaurants.no_restaurants': 'No Restaurants Yet',
    'restaurants.no_restaurants_desc': 'We\'re working with restaurants to bring you amazing digital menu experiences.',
    
    // Footer
    'footer.description': 'The most advanced digital menu platform for modern restaurants. Increase engagement, boost reviews, and create unforgettable dining experiences.',
    'footer.features': 'Features',
    'footer.digital_menus': 'Digital Menus',
    'footer.qr_generation': 'QR Code Generation',
    'footer.admin_dashboard': 'Admin Dashboard',
    'footer.customization_tools': 'Customization Tools',
    'footer.analytics': 'Analytics & Reports',
    'footer.support': 'Support',
    'footer.contact_support': 'Contact Support',
    
    // Contact Page
    'contact.title': 'Contact Us for',
    'contact.pricing': 'Pricing',
    'contact.subtitle': 'Get a personalized quote based on your restaurant\'s specific needs. Fill out this quick questionnaire and we\'ll get back to you within 24 hours.',
    'contact.get_in_touch': 'Get in Touch',
    'contact.email': 'Email:',
    'contact.phone': 'Phone:',
    'contact.form_title': 'Restaurant Information Questionnaire',
    'contact.form_subtitle': 'Help us understand your needs so we can provide the best solution for your restaurant',
    'contact.basic_info': 'Basic Information',
    'contact.your_name': 'Your Name',
    'contact.email_address': 'Email Address',
    'contact.phone_number': 'Phone Number',
    'contact.restaurant_name': 'Restaurant Name',
    'contact.restaurant_details': 'Restaurant Details',
    'contact.estimated_budget': 'Estimated Budget',
    'contact.budget_placeholder': 'Select budget range',
    'contact.number_of_tables': 'Number of Tables',
    'contact.tables_placeholder': 'e.g., 20',
    'contact.current_menu_type': 'Current Menu Type',
    'contact.physical_menu': 'Physical Menu',
    'contact.basic_digital': 'Basic Digital',
    'contact.advanced_digital': 'Advanced Digital',
    'contact.desired_features': 'Desired Features',
    'contact.additional_info': 'Additional Information',
    'contact.additional_info_desc': 'Tell us more about your specific needs',
    'contact.additional_info_placeholder': 'Any specific requirements, current challenges, or questions you\'d like us to address...',
    'contact.submitting': 'Submitting...',
    'contact.get_quote': 'Get My Custom Quote',
    'contact.back_to_home': 'Back to Home',
    
    // Budget ranges
    'budget.under_1000': 'Under $1,000',
    'budget.1000_5000': '$1,000 - $5,000',
    'budget.5000_10000': '$5,000 - $10,000',
    'budget.over_10000': 'Over $10,000',
    
    // Toast messages
    'toast.success_title': 'Thank you for your interest!',
    'toast.success_desc': 'We\'ve received your submission and will get back to you within 24 hours with a personalized quote.',
    'toast.error_title': 'Submission failed',
    'toast.error_desc': 'There was an error submitting your form. Please try again or contact us directly.',
  },
  sq: {
    // Navigation
    'nav.features': 'Karakteristikat',
    'nav.pricing': 'Çmimet',
    'nav.contact': 'Na Kontaktoni',
    
    // Hero Section
    'hero.welcome': 'Mirë se vini në',
    'hero.description': 'Transformoni restorantin tuaj me platformën tonë të avancuar të menusë digjitale. Krijoni meny QR të mahnitshme, menaxhoni profilin tuaj me lehtësi dhe rrisni prezencën tuaj online me panelin tonë të fuqishëm administrativ.',
    'hero.restaurant_login': 'Hyrja e Restorantit',
    
    // Features Section
    'features.title': 'Karakteristika të Fuqishme për Restorantet Moderne',
    'features.subtitle': 'Gjithçka që ju nevojitet për të krijuar, personalizuar dhe menaxhuar prezencën tuaj digjitale',
    'features.admin_panel': 'Paneli Administrativ',
    'features.admin_panel_desc': 'Dashboard gjithëpërfshirës për të menaxhuar të gjitha restorantet tuaja, analizat dhe cilësimet e sistemit në një vend.',
    'features.customization': 'Personalizimi',
    'features.customization_desc': 'Personalizoni pamjen e menysë suaj me tema, ngjyra dhe strukturë të personalizuara që përputhen me markën tuaj.',
    'features.profile_management': 'Menaxhimi i Profilit',
    'features.profile_management_desc': 'Përditësoni lehtësisht informacionet e restorantit, oraret, detajet e kontaktit dhe lidhjet e mediave sociale.',
    'features.review_popups': 'Popups për Recensione',
    'features.review_popups_desc': 'Sistem i zgjuar popup-ash për të inkurajuar recensionet e klientëve dhe për të rritur automatikisht vlerësimet tuaja online.',
    'features.social_growth': 'Rritja Sociale',
    'features.social_growth_desc': 'Rrisni ndjekësit tuaj në mediat sociale me kampanja të integruara dhe mjete angazhimi.',
    'features.qr_code_menus': 'Menutë QR Code',
    'features.qr_code_menus_desc': 'Gjeneroni kode QR të bukura për qasje në meny pa kontakt me përditësime në kohë reale dhe analiza.',
    
    // Restaurants Section
    'restaurants.title': 'Restorantet Tona Partnere',
    'restaurants.subtitle': 'Klikoni në çdo restorant për të parë menynë e tyre digjitale',
    'restaurants.online': 'Online',
    'restaurants.owner': 'Pronari:',
    'restaurants.since': 'Që nga',
    'restaurants.view_menu': 'Shiko Menynë',
    'restaurants.no_restaurants': 'Ende Pa Restorante',
    'restaurants.no_restaurants_desc': 'Po punojmë me restorante për t\'ju sjellë përvoja të mahnitshme menujsh digjitale.',
    
    // Footer
    'footer.description': 'Platforma më e avancuar e menysë digjitale për restorantet moderne. Rrisni angazhimin, forconi recensionet dhe krijoni përvoja të paharrueshme ngrënieje.',
    'footer.features': 'Karakteristikat',
    'footer.digital_menus': 'Menut Digjitale',
    'footer.qr_generation': 'Gjenerimi i Kodit QR',
    'footer.admin_dashboard': 'Dashboard Administrativ',
    'footer.customization_tools': 'Mjetet e Personalizimit',
    'footer.analytics': 'Analizat & Raportet',
    'footer.support': 'Mbështetja',
    'footer.contact_support': 'Kontaktoni Mbështetjen',
    
    // Contact Page
    'contact.title': 'Na Kontaktoni për',
    'contact.pricing': 'Çmimet',
    'contact.subtitle': 'Merrni një ofertë të personalizuar bazuar në nevojat specifike të restorantit tuaj. Plotësoni këtë pyetësor të shkurtër dhe ne do t\'ju përgjigjemi brenda 24 orëve.',
    'contact.get_in_touch': 'Na Kontaktoni',
    'contact.email': 'Email-i:',
    'contact.phone': 'Telefoni:',
    'contact.form_title': 'Pyetësori i Informacioneve të Restorantit',
    'contact.form_subtitle': 'Na ndihmoni të kuptojmë nevojat tuaja që të mund t\'ju ofrojmë zgjidhjen më të mirë për restorantin tuaj',
    'contact.basic_info': 'Informacione Bazë',
    'contact.your_name': 'Emri Juaj',
    'contact.email_address': 'Adresa e Email-it',
    'contact.phone_number': 'Numri i Telefonit',
    'contact.restaurant_name': 'Emri i Restorantit',
    'contact.restaurant_details': 'Detajet e Restorantit',
    'contact.estimated_budget': 'Buxheti i Vlerësuar',
    'contact.budget_placeholder': 'Zgjidhni gamën e buxhetit',
    'contact.number_of_tables': 'Numri i Tavolinave',
    'contact.tables_placeholder': 'p.sh., 20',
    'contact.current_menu_type': 'Lloji Aktual i Menysë',
    'contact.physical_menu': 'Meny Fizike',
    'contact.basic_digital': 'Digjitale Bazë',
    'contact.advanced_digital': 'Digjitale e Avancuar',
    'contact.desired_features': 'Karakteristikat e Dëshiruara',
    'contact.additional_info': 'Informacione Shtesë',
    'contact.additional_info_desc': 'Na tregoni më shumë për nevojat tuaja specifike',
    'contact.additional_info_placeholder': 'Çdo kërkesë specifike, sfida aktuale ose pyetje që dëshironi t\'i adresojmë...',
    'contact.submitting': 'Duke Dërguar...',
    'contact.get_quote': 'Merr Ofertën Time të Personalizuar',
    'contact.back_to_home': 'Kthehu në Shtëpi',
    
    // Budget ranges
    'budget.under_1000': 'Nën $1,000',
    'budget.1000_5000': '$1,000 - $5,000',
    'budget.5000_10000': '$5,000 - $10,000',
    'budget.over_10000': 'Mbi $10,000',
    
    // Toast messages
    'toast.success_title': 'Faleminderit për interesimin tuaj!',
    'toast.success_desc': 'Kemi marrë dërgimin tuaj dhe do t\'ju përgjigjemi brenda 24 orëve me një ofertë të personalizuar.',
    'toast.error_title': 'Dërgimi dështoi',
    'toast.error_desc': 'Pati një gabim në dërgimin e formës suaj. Ju lutemi provoni përsëri ose na kontaktoni drejtpërdrejt.',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};