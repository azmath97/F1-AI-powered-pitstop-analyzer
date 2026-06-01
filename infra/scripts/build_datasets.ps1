param(
  [string]$DatabaseUrl = "postgresql+asyncpg://f1_app:f1_app_password@localhost:5432/f1_strategy",
  [string]$OutputDir = "datasets/processed",
  [string]$ReportDir = "datasets/reports"
)

python -m f1_strategy_ml.cli `
  --database-url $DatabaseUrl `
  --output-dir $OutputDir `
  --report-dir $ReportDir

