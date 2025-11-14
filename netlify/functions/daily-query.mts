import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return new Response("Missing Supabase credentials", { status: 500 });
  }

  try {
    // Consulta dívidas de cartão
    const debtsResponse = await fetch(`${supabaseUrl}/rest/v1/credit_card_debts?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    // Consulta empréstimos
    const loansResponse = await fetch(`${supabaseUrl}/rest/v1/loans?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    const debts = await debtsResponse.json();
    const loans = await loansResponse.json();

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      debtsCount: debts.length,
      loansCount: loans.length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
};

export const config: Config = {
  schedule: "0 12 * * *" // Executa todo dia às 12:00 UTC (9h BRT)
};
