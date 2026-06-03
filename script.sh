$packageFolder = "C:\Users\Admin\AppData\Local\Packages"
$packages = Get-ChildItem -Path $packageFolder | Where-Object { ($_.Name -Match "Microsoft.AAD.BrokerPlugin") -or ($_.Name -Match "AuthHost") }  | select -expand Name

foreach ($package in $packages)
{    
  Write-Host "Creating loopback exemption for" $package    
  $command = "CheckNetIsolation.exe LoopbackExempt -a -n=" + $package    
  cmd.exe /c $command
}