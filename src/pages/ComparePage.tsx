import React from 'react';
import { MOCK_PROPERTIES } from '../constants';
import Button from '../components/Button';
import { Check, X, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ComparePage = () => {
  const navigate = useNavigate();
  // Simulate selected properties for comparison
  const selectedProps = MOCK_PROPERTIES.slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-navy mb-4">Comparar Propiedades</h1>
        <p className="text-gray-500">Analiza las diferencias y encuentra la mejor opción para tu inversión</p>
      </div>

      <div className="overflow-x-auto pb-8">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 text-left w-1/4 align-bottom">
                 <div className="text-2xl font-serif font-bold text-navy mb-2">Características</div>
                 <p className="font-normal text-sm text-gray-500">Comparativa técnica detallada</p>
              </th>
              {selectedProps.map(prop => (
                <th key={prop.id} className="p-4 w-1/4 align-top">
                  <div className="rounded-lg overflow-hidden shadow-sm mb-4 border border-gray-100 bg-white">
                    <img src={prop.image} alt={prop.title} className="w-full h-32 object-cover" />
                    <div className="p-4">
                      <h3 className="font-serif font-bold text-navy mb-2 text-lg leading-tight h-12 overflow-hidden">{prop.title}</h3>
                      <div className="text-gold font-bold text-xl">${prop.price.toLocaleString()}</div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white rounded-lg shadow-sm">
            {/* Price Row */}
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="p-6 font-semibold text-navy bg-gray-50/50">Precio</td>
              {selectedProps.map((prop, idx) => {
                  const isLowest = prop.price === Math.min(...selectedProps.map(p => p.price));
                  return (
                    <td key={prop.id} className={`p-6 text-center ${isLowest ? 'bg-green-50' : ''}`}>
                        <span className={`font-bold ${isLowest ? 'text-green-700' : 'text-gray-700'}`}>
                            ${prop.price.toLocaleString()}
                        </span>
                        {isLowest && <span className="block text-xs text-green-600 font-medium mt-1">Mejor Precio</span>}
                    </td>
                  );
              })}
            </tr>

            {/* Bedrooms */}
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="p-6 font-semibold text-navy bg-gray-50/50">Dormitorios</td>
              {selectedProps.map(prop => (
                <td key={prop.id} className="p-6 text-center text-gray-700">{prop.bedrooms}</td>
              ))}
            </tr>

            {/* Bathrooms */}
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="p-6 font-semibold text-navy bg-gray-50/50">Baños</td>
              {selectedProps.map(prop => (
                <td key={prop.id} className="p-6 text-center text-gray-700">{prop.bathrooms}</td>
              ))}
            </tr>

            {/* Area */}
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="p-6 font-semibold text-navy bg-gray-50/50">Superficie Total</td>
              {selectedProps.map((prop, idx) => {
                  const isLargest = prop.area === Math.max(...selectedProps.map(p => p.area));
                  return (
                    <td key={prop.id} className={`p-6 text-center ${isLargest ? 'bg-gold/10' : ''}`}>
                        <span className={isLargest ? 'font-bold text-navy' : 'text-gray-700'}>{prop.area} m²</span>
                    </td>
                  )
              })}
            </tr>

            {/* Price per m2 */}
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="p-6 font-semibold text-navy bg-gray-50/50">Precio por m²</td>
              {selectedProps.map(prop => (
                <td key={prop.id} className="p-6 text-center text-gray-500 text-sm">
                   ${Math.round(prop.price / prop.area).toLocaleString()}
                </td>
              ))}
            </tr>

             {/* Location */}
             <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="p-6 font-semibold text-navy bg-gray-50/50">Ubicación</td>
              {selectedProps.map(prop => (
                <td key={prop.id} className="p-6 text-center text-sm text-gray-700">{prop.location?.address || prop.address || 'Ubicación no disponible'}</td>
              ))}
            </tr>

            {/* Amenities Check */}
            <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-6 font-semibold text-navy bg-gray-50/50">Propiedad Destacada</td>
                 {selectedProps.map(prop => {
                     return (
                        <td key={prop.id} className="p-6 text-center">
                            <div className="flex justify-center">
                                {prop.featured ? <Check className="text-green-500" /> : <X className="text-gray-300" />}
                            </div>
                        </td>
                     )
                 })}
            </tr>

            {/* Actions */}
            <tr>
                <td className="p-6 bg-transparent"></td>
                {selectedProps.map(prop => (
                    <td key={prop.id} className="p-6 text-center align-bottom">
                         <Button size="sm" fullWidth variant="primary" onClick={() => navigate(`/propiedad/${prop.id}`)}>
                             Ver Detalles
                         </Button>
                    </td>
                ))}
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* System Recommendation */}
      <div className="mt-8 bg-gold/10 border border-gold rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-gold text-white p-4 rounded-full shadow-lg shrink-0">
              <Star size={32} fill="white" />
          </div>
          <div className="flex-grow text-center md:text-left">
              <h3 className="text-xl font-serif font-bold text-navy">Recomendación Ruzzi AI</h3>
              <p className="text-gray-700 mt-1">
                  Basado en el mejor balance precio/superficie, la <strong>{selectedProps[1].title}</strong> se destaca como la opción con mayor potencial de revalorización a corto plazo en Docta.
              </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(`/propiedad/${selectedProps[1].id}`)}>
              Ver Opción Recomendada
          </Button>
      </div>
    </div>
  );
};

export default ComparePage;