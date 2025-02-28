import React, { useState } from 'react';
import { HelpCircle, MessageCircle, FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock FAQ data
const faqData = [
  {
    id: '1',
    question: '¿Cómo puedo añadir un nuevo club?',
    answer: 'Para añadir un nuevo club, ve a la sección "Clubs" en el menú lateral y haz clic en el botón "Nuevo Club". Completa el formulario con la información requerida y haz clic en "Guardar".'
  },
  {
    id: '2',
    question: '¿Cómo gestiono mi inventario?',
    answer: 'Puedes gestionar tu inventario desde la sección "Inventario". Allí podrás ver el stock actual, realizar ajustes, y ver el historial de movimientos de cada producto.'
  },
  {
    id: '3',
    question: '¿Puedo exportar mis reportes?',
    answer: 'Sí, en la sección de "Reportes" encontrarás un botón de "Exportar" que te permitirá descargar los datos en formato CSV o PDF para su análisis posterior o para compartirlos.'
  },
  {
    id: '4',
    question: '¿Cómo cambio mi plan de suscripción?',
    answer: 'Para cambiar tu plan, ve a "Configuración > Suscripción" y haz clic en "Actualizar Plan". Podrás ver las diferentes opciones disponibles y seleccionar la que mejor se adapte a tus necesidades.'
  },
  {
    id: '5',
    question: '¿Puedo tener múltiples usuarios en mi cuenta?',
    answer: 'Sí, dependiendo de tu plan de suscripción. En los planes Básico y superiores, puedes añadir empleados y asignarles diferentes roles y permisos desde la sección de "Clubs".'
  }
];

export default function HelpSettings() {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });
  
  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };
  
  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the message to support
    toast.success('Mensaje enviado correctamente. Te responderemos pronto.');
    setContactForm({
      subject: '',
      message: ''
    });
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Ayuda y Soporte</h2>
      
      {/* FAQ Section */}
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <HelpCircle className="h-5 w-5 text-[#2A5C9A] mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Preguntas Frecuentes</h3>
        </div>
        
        <div className="space-y-4">
          {faqData.map((faq) => (
            <div key={faq.id} className="border border-gray-200 rounded-md overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => toggleFaq(faq.id)}
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                {expandedFaq === faq.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
              
              {expandedFaq === faq.id && (
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-sm text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Documentation Section */}
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 text-[#2A5C9A] mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Documentación</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="#"
            className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
            onClick={(e) => {
              e.preventDefault();
              toast.success('Abriendo guía de inicio rápido...');
            }}
          >
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Guía de Inicio Rápido</h4>
              <p className="text-sm text-gray-500">Aprende lo básico para comenzar a usar la plataforma</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
          </a>
          
          <a
            href="#"
            className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
            onClick={(e) => {
              e.preventDefault();
              toast.success('Abriendo guía de inventario...');
            }}
          >
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Gestión de Inventario</h4>
              <p className="text-sm text-gray-500">Cómo administrar tu stock de manera eficiente</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
          </a>
          
          <a
            href="#"
            className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
            onClick={(e) => {
              e.preventDefault();
              toast.success('Abriendo guía de ventas...');
            }}
          >
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Registro de Ventas</h4>
              <p className="text-sm text-gray-500">Cómo registrar y gestionar tus ventas</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
          </a>
          
          <a
            href="#"
            className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 flex items-start"
            onClick={(e) => {
              e.preventDefault();
              toast.success('Abriendo guía de reportes...');
            }}
          >
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Reportes y Análisis</h4>
              <p className="text-sm text-gray-500">Cómo interpretar y utilizar los reportes</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
          </a>
        </div>
        
        <div className="mt-4 text-center">
          <a
            href="#"
            className="text-[#2A5C9A] hover:text-[#1e4474] font-medium"
            onClick={(e) => {
              e.preventDefault();
              toast.success('Abriendo centro de documentación...');
            }}
          >
            Ver toda la documentación →
          </a>
        </div>
      </div>
      
      {/* Contact Support Section */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <MessageCircle className="h-5 w-5 text-[#2A5C9A] mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Contactar Soporte</h3>
        </div>
        
        <form onSubmit={handleContactSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                Asunto
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={contactForm.subject}
                onChange={handleContactChange}
                required
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej: Problema con la facturación"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                required
                rows={4}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe tu problema o pregunta en detalle..."
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#2A5C9A] text-white rounded-md hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Enviar Mensaje
            </button>
          </div>
        </form>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-900 mb-2">Información de Contacto</h4>
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Email:</span> soporte@protehouse.com
          </p>
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-medium">Teléfono:</span> +52 55 1234 5678
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Horario:</span> Lunes a Viernes, 9am - 6pm (Hora de CDMX)
          </p>
        </div>
      </div>
    </div>
  );
}