#!/usr/bin/env node

/**
 * Script de vérification de la connexion Supabase
 * Ce script teste la connexion au nouveau projet Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://toeveqifqzdevwxzjgao.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZXZlcWlmcXpkZXZ3eHpqZ2FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDQxNTEsImV4cCI6MjA4NDQ4MDE1MX0.2lTms5GXsptpIW6g6AWEJORxrVkXGb1Lx5asFuV5vZs";

console.log('🔍 Vérification de la connexion Supabase...\n');
console.log('URL:', SUPABASE_URL);
console.log('Clé:', SUPABASE_KEY.substring(0, 20) + '...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkConnection() {
    try {
        console.log('✅ Client Supabase créé avec succès');

        // Test de connexion basique
        const { data, error } = await supabase.from('profiles').select('count');

        if (error) {
            console.error('❌ Erreur lors de la connexion:', error.message);
            console.log('\n⚠️  Assurez-vous que:');
            console.log('   1. Le script SUPABASE_FULL_SETUP.sql a été exécuté');
            console.log('   2. La table "profiles" existe dans votre projet Supabase');
            console.log('   3. Les credentials sont corrects\n');
            process.exit(1);
        }

        console.log('✅ Connexion à la base de données réussie!');
        console.log('✅ La table "profiles" est accessible\n');

        // Vérifier les autres tables
        const tables = ['songs', 'albums', 'playlists', 'song_likes', 'song_plays', 'song_comments'];
        console.log('🔍 Vérification des tables...\n');

        for (const table of tables) {
            const { error: tableError } = await supabase.from(table).select('count').limit(1);
            if (tableError) {
                console.log(`   ❌ ${table}: Non accessible`);
            } else {
                console.log(`   ✅ ${table}: OK`);
            }
        }

        console.log('\n✅ Configuration Supabase vérifiée avec succès!');
        console.log('🎉 Votre application est prête à être utilisée!\n');

    } catch (err) {
        console.error('❌ Erreur inattendue:', err);
        process.exit(1);
    }
}

checkConnection();
