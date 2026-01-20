# Script PowerShell de verification de la migration Supabase
# Mboka Gospel - Migration Assistant

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mboka Gospel - Migration Supabase" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verification des fichiers necessaires
Write-Host "[*] Verification des fichiers..." -ForegroundColor Yellow
Write-Host ""

$files = @(
    "SUPABASE_CLEANUP.sql",
    "SUPABASE_FULL_SETUP.sql",
    "SUPABASE_SETUP_GUIDE.md",
    "SUPABASE_MIGRATION.md",
    "SUPABASE_CHECKLIST.md",
    "src\integrations\supabase\client.ts"
)

$allFilesExist = $true

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] $file (MANQUANT)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if (-not $allFilesExist) {
    Write-Host "[ERREUR] Certains fichiers sont manquants!" -ForegroundColor Red
    Write-Host "   Veuillez verifier que tous les fichiers ont ete crees correctement." -ForegroundColor Yellow
    exit 1
}

# Verification des credentials dans client.ts
Write-Host "[*] Verification des credentials Supabase..." -ForegroundColor Yellow
Write-Host ""

$clientContent = Get-Content "src\integrations\supabase\client.ts" -Raw

if ($clientContent -match "toeveqifqzdevwxzjgao") {
    Write-Host "   [OK] URL Supabase correcte (toeveqifqzdevwxzjgao)" -ForegroundColor Green
} else {
    Write-Host "   [ERREUR] URL Supabase incorrecte!" -ForegroundColor Red
    $allFilesExist = $false
}

if ($clientContent -match "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZXZlcWlmcXpkZXZ3eHpqZ2FvIi") {
    Write-Host "   [OK] Cle API Supabase correcte" -ForegroundColor Green
} else {
    Write-Host "   [ERREUR] Cle API Supabase incorrecte!" -ForegroundColor Red
    $allFilesExist = $false
}

Write-Host ""

# Verification de node_modules
Write-Host "[*] Verification des dependances..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path "node_modules") {
    Write-Host "   [OK] node_modules existe" -ForegroundColor Green
    
    if (Test-Path "node_modules\@supabase\supabase-js") {
        Write-Host "   [OK] @supabase/supabase-js installe" -ForegroundColor Green
    } else {
        Write-Host "   [ATTENTION] @supabase/supabase-js non trouve" -ForegroundColor Yellow
        Write-Host "      Executez: pnpm install" -ForegroundColor Cyan
    }
} else {
    Write-Host "   [ATTENTION] node_modules n'existe pas" -ForegroundColor Yellow
    Write-Host "      Executez: pnpm install" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resume de la Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($allFilesExist) {
    Write-Host "[OK] Tous les fichiers sont presents" -ForegroundColor Green
    Write-Host "[OK] Les credentials Supabase sont a jour" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "   1. Consultez SUPABASE_CHECKLIST.md pour la checklist complete" -ForegroundColor White
    Write-Host "   2. Suivez SUPABASE_SETUP_GUIDE.md pour configurer Supabase" -ForegroundColor White
    Write-Host "   3. Executez 'pnpm install' si ce n'est pas deja fait" -ForegroundColor White
    Write-Host "   4. Executez 'pnpm dev' pour demarrer l'application" -ForegroundColor White
    Write-Host ""
    Write-Host "[SUCCESS] Vous etes pret a migrer vers le nouveau projet Supabase!" -ForegroundColor Green
} else {
    Write-Host "[ERREUR] Des problemes ont ete detectes" -ForegroundColor Red
    Write-Host "   Veuillez corriger les erreurs ci-dessus avant de continuer." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Bonne migration!" -ForegroundColor Green
Write-Host ""
