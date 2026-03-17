import React, { useEffect, useState } from 'react';
import { User, Product, UserRole } from '../types';
import { dataService } from '../services/mockDb';
import { Plus, Tag, Clock, X, TrendingUp } from 'lucide-react';

interface ProductsProps {
  user: User;
}

const Products: React.FC<ProductsProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', cost: '', durationMin: '', description: '' });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    dataService.getProducts().then(setProducts);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    await dataService.createProduct({
      name: newProduct.name,
      price: Number(newProduct.price),
      cost: Number(newProduct.cost) || 0,
      durationMin: Number(newProduct.durationMin),
      description: newProduct.description
    });

    setIsModalOpen(false);
    setNewProduct({ name: '', price: '', cost: '', durationMin: '', description: '' });
    loadProducts();
  };

  const canEdit = user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-white">Serviços & Produtos</h2>
          <p className="text-stone-500 dark:text-stone-400">Catálogo de tratamentos disponíveis.</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-200 dark:shadow-none flex items-center gap-2 transition-all"
          >
            <Plus size={18} />
            Novo Serviço
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => {
          const margin = product.price - (product.cost || 0);
          return (
            <div key={product.id} className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 hover:border-primary-200 dark:hover:border-primary-800 transition group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition">
                  <Tag size={24} />
                </div>
                <div className="text-right">
                    <span className="font-bold text-lg text-stone-800 dark:text-white block">R$ {product.price}</span>
                    {(user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL) && (
                        <span className="text-xs text-stone-400 dark:text-stone-500 block">Custo: R$ {product.cost}</span>
                    )}
                </div>
              </div>
              
              <h3 className="font-bold text-lg text-stone-800 dark:text-white mb-2">{product.name}</h3>
              <p className="text-stone-500 dark:text-stone-400 text-sm mb-4 min-h-[40px] flex-1">{product.description}</p>
              
              <div className="pt-4 border-t border-stone-50 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-400 text-xs font-medium uppercase tracking-wider">
                    <Clock size={14} />
                    <span>{product.durationMin} min</span>
                </div>
                
                {/* Margin Display for Professionals */}
                {(user.role === UserRole.ADMIN || user.role === UserRole.PROFESSIONAL) && (
                     <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                        <TrendingUp size={12} />
                        Lucro: R$ {margin}
                     </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-stone-200 dark:border-stone-700">
            <div className="bg-primary-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Novo Serviço</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Nome do Serviço</label>
                <input 
                  type="text" 
                  required
                  className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Preço Venda (R$)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Custo (R$)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct({...newProduct, cost: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

               <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Duração (min)</label>
                  <input 
                    type="number" 
                    required
                    className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border transition-colors"
                    value={newProduct.durationMin}
                    onChange={(e) => setNewProduct({...newProduct, durationMin: e.target.value})}
                  />
                </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Descrição</label>
                <textarea 
                  className="w-full rounded-xl border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white focus:ring-primary-500 focus:border-primary-500 p-2.5 outline-none border resize-none h-24 transition-colors"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary-200 dark:shadow-none transition-all"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;