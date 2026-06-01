param(
  [string]$DatabaseUrl = "postgresql://f1_app:f1_app_password@localhost:5432/f1_strategy"
)

Write-Host "Applying local seed data to $DatabaseUrl"
psql $DatabaseUrl -f "$PSScriptRoot\..\supabase\seed\0001_seed_demo.sql"

