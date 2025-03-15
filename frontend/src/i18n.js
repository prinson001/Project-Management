import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English translations
const enTranslations = {
  // Sidebar items
  tasks: 'Tasks',
  dashboard: 'Dashboard',
  dataManagement: 'Data Management',
  admin: 'Admin',
  
  // Common UI elements
  search: 'Search',
  filter: 'Filter',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  cancel: 'Cancel',
  save: 'Save',
  submit: 'Submit',
  
  // Auth related
  login: 'Login',
  logout: 'Logout',
  register: 'Register',
  forgotPassword: 'Forgot Password',
  
  // Task related
  taskName: 'Task Name',
  taskDescription: 'Description',
  taskStatus: 'Status',
  taskDueDate: 'Due Date',
  taskPriority: 'Priority',
  taskAssignee: 'Assignee',
  
  // Status options
  statusTodo: 'To Do',
  statusInProgress: 'In Progress',
  statusCompleted: 'Completed',
  
  // Priority options
  priorityLow: 'Low',
  priorityMedium: 'Medium',
  priorityHigh: 'High',
  
  // Additional translations
  initiatives: 'Initiatives',
  portfolio: 'Portfolio',
  programs: 'Programs',
  projects: 'Projects',
  objectives: 'Objectives',
  departments: 'Departments',
  vendors: 'Vendors',
  team: 'Team',
  documents: 'Documents',
  addNew: 'Add New',
  systemSettings: 'System Settings',
  apply: 'Apply',
  clear: 'Clear',
};

// Arabic translations
const arTranslations = {
  // Sidebar items
  tasks: 'المهام',
  dashboard: 'لوحة المعلومات',
  dataManagement: 'إدارة البيانات',
  admin: 'المسؤول',
  
  // Common UI elements
  search: 'بحث',
  filter: 'تصفية',
  add: 'إضافة',
  edit: 'تعديل',
  delete: 'حذف',
  cancel: 'إلغاء',
  save: 'حفظ',
  submit: 'إرسال',
  
  // Auth related
  login: 'تسجيل الدخول',
  logout: 'تسجيل الخروج',
  register: 'تسجيل',
  forgotPassword: 'نسيت كلمة المرور',
  
  // Task related
  taskName: 'اسم المهمة',
  taskDescription: 'الوصف',
  taskStatus: 'الحالة',
  taskDueDate: 'تاريخ الاستحقاق',
  taskPriority: 'الأولوية',
  taskAssignee: 'المكلف',
  
  // Status options
  statusTodo: 'للقيام به',
  statusInProgress: 'قيد التنفيذ',
  statusCompleted: 'مكتمل',
  
  // Priority options
  priorityLow: 'منخفض',
  priorityMedium: 'متوسط',
  priorityHigh: 'عالي',
  
  // Additional translations
  initiatives: 'المبادرات',
  portfolio: 'مَلَفّ',
  programs: 'البرامج',
  projects: 'المشاريع',
  objectives: 'الأهداف',
  departments: 'الأقسام',
  vendors: 'الموردون',
  team: 'الفريق',
  documents: 'المستندات',
  addNew: 'إضافة جديد',
  systemSettings: 'إعدادات النظام',
  apply: 'تطبيق',
  clear: 'مسح',
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ar: {
        translation: arTranslations
      }
    },
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    // Ensure RTL is not automatically applied
    supportedLngs: ['en', 'ar'],
    nonExplicitSupportedLngs: false,
  });

export default i18n; 