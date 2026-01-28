# Test script for syncing data from OpenData APIs
Write-Host "🚀 Iniciando sincronización completa de datos..." -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/sync/all" -Method POST -ErrorAction Stop
    
    $result = $response.Content | ConvertFrom-Json
    
    Write-Host "✅ Sincronización completada!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Resultados:" -ForegroundColor Yellow
    Write-Host "  Parlamentarios sincronizados: $($result.data.parliamentarians)" -ForegroundColor White
    Write-Host "  Proyectos de ley sincronizados: $($result.data.bills)" -ForegroundColor White
    Write-Host ""
    
    if ($result.data.errors.Count -gt 0) {
        Write-Host "⚠️ Errores encontrados:" -ForegroundColor Red
        $result.data.errors | ForEach-Object { 
            Write-Host "  - $_" -ForegroundColor Red
        }
    }
    else {
        Write-Host "🎉 No se encontraron errores!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Verifica los datos en:" -ForegroundColor Cyan
    Write-Host "  - Supabase Table Editor: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  - Dashboard local: http://localhost:3000" -ForegroundColor White
    
}
catch {
    Write-Host "❌ Error al ejecutar la sincronización:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "  1. El servidor este corriendo (npm run dev)" -ForegroundColor White
    Write-Host "  2. El schema SQL haya sido ejecutado en Supabase" -ForegroundColor White
    Write-Host "  3. SUPABASE_SERVICE_ROLE_KEY este configurado en .env.local" -ForegroundColor White
}
