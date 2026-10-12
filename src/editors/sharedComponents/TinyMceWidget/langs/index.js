/**
 * Languages of the TinyMCE interface (toolbar tooltips, menus, dialogs).
 *
 * TinyMCE has its own translation files; without one the editor is English whatever the language
 * of the page. The packs in this folder are TinyMCE's own files (see README.md). The entries
 * added below are the labels of this app's own buttons and plugins (image, code block, label,
 * embedded iframe), plus a few labels a pack lacks: TinyMCE looks every label up by its English
 * text, so they are keyed by the English text used in hooks.ts and customTinyMcePlugins/.
 */
import tinymce from 'tinymce';

import './ar';
import './es_MX';
import './hi';

const QUESTION_LABEL_HELP = 'Apply a "Question" label to specific text, recognized by screen readers. Recommended to improve accessibility.';

const extras = {
  ar: {
    'Add Image': 'إضافة صورة',
    'Edit Image Settings': 'تعديل إعدادات الصورة',
    'Code Block': 'كتلة شيفرة',
    Label: 'تسمية',
    [QUESTION_LABEL_HELP]: 'طبّق تسمية «سؤال» على نص محدد لتتعرّف عليه قارئات الشاشة. يُنصح بذلك لتحسين إمكانية الوصول.',
    'Insert iframe': 'إدراج iframe',
    'Embed iframe': 'تضمين iframe',
    'Source URL': 'رابط المصدر',
    Size: 'الحجم',
    'Inline Value': 'قيمة مخصّصة',
    'Big embed': 'تضمين كبير',
    'Small embed': 'تضمين صغير',
    'Long description URL': 'رابط الوصف المطوّل',
    'Show iframe border': 'إظهار حدود iframe',
    'Enable scrollbar': 'تفعيل شريط التمرير',
    Scrollbar: 'شريط التمرير',
    'Rich Text Area': 'منطقة نص منسّق',
  },
  es_MX: {
    'Add Image': 'Agregar imagen',
    'Edit Image Settings': 'Editar la configuración de la imagen',
    'Code Block': 'Bloque de código',
    Label: 'Etiqueta',
    [QUESTION_LABEL_HELP]: 'Aplica una etiqueta de «Pregunta» a un texto específico para que la reconozcan los lectores de pantalla. Recomendado para mejorar la accesibilidad.',
    'Insert iframe': 'Insertar iframe',
    'Embed iframe': 'Incrustar iframe',
    'Source URL': 'URL de origen',
    Size: 'Tamaño',
    'Inline Value': 'Valor personalizado',
    'Big embed': 'Incrustación grande',
    'Small embed': 'Incrustación pequeña',
    'Long description URL': 'URL de la descripción larga',
    'Show iframe border': 'Mostrar el borde del iframe',
    'Enable scrollbar': 'Activar la barra de desplazamiento',
    Scrollbar: 'Barra de desplazamiento',
    'Rich Text Area': 'Área de texto enriquecido',
  },
  hi: {
    'Add Image': 'चित्र जोड़ें',
    'Edit Image Settings': 'चित्र की सेटिंग्स संपादित करें',
    'Code Block': 'कोड ब्लॉक',
    Label: 'लेबल',
    [QUESTION_LABEL_HELP]: 'चुने गए टेक्स्ट पर “प्रश्न” लेबल लगाएँ, जिसे स्क्रीन रीडर पहचानते हैं। सुलभता बेहतर करने के लिए अनुशंसित।',
    'Insert iframe': 'iframe डालें',
    'Embed iframe': 'iframe एम्बेड करें',
    'Source URL': 'स्रोत URL',
    Size: 'आकार',
    'Inline Value': 'कस्टम मान',
    'Big embed': 'बड़ा एम्बेड',
    'Small embed': 'छोटा एम्बेड',
    'Long description URL': 'विस्तृत विवरण का URL',
    'Show iframe border': 'iframe का बॉर्डर दिखाएँ',
    'Enable scrollbar': 'स्क्रॉलबार चालू करें',
    Scrollbar: 'स्क्रॉलबार',
    'Rich Text Area': 'रिच टेक्स्ट क्षेत्र',
    'Header 1': 'शीर्षक 1',
    'Header 2': 'शीर्षक 2',
    'Header 3': 'शीर्षक 3',
    'Header 4': 'शीर्षक 4',
    'Header 5': 'शीर्षक 5',
    'Header 6': 'शीर्षक 6',
    Emoticons: 'इमोटिकॉन',
    'Special character': 'विशेष वर्ण',
    'Special characters': 'विशेष वर्ण',
    Div: 'Div',
  },
};

Object.entries(extras).forEach(([code, labels]) => tinymce.addI18n(code, labels));

const LANGUAGE_BY_LOCALE = {
  ar: 'ar',
  hi: 'hi',
  es: 'es_MX',
  'es-419': 'es_MX',
  'es-mx': 'es_MX',
};

/**
 * The TinyMCE language code for a page locale, or undefined (English) when there is no pack.
 */
export const tinyMceLanguage = (locale) => {
  const code = String(locale || '').toLowerCase().replace('_', '-');
  return LANGUAGE_BY_LOCALE[code] || LANGUAGE_BY_LOCALE[code.split('-')[0]];
};

export default tinyMceLanguage;
