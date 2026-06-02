$code = Read-Host "Cole o codigo aqui"

$clientId = "7d83b5cfbdec581b948a1e1944cec3f2d00f20b6"
$clientSecret = "4059dc377027aa21cb514b6664bb32ebc99a4ecb5f64ae4898549052f004"
$bytes = [System.Text.Encoding]::UTF8.GetBytes("${clientId}:${clientSecret}")
$base64 = [Convert]::ToBase64String($bytes)

$body = "grant_type=authorization_code&code=$code&redirect_uri=https://parana-store.vercel.app"

$response = Invoke-RestMethod -Method POST -Uri "https://www.bling.com.br/Api/v3/oauth/token" -Headers @{"Authorization"="Basic $base64"; "Content-Type"="application/x-www-form-urlencoded"} -Body $body
$response | ConvertTo-Json