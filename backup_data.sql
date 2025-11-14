-- Backup dos dados - 2025-11-13T20:17:44.075Z

-- Dívidas de Cartão de Crédito
INSERT INTO public.credit_card_debts (id, local, debt_date, original_value, current_value, growth_percentage, interest_value, last_update_date, next_month_estimate, observation, negotiated, discount_percentage, paid_value, receipt_url, is_frozen, user_id) VALUES
(1, 'Ourocard Visa Gold', '10/12/2024', 9239.71, 16064.65, 73.87, 6824.94, '10/11/2025', 16880.41, NULL, false, NULL, NULL, NULL, false, 'bdea2544-830b-4631-bd9c-b6ae670bd0b4'),
(2, 'Nubank', '11/11/2024', 4616.38, 18296.36, 296.34, 13679.98, '10/11/2025', 20495.36, NULL, false, NULL, NULL, 'https://qxoyjkalmseronmjaiff.supabase.co/storage/v1/object/public/attachments/debt-receipts/2_1763040708373.pdf', false, 'bdea2544-830b-4631-bd9c-b6ae670bd0b4'),
(3, 'Santander Free Visa', '13/12/2024', 1807.14, 3372, 86.59, 1564.86, '10/11/2025', 3567.52, NULL, false, NULL, NULL, NULL, false, 'bdea2544-830b-4631-bd9c-b6ae670bd0b4'),
(4, 'XP', '10/11/2024', 4349.14, 6028.18, 38.61, 1679.04, '10/11/2025', NULL, NULL, false, NULL, NULL, NULL, true, 'bdea2544-830b-4631-bd9c-b6ae670bd0b4'),
(5, 'Mercado Pago', '11/11/2024', 3500, 8136.15, 132.46, 4636.15, '04/10/2025', 8790.81, NULL, false, NULL, NULL, NULL, false, 'bdea2544-830b-4631-bd9c-b6ae670bd0b4'),
(6, 'Sofisa', '15/11/2024', 4200, 6964.46, 65.82, 2764.46, '10/11/2025', 7264.25, NULL, false, NULL, NULL, NULL, false, 'bdea2544-830b-4631-bd9c-b6ae670bd0b4'),
(7, 'Will Bank', '10/12/2024', 3100.8, 6201.6, 100, 3100.8, '11/11/2025', NULL, NULL, false, NULL, NULL, NULL, true, 'bdea2544-830b-4631-bd9c-b6ae670bd0b4');

-- Empréstimos
INSERT INTO public.loans (id, contract_number, loan_date, creditor, loan_value, interest_value, final_value, total_installments, paid_installments, remaining_installments, remaining_value, last_payment_date, status, observations, installments, balance_evolution, user_id) VALUES
(21, '1', '13/11/2025', '1', 1, 1, 2, 1, NULL, 1, 2, NULL, 'Ativo', NULL, '[]'::jsonb, '[]'::jsonb, 'bdea2544-830b-4631-bd9c-b6ae670bd0b4');

-- Ofertas de Negociação
INSERT INTO public.negotiation_offers (id, debt_id, offer_date, original_value, discount_percentage, offer_value, accepted, notes) VALUES
(1, 1, '12/11/2025', 1, 0.01, 1, false, '1'),
(2, 4, '10/11/2025', 6028.18, 95, 506.66, false, 'Via app XP'),
(4, 3, '12/11/2025', 3381.05, 85, 507.16, false, 'https://negocie.quiteja.com.br/negociacao/divida?id=Mzk1MDU1NTY4');

-- Resetar sequences
SELECT setval('credit_card_debts_id_seq', 7, true);
SELECT setval('loans_id_seq', 21, true);
SELECT setval('negotiation_offers_id_seq', 4, true);
