// CONFIGURAÇÃO DO SUPABASE - COLE SUAS INFOS AQUI!
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔽 COLE AQUI SUAS INFOS DO PASSO 4 🔽
const supabaseUrl = 'https://xpaiagpiqgavmdzxawdj.supabase.co'        // SEU URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwYWlhZ3BpcWdhdm1kenhhd2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODYwOTAsImV4cCI6MjA3OTA2MjA5MH0.RKTLjA_pdacL-LAaZLoU4N3jVUxGrrN87qPm0QVvA3g'                       // SUA CHAVE
// 🔼 COLE AQUI SUAS INFOS DO PASSO 4 🔼

// Cria a conexão com o banco
export const supabase = createClient(supabaseUrl, supabaseKey)

console.log('✅ Supabase conectado!')