param(
    [string]$message = "update"
)

git add .
git commit -m $message
git push

Write-Host "`nDeploy เสร็จแล้ว! Vercel กำลัง build อยู่ประมาณ 1-2 นาที" -ForegroundColor Green
