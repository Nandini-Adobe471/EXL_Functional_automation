$src  = "c:\EXLAutomationReportEnabled"
$dest = "C:\Users\Admin\OneDrive - HAYAGREEVA CONSULTING PVT LTD\Desktop\EXL-Automation-Framework"

# Create destination folder structure
New-Item -ItemType Directory -Force -Path $dest | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\tests" | Out-Null
New-Item -ItemType Directory -Force -Path "$dest\reports" | Out-Null

# Copy root config/doc files
Copy-Item "$src\config.js"                         "$dest\config.js"                         -Force
Copy-Item "$src\package.json"                      "$dest\package.json"                      -Force
Copy-Item "$src\playwright.config.js"              "$dest\playwright.config.js"              -Force
Copy-Item "$src\README.md"                         "$dest\README.md"                         -Force
Copy-Item "$src\PROJECT_FRAMEWORK_DOCUMENTATION.md" "$dest\PROJECT_FRAMEWORK_DOCUMENTATION.md" -Force
Copy-Item "$src\.gitignore"                        "$dest\.gitignore"                        -Force
Copy-Item "$src\figma-comparison-report.md"        "$dest\figma-comparison-report.md"        -Force
Copy-Item "$src\staging-vs-production-comparison-report.md" "$dest\staging-vs-production-comparison-report.md" -Force

# Copy tests folder (features + steps + anything else inside)
Copy-Item "$src\tests" -Destination "$dest\tests" -Recurse -Force

# Copy reports
Copy-Item "$src\reports\regression-automation-slide.html" "$dest\reports\regression-automation-slide.html" -Force
Copy-Item "$src\reports\custom-report.html"               "$dest\reports\custom-report.html"               -Force
Copy-Item "$src\reports\cucumber-report.html"             "$dest\reports\cucumber-report.html"             -Force
Copy-Item "$src\reports\EXLM-cohort-test-scenarios.md"    "$dest\reports\EXLM-cohort-test-scenarios.md"    -Force

# Copy the latest slide from Downloads
$dlSlide = "C:\Users\Admin\Downloads\regression-automation-slide.html"
if (Test-Path $dlSlide) {
    Copy-Item $dlSlide "$dest\reports\regression-automation-slide-latest.html" -Force
}

# Create ZIP on Desktop for easy sharing
$zip = "C:\Users\Admin\OneDrive - HAYAGREEVA CONSULTING PVT LTD\Desktop\EXL-Automation-Framework.zip"
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path $dest -DestinationPath $zip -Force

Write-Host "SUCCESS: Framework exported to Desktop folder and ZIP created."
Write-Host "Folder : $dest"
Write-Host "ZIP    : $zip"
