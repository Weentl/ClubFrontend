import { Link } from 'react-router-dom';
import { 
  Lightning, 
  Rocket, 
  ShieldCheck, 
  ChartBar, 
  CurrencyDollar, 
  ClockCounterClockwise, 
  CheckCircle,
  Users, 
  Gear, 
  Wallet
} from 'phosphor-react';
import { BarChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Rocket className="h-8 w-8 text-blue-600" weight="fill" />
              <span className="text-2xl font-bold text-blue-700">
                NEXUS
              </span>
              <span className="text-sm text-gray-600">by Glowel</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Características</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Planes</a>
              <Link 
                to="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                Comenzar Prueba Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 bg-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-gray-800">
            Transforma tu negocio con{' '}
            <span className="text-blue-600">
              NEXUS
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Sistema de gestión integral para pequeñas empresas: ventas, gastos, clientes, empleados y más.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all shadow-md flex items-center gap-2"
            >
              <Lightning weight="fill" className="w-6 h-6" />
              Comenzar Prueba Gratis
            </Link>
          </div>
          <div className="mt-12">
            <img 
              src="./public/Dashboard.png" 
              alt="NEXUS Dashboard - Pantalla del sistema" 
              className="w-full max-w-4xl mx-auto rounded-lg shadow-lg" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">¿Qué puede hacer NEXUS por su negocio?</h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Herramientas sencillas pero poderosas para administrar todo su negocio
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ChartBar,
                title: "Análisis fáciles de entender",
                desc: "Vea gráficos claros sobre cómo va su negocio, sin complicaciones"
              },
              {
                icon: ShieldCheck,
                title: "Seguridad Garantizada",
                desc: "Sus datos están protegidos con la mejor tecnología disponible"
              },
              {
                icon: CurrencyDollar,
                title: "Control total de su dinero",
                desc: "Sepa exactamente cuánto dinero entra y sale de su negocio"
              },
              {
                icon: ClockCounterClockwise,
                title: "Acceso a todo su historial",
                desc: "Encuentre cualquier información pasada con solo unos clics"
              },
              {
                icon: Rocket,
                title: "Crece con su negocio",
                desc: "El sistema se adapta a medida que su empresa crece"
              },
              {
                icon: CheckCircle,
                title: "Ayuda cuando la necesite",
                desc: "Nuestro equipo está listo para ayudarle en cualquier momento"
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className="p-6 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all"
              >
                <feature.icon className="w-12 h-12 text-blue-600 mb-4" weight="duotone" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4 text-center">¿Cómo le ayudará NEXUS?</h2>
          <p className="text-xl text-gray-600 mb-12 text-center max-w-3xl mx-auto">
            Beneficios claros para su día a día
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Gear,
                title: "Ahorre tiempo en tareas repetitivas",
                desc: "NEXUS automatiza lo aburrido para que usted se enfoque en lo que le gusta hacer."
              },
              {
                icon: BarChart,
                title: "Tome mejores decisiones",
                desc: "Vea información clara y actualizada para saber qué hacer."
              },
              {
                icon: Users,
                title: "Mejore la comunicación con su equipo",
                desc: "Todos pueden trabajar juntos y ver la misma información."
              },
              {
                icon: Wallet,
                title: "Todo en un solo lugar",
                desc: "Ventas, gastos, clientes y más - todo organizado y fácil de encontrar."
              }
            ].map((benefit, idx) => (
              <div 
                key={idx}
                className="p-6 bg-white rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all flex gap-4"
              >
                <benefit.icon className="w-12 h-12 text-blue-600 flex-shrink-0" weight="duotone" />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Planes simples y claros
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escoja el plan que mejor se adapte a su negocio
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Básico</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">$299</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <p className="text-gray-600 mb-6">Ideal para negocios pequeños que están comenzando</p>
              <ul className="space-y-4 mb-8 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>Hasta 5 usuarios</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>10GB almacenamiento</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>Soporte básico</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-lg border border-gray-200 transition-all font-bold"
              >
                Seleccionar Plan
              </Link>
            </div>

            {/* Professional Plan (Highlighted) */}
            <div className="p-8 bg-white rounded-2xl border-2 border-blue-500 shadow-lg relative transform scale-105">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                Más Popular
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Profesional</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">$599</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <p className="text-gray-600 mb-6">Perfecto para negocios en crecimiento</p>
              <ul className="space-y-4 mb-8 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>Usuarios ilimitados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>100GB almacenamiento</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>Soporte prioritario 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>Respaldos automáticos</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg transition-all font-bold shadow-md"
              >
                Comenzar Prueba Gratis
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-md hover:shadow-lg transition-all">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Empresarial</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600">$999</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <p className="text-gray-600 mb-6">Para empresas con necesidades especiales</p>
              <ul className="space-y-4 mb-8 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>Todas las funciones Pro</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>Servidor dedicado</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" weight="fill" />
                  <span>Capacitación personalizada</span>
                </li>
              </ul>
              <Link
                to="/contact"
                className="w-full block text-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-lg border border-gray-200 transition-all font-bold"
              >
                Contactar Ventas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            ¿Listo para simplificar la administración de su negocio?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Miles de empresas ya están ahorrando tiempo y dinero con NEXUS
          </p>
          <div className="flex justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-12 py-5 rounded-xl text-lg font-bold hover:bg-blue-50 transition-all shadow-md flex items-center gap-3"
            >
              <Lightning weight="fill" className="w-6 h-6" />
              Comenzar Ahora - 30 Días Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-16 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-gray-600">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Rocket className="h-8 w-8 text-blue-600" weight="fill" />
                <span className="text-xl font-bold text-gray-800">NEXUS</span>
                <span className="text-sm text-gray-600">by Glowel</span>
              </div>
              <p className="text-sm">© 2025 NEXUS by Glowel</p>
            </div>
            <div>
              <h4 className="text-gray-800 font-bold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Planes</a></li>
                <li><Link to="/security" className="hover:text-blue-600 transition-colors">Seguridad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-800 font-bold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-blue-600 transition-colors">Sobre Nosotros</Link></li>
                <li><Link to="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-blue-600 transition-colors">Empleo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-800 font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacidad</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <div className="flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm text-gray-600">Sus datos están seguros con nosotros</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}