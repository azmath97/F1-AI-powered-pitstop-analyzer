param(
  [string]$Source = "both",
  [int]$StartYear = 2018,
  [int]$EndYear = 2026,
  [switch]$NoTelemetry
)

$telemetryFlag = @()
if ($NoTelemetry) {
  $telemetryFlag = @("--no-telemetry")
}

python -m app.data_engineering.cli `
  --source $Source `
  --start-year $StartYear `
  --end-year $EndYear `
  --sessions practice qualifying sprint race `
  @telemetryFlag

