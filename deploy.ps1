param(
    [string]$message = "update"
)

Write-Host "`n📦 กำลัง push โค้ดขึ้น GitHub..." -ForegroundColor Cyan
git add .
git commit -m $message
git push

Write-Host "`n🚀 กำลัง deploy ขึ้น Vercel..." -ForegroundColor Cyan
vercel --prod --yes 2>&1 | Tee-Object -Variable deployOutput

$prodUrl = ($deployOutput | Select-String "Production:").ToString().Trim() -replace ".*Production:\s*", ""
if ($prodUrl) {
    Write-Host "`n✅ Deploy สำเร็จ!" -ForegroundColor Green
    Write-Host "🌐 URL: $prodUrl" -ForegroundColor Green
} else {
    Write-Host "`n✅ Deploy เสร็จแล้ว — ดูสถานะได้ที่ https://vercel.com/wecraftabroad51-s-projects/wecrafttravel" -ForegroundColor Green
}
Write-Host ""
