const { supabase } = require('../config/supabase');
const debtsController = require('./debtsController');
const loansController = require('./loansController');

exports.getSavingsGoals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching savings goals:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createSavingsGoal = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('savings_goals')
      .insert([req.body])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating savings goal:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateSavingsGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('savings_goals')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating savings goal:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSavingsGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('savings_goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting savings goal:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.simulateGoal = async (req, res) => {
  const { targetType, targetId, monthlyContribution } = req.body;

  if (!targetType || !targetId || !monthlyContribution) {
    return res.status(400).json({ error: 'targetType, targetId, and monthlyContribution are required.' });
  }

  try {
    let targetAmount = 0;
    let targetName = '';
    let interestRate = 0;
    let hasOffer = false;
    let offerAmount = null;

    if (targetType === 'debt') {
      const { data: debt, error } = await supabase
        .from('credit_card_debts')
        .select('current_value, local, growth_percentage')
        .eq('id', targetId)
        .single();

      if (error) throw error;
      targetAmount = debt.current_value;
      targetName = debt.local;
      interestRate = debt.growth_percentage;
      
      const { data: offers } = await supabase
        .from('negotiation_offers')
        .select('offer_value, accepted')
        .eq('debt_id', targetId)
        .eq('accepted', false)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (offers && offers.length > 0) {
        hasOffer = true;
        offerAmount = offers[0].offer_value;
      }
    } else if (targetType === 'loan') {
      const { data: loan, error } = await supabase
        .from('loans')
        .select('remaining_value, creditor, interest_value, loan_value')
        .eq('id', targetId)
        .single();

      if (error) throw error;
      targetAmount = loan.remaining_value;
      targetName = loan.creditor;
      interestRate = (loan.interest_value / loan.loan_value) * 100;
    }

    const monthsToSave = Math.ceil(targetAmount / monthlyContribution);
    const monthlyInterestRate = interestRate / 12 / 100;
    const futureValue = targetAmount * Math.pow(1 + monthlyInterestRate, monthsToSave);
    const totalInterestGrowth = futureValue - targetAmount;

    const result = {
      targetName,
      targetAmount,
      monthlyContribution,
      monthsToSave,
      futureValue,
      totalInterestGrowth,
      hasOffer,
      offerAmount,
      recommendation: hasOffer && offerAmount < targetAmount 
        ? `Aceite a oferta de R$ ${offerAmount.toFixed(2)}! Economia de R$ ${(targetAmount - offerAmount).toFixed(2)}`
        : `Em ${monthsToSave} meses a dívida crescerá para R$ ${futureValue.toFixed(2)}. Considere negociar.`
    };

    res.json(result);
  } catch (error) {
    console.error('Error simulating goal:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.simulateAmortization = async (req, res) => {
  const { loanId, amortizationAmount } = req.body;

  try {
    const { data: loan, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single();

    if (error) throw error;

    const remainingInstallments = loan.total_installments - loan.paid_installments;
    const installmentValue = loan.final_value / loan.total_installments;
    const interestPerInstallment = (loan.interest_value / loan.total_installments);
    
    const installmentsSaved = Math.floor(amortizationAmount / installmentValue);
    const newRemainingInstallments = Math.max(0, remainingInstallments - installmentsSaved);
    const interestSaved = installmentsSaved * interestPerInstallment;

    res.json({
      loanName: loan.creditor,
      amortizationAmount,
      installmentsSaved,
      newRemainingInstallments,
      interestSaved,
      recommendation: `Antecipando ${installmentsSaved} parcelas, você economiza R$ ${interestSaved.toFixed(2)} em juros`
    });
  } catch (error) {
    console.error('Error simulating amortization:', error);
    res.status(500).json({ error: error.message });
  }
};
