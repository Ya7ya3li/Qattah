import React from 'react';
import { motion } from 'framer-motion';
import GlassCard from '../components/ui/GlassCard';

// الشاشة الآن تستقبل (expenses) من الذاكرة المركزية
const Home = ({ expenses }) => {
  return (
    <div className="flex flex-col gap-4 px-6 pb-32 pt-4">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-2">
        <h2 className="text-gray-300 text-lg font-bold">أحدث الفواتير</h2>
        <p className="text-gray-500 text-sm">راجع الفواتير وصيد اللي يهايط 👀</p>
      </motion.div>

      {/* لو مافيه فواتير، نطلع رسالة طقطقة، ولو فيه نعرضها */}
      {expenses.length === 0 ? (
        <div className="text-center mt-10">
           <p className="text-gray-500 text-lg">ما فيه ولا فاتورة لسه..</p>
           <p className="text-gray-600 text-sm mt-2">الشلة مطفرين ولا وش الوضع؟ 😂</p>
        </div>
      ) : (
        expenses.map((expense, index) => (
          <motion.div key={expense.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <GlassCard {...expense} />
          </motion.div>
        ))
      )}
    </div>
  );
};

export default Home;