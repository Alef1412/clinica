import React, { useEffect, useState } from 'react';
import { User, Transaction, UserRole } from '../types';
import { dataService } from '../services/mockDb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface FinancialProps {
  user: User;
}

const Financial: React.FC<FinancialProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    dataService.getTransactions(user).then(setTransactions);
  }, [user]);

  if (user.role === UserRole.PATIENT) {
    return <div className="text-center p-10 text-stone-500 dark:text-stone-400">Acesso negado.</div>;
  }

  const income = transactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expense;

  const dataPie = [
    { name: 'Entradas', value: income },
    { name: 'Saídas', value: expense },
  ];

  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-8">
       <div>
          <h2 className="text-2xl font-bold text-stone-800 dark:text-white">Financeiro</h2>
          <p className="text-stone-500 dark:text-stone-400">Controle de caixa e relatórios.</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center gap-4">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Receitas</p>
            <h3 className="text-2xl font-bold text-stone-800 dark:text-white">R$ {income.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center gap-4">
           <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
            <TrendingDown size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Despesas</p>
            <h3 className="text-2xl font-bold text-stone-800 dark:text-white">R$ {expense.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 flex items-center gap-4">
           <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Saldo Líquido</p>
            <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-500 dark:text-red-400'}`}>
              R$ {balance.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800">
          <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-6">Balanço Financeiro</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataPie}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {dataPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
                    backgroundColor: '#1c1917', 
                    color: '#fff'
                  }} 
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
               <span className="text-sm text-stone-600 dark:text-stone-400">Entradas</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
               <span className="text-sm text-stone-600 dark:text-stone-400">Saídas</span>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-800 overflow-hidden">
          <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-6">Últimas Transações</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {transactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-xl transition">
                <div>
                  <p className="font-medium text-stone-800 dark:text-stone-200 text-sm">{t.description}</p>
                  <p className="text-xs text-stone-400">{new Date(t.date).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Financial;