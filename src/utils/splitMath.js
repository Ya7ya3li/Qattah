export const calculateDebts = (expenses) => {
  if (!expenses || expenses.length === 0) return null;

  const balances = {}; // لتسجيل رصيد كل شخص (موجب = يطلبهم، سالب = مديون)
  let totalSpent = 0;

  // 1. حساب الفلوس لكل شخص بناءً على فواتيره والمشاركين معه
  expenses.forEach(exp => {
    const payer = exp.payer;
    const amount = exp.amount;
    const involved = exp.involved || [payer];
    
    // الدافع يضاف له المبلغ في رصيده (يطلب الناس)
    if (!balances[payer]) balances[payer] = 0;
    balances[payer] += amount;
    totalSpent += amount;

    // نقسم المبلغ على المشاركين ونخصمه من رصيدهم (ديون عليهم)
    const splitAmount = amount / involved.length;
    involved.forEach(person => {
      if (!balances[person]) balances[person] = 0;
      balances[person] -= splitAmount;
    });
  });

  const users = Object.keys(balances);
  if (users.length <= 1) return { totalSpent, users, isSingle: true };

  // 2. تحديد الشيخ والمطفر
  let sheikh = { name: '', amount: -1 };
  let mutaffir = { name: '', amount: Infinity };

  users.forEach(user => {
    const bal = balances[user];
    if (bal > sheikh.amount) sheikh = { name: user, amount: bal }; // أعلى رصيد موجب
    if (bal < mutaffir.amount) mutaffir = { name: user, amount: bal }; // أقل رصيد سالب
  });

  // 3. خوارزمية تصفية الديون الذكية (مين يحول لمين)
  let debtors = users.filter(u => balances[u] < -0.01).map(u => ({ name: u, debt: Math.abs(balances[u]) }));
  let creditors = users.filter(u => balances[u] > 0.01).map(u => ({ name: u, credit: balances[u] }));

  const transactions = [];
  let d = 0, c = 0;

  while (d < debtors.length && c < creditors.length) {
    let debtor = debtors[d];
    let creditor = creditors[c];
    let amountToSettle = Math.min(debtor.debt, creditor.credit);
    
    transactions.push({
      from: debtor.name,
      to: creditor.name,
      amount: amountToSettle.toFixed(2)
    });

    debtor.debt -= amountToSettle;
    creditor.credit -= amountToSettle;

    if (debtor.debt < 0.01) d++;
    if (creditor.credit < 0.01) c++;
  }

  return { totalSpent, sheikh, mutaffir, transactions, isSingle: false };
};