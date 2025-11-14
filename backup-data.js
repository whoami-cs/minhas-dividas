const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './api/.env' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function backupData() {
  console.log('Iniciando backup dos dados...\n');

  // Backup de dívidas de cartão de crédito
  const { data: debts, error: debtsError } = await supabase
    .from('credit_card_debts')
    .select('*')
    .order('id');

  if (debtsError) {
    console.error('Erro ao buscar dívidas:', debtsError);
    return;
  }

  // Backup de empréstimos
  const { data: loans, error: loansError } = await supabase
    .from('loans')
    .select('*')
    .order('id');

  if (loansError) {
    console.error('Erro ao buscar empréstimos:', loansError);
    return;
  }

  // Backup de ofertas de negociação
  const { data: offers, error: offersError } = await supabase
    .from('negotiation_offers')
    .select('*')
    .order('id');

  if (offersError) {
    console.error('Erro ao buscar ofertas:', offersError);
    return;
  }

  // Gerar SQL
  let sql = '-- Backup dos dados - ' + new Date().toISOString() + '\n\n';

  // Dívidas de cartão de crédito
  if (debts && debts.length > 0) {
    sql += '-- Dívidas de Cartão de Crédito\n';
    sql += 'INSERT INTO public.credit_card_debts (id, local, debt_date, original_value, current_value, growth_percentage, interest_value, last_update_date, next_month_estimate, observation, negotiated, discount_percentage, paid_value, receipt_url, is_frozen, user_id) VALUES\n';
    
    const debtValues = debts.map(d => {
      const values = [
        d.id,
        d.local ? `'${d.local.replace(/'/g, "''")}'` : 'NULL',
        d.debt_date ? `'${d.debt_date}'` : 'NULL',
        d.original_value || 'NULL',
        d.current_value || 'NULL',
        d.growth_percentage || 'NULL',
        d.interest_value || 'NULL',
        d.last_update_date ? `'${d.last_update_date}'` : 'NULL',
        d.next_month_estimate || 'NULL',
        d.observation ? `'${d.observation.replace(/'/g, "''")}'` : 'NULL',
        d.negotiated || false,
        d.discount_percentage || 'NULL',
        d.paid_value || 'NULL',
        d.receipt_url ? `'${d.receipt_url}'` : 'NULL',
        d.is_frozen || false,
        d.user_id ? `'${d.user_id}'` : 'NULL'
      ];
      return `(${values.join(', ')})`;
    });
    
    sql += debtValues.join(',\n') + ';\n\n';
  }

  // Empréstimos
  if (loans && loans.length > 0) {
    sql += '-- Empréstimos\n';
    sql += 'INSERT INTO public.loans (id, contract_number, loan_date, creditor, loan_value, interest_value, final_value, total_installments, paid_installments, remaining_installments, remaining_value, last_payment_date, status, observations, installments, balance_evolution, user_id) VALUES\n';
    
    const loanValues = loans.map(l => {
      const values = [
        l.id,
        l.contract_number ? `'${l.contract_number}'` : 'NULL',
        l.loan_date ? `'${l.loan_date}'` : 'NULL',
        l.creditor ? `'${l.creditor.replace(/'/g, "''")}'` : 'NULL',
        l.loan_value || 'NULL',
        l.interest_value || 'NULL',
        l.final_value || 'NULL',
        l.total_installments || 'NULL',
        l.paid_installments || 'NULL',
        l.remaining_installments || 'NULL',
        l.remaining_value || 'NULL',
        l.last_payment_date ? `'${l.last_payment_date}'` : 'NULL',
        l.status ? `'${l.status}'` : 'NULL',
        l.observations ? `'${l.observations.replace(/'/g, "''")}'` : 'NULL',
        l.installments ? `'${JSON.stringify(l.installments).replace(/'/g, "''")}'::jsonb` : 'NULL',
        l.balance_evolution ? `'${JSON.stringify(l.balance_evolution).replace(/'/g, "''")}'::jsonb` : 'NULL',
        l.user_id ? `'${l.user_id}'` : 'NULL'
      ];
      return `(${values.join(', ')})`;
    });
    
    sql += loanValues.join(',\n') + ';\n\n';
  }

  // Ofertas de negociação
  if (offers && offers.length > 0) {
    sql += '-- Ofertas de Negociação\n';
    sql += 'INSERT INTO public.negotiation_offers (id, debt_id, offer_date, original_value, discount_percentage, offer_value, accepted, notes) VALUES\n';
    
    const offerValues = offers.map(o => {
      const values = [
        o.id,
        o.debt_id,
        o.offer_date ? `'${o.offer_date}'` : 'NULL',
        o.original_value || 'NULL',
        o.discount_percentage || 'NULL',
        o.offer_value || 'NULL',
        o.accepted || false,
        o.notes ? `'${o.notes.replace(/'/g, "''")}'` : 'NULL'
      ];
      return `(${values.join(', ')})`;
    });
    
    sql += offerValues.join(',\n') + ';\n\n';
  }

  // Resetar sequences
  sql += '-- Resetar sequences\n';
  if (debts && debts.length > 0) {
    const maxDebtId = Math.max(...debts.map(d => d.id));
    sql += `SELECT setval('credit_card_debts_id_seq', ${maxDebtId}, true);\n`;
  }
  if (loans && loans.length > 0) {
    const maxLoanId = Math.max(...loans.map(l => l.id));
    sql += `SELECT setval('loans_id_seq', ${maxLoanId}, true);\n`;
  }
  if (offers && offers.length > 0) {
    const maxOfferId = Math.max(...offers.map(o => o.id));
    sql += `SELECT setval('negotiation_offers_id_seq', ${maxOfferId}, true);\n`;
  }

  console.log('Backup gerado com sucesso!');
  console.log(`- ${debts?.length || 0} dívidas de cartão de crédito`);
  console.log(`- ${loans?.length || 0} empréstimos`);
  console.log(`- ${offers?.length || 0} ofertas de negociação\n`);

  return sql;
}

backupData().then(sql => {
  if (sql) {
    const fs = require('fs');
    fs.writeFileSync('./backup_data.sql', sql);
    console.log('Arquivo salvo em: backup_data.sql');
  }
}).catch(err => {
  console.error('Erro:', err);
});
