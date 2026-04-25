import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Lista de problemas óbvios no .env (URL/chave em falta ou típicos de exemplo). */
function collectSupabaseEnvIssues() {
  const issues = [];
  const url = supabaseUrl != null ? String(supabaseUrl).trim() : '';
  const key = supabaseAnonKey != null ? String(supabaseAnonKey).trim() : '';

  if (!url) {
    issues.push('VITE_SUPABASE_URL está vazio — defina o URL do projeto em .env (ex.: https://xxxx.supabase.co).');
  } else {
    if (!/^https?:\/\//i.test(url)) {
      issues.push('VITE_SUPABASE_URL deve começar por https:// (recomendado) ou http://.');
    } else {
      try {
        const parsed = new URL(url);
        if (!parsed.hostname) {
          issues.push('VITE_SUPABASE_URL não tem hostname válido.');
        }
      } catch {
        issues.push('VITE_SUPABASE_URL não é um URL válido.');
      }
    }
    if (/placeholder|your-project|example\.supabase/i.test(url)) {
      issues.push('VITE_SUPABASE_URL parece um valor de exemplo — use o URL em Project Settings → API.');
    }
  }

  if (!key) {
    issues.push('VITE_SUPABASE_ANON_KEY está vazio — copie a chave anon/public em Project Settings → API.');
  } else {
    const jwtParts = key.split('.');
    if (jwtParts.length !== 3) {
      issues.push(
        'VITE_SUPABASE_ANON_KEY não parece um JWT válido (esperadas 3 partes separadas por "."). Verifique se copiou a chave completa.'
      );
    } else if (key.length < 100) {
      issues.push(
        'VITE_SUPABASE_ANON_KEY parece curta demais para uma chave anon do Supabase — confirme que colou a totalidade.'
      );
    }
    if (/placeholder|your-anon-key|changeme/i.test(key)) {
      issues.push('VITE_SUPABASE_ANON_KEY parece um placeholder — substitua pela chave real do projeto.');
    }
    if (!key.startsWith('eyJ')) {
      issues.push(
        'VITE_SUPABASE_ANON_KEY não começa por "eyJ" (formato JWT). Confirme que colou a chave "anon public" e não a service_role.'
      );
    }
  }

  return issues;
}

export const supabaseEnvIssues = collectSupabaseEnvIssues();

if (import.meta.env.DEV && supabaseEnvIssues.length > 0) {
  console.warn('[Supabase .env]', supabaseEnvIssues.join(' '));
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
